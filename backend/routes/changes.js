/**
 * Changes API Routes
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('../database/db');
const { extractEntities, calculateBlastRadius } = require('../services/entityExtractor');
const { calculateFeatures } = require('../services/featureEngine');
const { calculateProbabilities, calculateRiskScore, getRiskBand, findSimilarChanges } = require('../services/riskScorer');
const { generateRiskAssessment } = require('../services/llmService');

/**
 * POST /api/v1/evaluate-change
 * Evaluate a new change request and return risk assessment
 */
router.post('/evaluate-change', async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate required fields
    const { short_description, change_type, change_category } = req.body;

    if (!short_description || !change_type || !change_category) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['short_description', 'change_type', 'change_category']
      });
    }

    const db = new Database();

    // Step 1: Extract entities from change description
    const changeData = {
      short_description: req.body.short_description,
      long_description: req.body.long_description || '',
      change_type: req.body.change_type,
      change_category: req.body.change_category,
      complexity: req.body.complexity,
      implementation_steps: req.body.implementation_steps || [],
      validation_steps: req.body.validation_steps || [],
      rollback_plan: req.body.rollback_plan || '',
      planned_window: req.body.planned_window,
      impacted_services: req.body.impacted_services || []
    };

    const entities = extractEntities(changeData);

    // Merge extracted data
    changeData.services = entities.services.length > 0 ? entities.services : changeData.impacted_services;
    changeData.awsComponents = entities.awsComponents;
    changeData.complexity = entities.complexity;
    changeData.dbMigrationFlag = entities.dbMigrationFlag;

    // Step 2: Calculate blast radius
    const blastRadiusScore = calculateBlastRadius(changeData.services, changeData.awsComponents);

    // Step 3: Find similar historical changes
    const historicalChanges = await db.query(
      `SELECT * FROM changes WHERE final_outcome IS NOT NULL ORDER BY created_at DESC LIMIT 50`
    );

    const similarChanges = findSimilarChanges(changeData, historicalChanges, 5);

    // Get relevant historical changes for feature calculation
    const relevantHistory = historicalChanges.filter(change => {
      try {
        const changeServices = JSON.parse(change.impacted_services || '[]');
        return changeServices.some(svc => changeData.services.includes(svc)) ||
               change.change_category === changeData.change_category;
      } catch (e) {
        return false;
      }
    }).slice(0, 10);

    // Step 4: Calculate risk features
    const features = calculateFeatures(changeData, relevantHistory);

    // Step 5: Calculate probabilities
    const probabilities = calculateProbabilities(features, blastRadiusScore);

    // Step 6: Calculate risk score
    const riskScore = calculateRiskScore(probabilities, features, blastRadiusScore);
    const riskBand = getRiskBand(riskScore);

    // Step 7: Generate LLM explanation
    const llmAssessment = await generateRiskAssessment(
      changeData,
      features,
      probabilities,
      similarChanges,
      blastRadiusScore
    );

    // Generate change ID
    const changeId = `CHG${Date.now().toString().slice(-6)}`;
    const predictionId = uuidv4();

    // Step 8: Store change in database
    const submittedAt = new Date().toISOString();
    await db.run(
      `INSERT INTO changes (
        change_id, short_description, long_description, change_type,
        change_category, complexity, impacted_services, implementation_steps,
        validation_steps, rollback_plan, planned_window, rollback_quality_score,
        evidence_score, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        changeId,
        changeData.short_description,
        changeData.long_description,
        changeData.change_type,
        changeData.change_category,
        changeData.complexity,
        JSON.stringify(changeData.services),
        JSON.stringify(changeData.implementation_steps),
        JSON.stringify(changeData.validation_steps),
        changeData.rollback_plan,
        changeData.planned_window,
        features.rollback_quality_score,
        features.evidence_score,
        submittedAt
      ]
    );

    // Step 9: Store prediction
    await db.run(
      `INSERT INTO predictions (
        prediction_id, change_id, risk_score, probabilities, drivers,
        positive_signals, missing_evidence, recommendations, retrieved_change_ids,
        model_version, llm_model, feature_vector
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        predictionId,
        changeId,
        riskScore,
        JSON.stringify(probabilities),
        JSON.stringify(llmAssessment.drivers || []),
        JSON.stringify(llmAssessment.positive_signals || []),
        JSON.stringify(llmAssessment.missing_evidence || []),
        JSON.stringify(llmAssessment.recommendations || []),
        JSON.stringify(similarChanges.map(c => c.change_id)),
        'v1.0.0',
        'gpt-4',
        JSON.stringify(features)
      ]
    );

    const endTime = Date.now();

    // Return complete assessment
    const response = {
      evaluation_id: predictionId,
      change_id: changeId,
      status: 'completed',
      result: {
        risk_score: riskScore,
        risk_band: riskBand.level,
        risk_color: riskBand.color,
        probabilities: probabilities,
        blast_radius_score: blastRadiusScore,
        features: {
          complexity_score: features.complexity_score,
          evidence_score: features.evidence_score,
          rollback_quality_score: features.rollback_quality_score,
          historical_failure_rate: features.historical_failure_rate,
          is_peak_hours: features.is_peak_hours
        },
        drivers: llmAssessment.drivers || [],
        positive_signals: llmAssessment.positive_signals || [],
        missing_evidence: llmAssessment.missing_evidence || [],
        recommendations: llmAssessment.recommendations || [],
        similar_changes: similarChanges,
        extracted_entities: {
          services: changeData.services,
          aws_components: changeData.awsComponents,
          db_migration_flag: changeData.dbMigrationFlag
        },
        metadata: {
          model_version: 'v1.0.0',
          llm_model: 'gpt-4',
          evaluation_time_ms: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error evaluating change:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/predictions/:id
 * Retrieve a specific prediction by ID
 */
router.get('/predictions/:id', async (req, res) => {
  try {
    const db = new Database();
    const { id } = req.params;

    // Try lookup by prediction_id first, then fall back to change_id
    let prediction = await db.get(
      `SELECT p.*, c.*
       FROM predictions p
       JOIN changes c ON p.change_id = c.change_id
       WHERE p.prediction_id = ?`,
      [id]
    );

    if (!prediction) {
      prediction = await db.get(
        `SELECT p.*, c.*
         FROM predictions p
         JOIN changes c ON p.change_id = c.change_id
         WHERE p.change_id = ?
         ORDER BY p.created_at DESC
         LIMIT 1`,
        [id]
      );
    }

    if (!prediction) {
      return res.status(404).json({
        error: 'Prediction not found',
        prediction_id: id
      });
    }

    // Parse JSON fields
    const response = {
      prediction_id: prediction.prediction_id,
      change_id: prediction.change_id,
      risk_score: prediction.risk_score,
      risk_band: getRiskBand(prediction.risk_score).level,
      risk_color: getRiskBand(prediction.risk_score).color,
      probabilities: JSON.parse(prediction.probabilities),
      drivers: JSON.parse(prediction.drivers || '[]'),
      positive_signals: JSON.parse(prediction.positive_signals || '[]'),
      missing_evidence: JSON.parse(prediction.missing_evidence || '[]'),
      recommendations: JSON.parse(prediction.recommendations || '[]'),
      similar_changes: JSON.parse(prediction.retrieved_change_ids || '[]'),
      change_details: {
        short_description: prediction.short_description,
        long_description: prediction.long_description,
        change_type: prediction.change_type,
        change_category: prediction.change_category,
        complexity: prediction.complexity,
        impacted_services: JSON.parse(prediction.impacted_services || '[]'),
        implementation_steps: JSON.parse(prediction.implementation_steps || '[]'),
        validation_steps: JSON.parse(prediction.validation_steps || '[]'),
        rollback_plan: prediction.rollback_plan,
        planned_window: prediction.planned_window
      },
      metadata: {
        model_version: prediction.model_version,
        llm_model: prediction.llm_model,
        created_at: prediction.created_at
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error retrieving prediction:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
