/**
 * Simplified Bulk Upload Service
 * Processes changes with basic risk scoring for MVP
 * Version: 2.0 - Updated risk scoring (2024-02-14)
 */

const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Database = require('../database/db');

// Valid enum values
const VALID_CHANGE_TYPES = ['standard', 'normal', 'emergency'];
const VALID_CHANGE_CATEGORIES = ['deployment', 'database', 'infrastructure', 'configuration'];
const VALID_COMPLEXITY = ['low', 'medium', 'high'];

// Required columns
const REQUIRED_COLUMNS = [
  'short_description',
  'long_description',
  'change_type',
  'change_category',
  'implementation_steps',
  'validation_steps',
  'rollback_plan',
  'planned_window',
  'impacted_services'
];

/**
 * Parse Excel file
 */
function parseExcelFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse CSV file
 */
function parseCSVFile(filePath) {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve({ success: true, data: results }))
      .on('error', (error) => resolve({ success: false, error: error.message }));
  });
}

/**
 * Validate a row
 */
function validateChangeRow(row) {
  const errors = [];

  for (const field of REQUIRED_COLUMNS) {
    if (!row[field] || row[field].toString().trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (row.change_type && !VALID_CHANGE_TYPES.includes(row.change_type.toLowerCase())) {
    errors.push(`Invalid change_type: ${row.change_type}`);
  }

  if (row.change_category && !VALID_CHANGE_CATEGORIES.includes(row.change_category.toLowerCase())) {
    errors.push(`Invalid change_category: ${row.change_category}`);
  }

  if (row.complexity && !VALID_COMPLEXITY.includes(row.complexity.toLowerCase())) {
    errors.push(`Invalid complexity: ${row.complexity}`);
  }

  if (row.planned_window) {
    const date = new Date(row.planned_window);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid planned_window format: ${row.planned_window}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }

  return { valid: true };
}

/**
 * Transform row to change object
 */
function transformRowToChange(row) {
  const implementationSteps = row.implementation_steps.includes('|')
    ? row.implementation_steps.split('|').map(s => s.trim())
    : [row.implementation_steps];

  const validationSteps = row.validation_steps.includes('|')
    ? row.validation_steps.split('|').map(s => s.trim())
    : [row.validation_steps];

  const impactedServices = row.impacted_services
    .split(',')
    .map(s => s.trim())
    .filter(s => s);

  return {
    short_description: row.short_description.trim(),
    long_description: row.long_description.trim(),
    change_type: row.change_type.toLowerCase(),
    change_category: row.change_category.toLowerCase(),
    complexity: row.complexity ? row.complexity.toLowerCase() : 'medium',
    implementation_steps: implementationSteps,
    validation_steps: validationSteps,
    rollback_plan: row.rollback_plan.trim(),
    planned_window: row.planned_window,
    impacted_services: impactedServices,
    change_id: row.change_id || `CHG${Math.floor(100000 + Math.random() * 900000)}`,
    assignee: row.assignee || 'Unassigned',
    priority: row.priority ? row.priority.toLowerCase() : 'medium'
  };
}

/**
 * Calculate simple risk score
 */
function calculateSimpleRiskScore(changeData) {
  let riskScore = 0; // Base score (changed from 30 to 0)

  // Change type impact
  if (changeData.change_type === 'emergency') riskScore += 30;
  else if (changeData.change_type === 'normal') riskScore += 20;
  else riskScore += 5;

  // Category impact
  if (changeData.change_category === 'database') riskScore += 25;
  else if (changeData.change_category === 'infrastructure') riskScore += 20;
  else if (changeData.change_category === 'deployment') riskScore += 15;
  else riskScore += 5;

  // Complexity impact
  if (changeData.complexity === 'high') riskScore += 20;
  else if (changeData.complexity === 'medium') riskScore += 10;
  else riskScore += 3;

  // Service count impact
  const serviceCount = changeData.impacted_services.length;
  if (serviceCount > 5) riskScore += 15;
  else if (serviceCount > 2) riskScore += 8;
  else riskScore += 2;

  // Rollback plan quality
  const rollbackLength = changeData.rollback_plan.length;
  if (rollbackLength < 50) riskScore += 12; // Poor rollback plan
  else if (rollbackLength < 100) riskScore += 5;

  // Validation quality
  const validationCount = changeData.validation_steps.length;
  if (validationCount < 2) riskScore += 12;
  else if (validationCount < 4) riskScore += 5;

  // Peak hours check (only add penalty for riskier changes)
  try {
    const date = new Date(changeData.planned_window);
    const hour = date.getHours();
    const day = date.getDay();
    // Only penalize peak hours for non-standard or non-configuration changes
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) {
      if (changeData.change_type !== 'standard' || changeData.change_category !== 'configuration') {
        riskScore += 8;
      }
    }
  } catch (e) {
    // Ignore date parsing errors
  }

  return Math.min(Math.max(riskScore, 0), 100);
}

/**
 * Get risk band
 */
function getRiskBand(score) {
  if (score <= 30) return 'Low';
  if (score <= 55) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
}

/**
 * Generate plain English explanation for risk
 */
function generateRiskExplanation(changeData, riskScore, riskBand) {
  const reasons = [];

  // Change type
  if (changeData.change_type === 'emergency') {
    reasons.push('This is an emergency change with limited testing time');
  }

  // Category
  if (changeData.change_category === 'database') {
    reasons.push('Database changes can cause data integrity issues');
  } else if (changeData.change_category === 'infrastructure') {
    reasons.push('Infrastructure changes affect system availability');
  }

  // Complexity
  if (changeData.complexity === 'high') {
    reasons.push('High complexity increases chance of unexpected issues');
  }

  // Service count
  const serviceCount = changeData.impacted_services.length;
  if (serviceCount > 3) {
    reasons.push(`Affects ${serviceCount} services, increasing blast radius`);
  }

  // Rollback
  if (changeData.rollback_plan.length < 50) {
    reasons.push('Rollback plan lacks sufficient detail');
  }

  // Validation
  if (changeData.validation_steps.length < 2) {
    reasons.push('Limited validation testing performed');
  }

  // Peak hours
  try {
    const date = new Date(changeData.planned_window);
    const hour = date.getHours();
    const day = date.getDay();
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) {
      reasons.push('Scheduled during business hours (higher user impact)');
    }
  } catch (e) {
    // Ignore
  }

  let explanation = '';
  if (riskBand === 'Critical' || riskBand === 'High') {
    explanation = `Risk is ${riskBand.toLowerCase()} because: ${reasons.slice(0, 3).join('; ')}.`;
    if (riskBand === 'Critical') {
      explanation += ' Immediate attention and careful review required before proceeding.';
    } else {
      explanation += ' Additional validation and monitoring recommended.';
    }
  } else if (riskBand === 'Medium') {
    explanation = `Moderate risk. ${reasons.slice(0, 2).join(' and ')}.`;
  } else {
    explanation = 'Low risk change with standard safeguards in place.';
  }

  return explanation;
}

