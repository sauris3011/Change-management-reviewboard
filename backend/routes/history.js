/**
 * History API Routes
 */

const express = require('express');
const router = express.Router();
const Database = require('../database/db');
const { getRiskBand } = require('../services/riskScorer');

/**
 * GET /api/v1/changes/history
 * Get historical changes with optional filters
 */
router.get('/history', async (req, res) => {
  try {
    const db = new Database();

    // Auto-transition: promote pending changes older than 1 day to historical
    await db.run(`
      UPDATE changes SET final_outcome = 'success', updated_at = CURRENT_TIMESTAMP
      WHERE final_outcome IS NULL AND submitted_at <= datetime('now', '-1 day')
    `);

    // Extract query parameters for filtering
    const {
      status,
      outcome,
      category,
      type,
      complexity,
      limit = 500,
      offset = 0
    } = req.query;

    // Build query with filters
    let query = `
      SELECT c.*, p.risk_score, p.probabilities, p.prediction_id
      FROM changes c
      LEFT JOIN predictions p ON c.change_id = p.change_id
      WHERE 1=1
    `;

    const params = [];

    // Filter by lifecycle status: 'pending' (new changes) vs 'historical' (completed)
    if (status === 'pending') {
      query += ` AND c.final_outcome IS NULL`;
    } else if (status === 'historical') {
      query += ` AND c.final_outcome IS NOT NULL`;
    }

    if (outcome) {
      query += ` AND c.final_outcome = ?`;
      params.push(outcome);
    }

    if (category) {
      query += ` AND c.change_category = ?`;
      params.push(category);
    }

    if (type) {
      query += ` AND c.change_type = ?`;
      params.push(type);
    }

    if (complexity) {
      query += ` AND c.complexity = ?`;
      params.push(complexity);
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const changes = await db.query(query, params);

    // Format response
    const formattedChanges = changes.map(change => ({
      change_id: change.change_id,
      short_description: change.short_description,
      change_type: change.change_type,
      change_category: change.change_category,
      complexity: change.complexity,
      impacted_services: JSON.parse(change.impacted_services || '[]'),
      planned_window: change.planned_window,
      final_outcome: change.final_outcome,
      failure_reason_code: change.failure_reason_code,
      risk_score: change.risk_score,
      risk_band: change.risk_score ? getRiskBand(change.risk_score).level : null,
      prediction_id: change.prediction_id,
      assignee: change.assignee,
      submitted_at: change.submitted_at,
      created_at: change.created_at
    }));

    // Get total count for pagination (with same filters)
    let countQuery = `SELECT COUNT(*) as total FROM changes c WHERE 1=1`;
    const countParams = [];

    if (status === 'pending') {
      countQuery += ` AND c.final_outcome IS NULL`;
    } else if (status === 'historical') {
      countQuery += ` AND c.final_outcome IS NOT NULL`;
    }

    if (outcome) {
      countQuery += ` AND c.final_outcome = ?`;
      countParams.push(outcome);
    }
    if (category) {
      countQuery += ` AND c.change_category = ?`;
      countParams.push(category);
    }
    if (type) {
      countQuery += ` AND c.change_type = ?`;
      countParams.push(type);
    }
    if (complexity) {
      countQuery += ` AND c.complexity = ?`;
      countParams.push(complexity);
    }

    const countResult = await db.get(countQuery, countParams);

    res.json({
      changes: formattedChanges,
      pagination: {
        total: countResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: countResult.total > (parseInt(offset) + formattedChanges.length)
      },
      filters: {
        status,
        outcome,
        category,
        type,
        complexity
      }
    });

  } catch (error) {
    console.error('Error retrieving change history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/changes/:id
 * Get details of a specific change
 */
router.get('/:id', async (req, res) => {
  try {
    const db = new Database();
    const { id } = req.params;

    const change = await db.get(
      `SELECT c.*, p.risk_score, p.probabilities, p.drivers, p.recommendations, p.prediction_id
       FROM changes c
       LEFT JOIN predictions p ON c.change_id = p.change_id
       WHERE c.change_id = ?`,
      [id]
    );

    if (!change) {
      return res.status(404).json({
        error: 'Change not found',
        change_id: id
      });
    }

    // Format response
    const response = {
      change_id: change.change_id,
      short_description: change.short_description,
      long_description: change.long_description,
      change_type: change.change_type,
      change_category: change.change_category,
      complexity: change.complexity,
      impacted_services: JSON.parse(change.impacted_services || '[]'),
      implementation_steps: JSON.parse(change.implementation_steps || '[]'),
      validation_steps: JSON.parse(change.validation_steps || '[]'),
      rollback_plan: change.rollback_plan,
      planned_window: change.planned_window,
      rollback_quality_score: change.rollback_quality_score,
      evidence_score: change.evidence_score,
      final_outcome: change.final_outcome,
      failure_reason_code: change.failure_reason_code,
      created_at: change.created_at,
      updated_at: change.updated_at
    };

    // Add prediction data if available
    if (change.prediction_id) {
      response.prediction = {
        prediction_id: change.prediction_id,
        risk_score: change.risk_score,
        risk_band: getRiskBand(change.risk_score).level,
        probabilities: JSON.parse(change.probabilities || '{}'),
        drivers: JSON.parse(change.drivers || '[]'),
        recommendations: JSON.parse(change.recommendations || '[]')
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Error retrieving change:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/changes/stats/summary
 * Get summary statistics for changes
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const db = new Database();

    // Get outcome distribution
    const outcomes = await db.query(`
      SELECT final_outcome, COUNT(*) as count
      FROM changes
      WHERE final_outcome IS NOT NULL
      GROUP BY final_outcome
    `);

    // Get category distribution
    const categories = await db.query(`
      SELECT change_category, COUNT(*) as count
      FROM changes
      GROUP BY change_category
    `);

    // Get risk band distribution for changes with predictions
    const riskBands = await db.query(`
      SELECT
        CASE
          WHEN risk_score <= 30 THEN 'Low'
          WHEN risk_score <= 55 THEN 'Medium'
          WHEN risk_score <= 75 THEN 'High'
          ELSE 'Critical'
        END as risk_band,
        COUNT(*) as count
      FROM predictions
      GROUP BY risk_band
    `);

    // Get recent changes count
    const recentCount = await db.get(`
      SELECT COUNT(*) as count
      FROM changes
      WHERE created_at >= datetime('now', '-30 days')
    `);

    res.json({
      total_changes: outcomes.reduce((sum, o) => sum + o.count, 0) + (await db.get('SELECT COUNT(*) as count FROM changes WHERE final_outcome IS NULL')).count,
      outcome_distribution: outcomes.reduce((acc, o) => {
        acc[o.final_outcome] = o.count;
        return acc;
      }, {}),
      category_distribution: categories.reduce((acc, c) => {
        acc[c.change_category] = c.count;
        return acc;
      }, {}),
      risk_band_distribution: riskBands.reduce((acc, r) => {
        acc[r.risk_band] = r.count;
        return acc;
      }, {}),
      recent_changes_30d: recentCount.count
    });

  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