/**
 * Process a single change
 */
async function processChange(changeData, db) {
  try {
    const riskScore = calculateSimpleRiskScore(changeData);
    const riskBand = getRiskBand(riskScore);
    const explanation = generateRiskExplanation(changeData, riskScore, riskBand);
    const predictionId = `pred_${uuidv4()}`;

    // Store in database
    await db.run(
      `INSERT INTO changes (
        change_id, short_description, long_description, change_type, change_category,
        complexity, implementation_steps, validation_steps, rollback_plan,
        planned_window, impacted_services, assignee, final_outcome, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        changeData.change_id,
        changeData.short_description,
        changeData.long_description,
        changeData.change_type,
        changeData.change_category,
        changeData.complexity,
        JSON.stringify(changeData.implementation_steps),
        JSON.stringify(changeData.validation_steps),
        changeData.rollback_plan,
        changeData.planned_window,
        JSON.stringify(changeData.impacted_services),
        changeData.assignee,
        'pending',
        new Date().toISOString()
      ]
    );

    return {
      status: 'success',
      change_id: changeData.change_id,
      short_description: changeData.short_description,
      risk_score: Math.round(riskScore * 100) / 100,
      risk_band: riskBand,
      risk_explanation: explanation,
      prediction_id: predictionId
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Process bulk upload
 */
async function processBulkUpload(filePath, fileType) {
  const startTime = Date.now();
  const batchId = `batch_${uuidv4()}`;

  // Parse file
  let parseResult;
  if (fileType === 'excel') {
    parseResult = parseExcelFile(filePath);
  } else {
    parseResult = await parseCSVFile(filePath);
  }

  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error,
      error_code: 'INVALID_FORMAT'
    };
  }

  const rows = parseResult.data;
  const totalCount = rows.length;

  if (totalCount === 0) {
    return {
      success: false,
      error: 'File contains no data rows',
      error_code: 'EMPTY_FILE'
    };
  }

  if (totalCount > 1000) {
    return {
      success: false,
      error: 'File contains more than 1000 rows',
      error_code: 'FILE_TOO_LARGE'
    };
  }

  // Validate and transform
  const validatedRows = [];
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  const db = new Database();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;

    // Validate
    const validation = validateChangeRow(row);
    if (!validation.valid) {
      results.push({
        row_number: rowNumber,
        status: 'error',
        short_description: row.short_description || 'N/A',
        error: validation.error,
        error_code: 'VALIDATION_ERROR'
      });
      errorCount++;
      continue;
    }

    // Transform and process
    const changeData = transformRowToChange(row);
    const result = await processChange(changeData, db);

    if (result.status === 'success') {
      results.push({
        row_number: rowNumber,
        ...result
      });
      successCount++;
    } else {
      results.push({
        row_number: rowNumber,
        status: 'error',
        short_description: changeData.short_description,
        error: result.error,
        error_code: 'PROCESSING_ERROR'
      });
      errorCount++;
    }
  }

  // Calculate summary
  const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  let totalRiskScore = 0;
  let riskScoreCount = 0;

  for (const result of results) {
    if (result.status === 'success' && result.risk_band) {
      riskDistribution[result.risk_band]++;
      totalRiskScore += result.risk_score;
      riskScoreCount++;
    }
  }

  const avgRiskScore = riskScoreCount > 0
    ? Math.round((totalRiskScore / riskScoreCount) * 100) / 100
    : 0;

  const processingTime = Date.now() - startTime;

  return {
    success: true,
    batch_id: batchId,
    uploaded_at: new Date().toISOString(),
    total_count: totalCount,
    processed_count: results.length,
    success_count: successCount,
    error_count: errorCount,
    processing_time_ms: processingTime,
    results,
    summary: {
      risk_distribution: riskDistribution,
      avg_risk_score: avgRiskScore
    }
  };
}

module.exports = {
  processBulkUpload
};
