/**
 * Feature Engineering Service
 * Calculates risk features from change data
 */

/**
 * Calculate rollback plan quality score
 */
function calculateRollbackQuality(rollbackPlan) {
  if (!rollbackPlan || rollbackPlan.trim().length === 0) {
    return 0;
  }

  let score = 0.3; // Base score for having a plan

  const text = rollbackPlan.toLowerCase();

  // Check for time estimates
  if (/\d+\s*(minute|min|hour|hr|second|sec)/i.test(text)) {
    score += 0.2;
  }

  // Check for specific steps
  if (/step|procedure|process/i.test(text) || text.split('\n').length > 2) {
    score += 0.15;
  }

  // Check for automation keywords
  if (/automat|script|pipeline|ci\/cd|terraform|ansible/i.test(text)) {
    score += 0.2;
  }

  // Check for verification/validation
  if (/verify|validate|test|check|confirm/i.test(text)) {
    score += 0.15;
  }

  // Penalties
  if (/manual|manually|uncertain|unclear|unknown/i.test(text)) {
    score -= 0.15;
  }

  if (/cannot.*rollback|no rollback|irreversible/i.test(text)) {
    score = Math.min(score, 0.3);
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate test evidence completeness score
 */
function calculateEvidenceScore(validationSteps) {
  if (!validationSteps || validationSteps.length === 0) {
    return 0;
  }

  let score = 0.2; // Base score for having some validation

  const text = validationSteps.join(' ').toLowerCase();

  // Check for different types of tests
  const testTypes = [
    /unit.*test/i,
    /integration.*test/i,
    /load.*test|performance.*test|stress.*test/i,
    /end.*to.*end|e2e|acceptance|uat/i,
    /security.*test|penetration.*test/i,
    /smoke.*test/i
  ];

  const matchedTests = testTypes.filter(pattern => pattern.test(text)).length;
  score += matchedTests * 0.15;

  // Check for test results/evidence
  if (/passed|successful|completed|green|✓|✅/i.test(text)) {
    score += 0.15;
  }

  // Check for coverage metrics
  if (/\d+%.*coverage|coverage.*\d+%/i.test(text)) {
    score += 0.1;
  }

  // Penalty for minimal testing
  if (/manual.*test.*only|no.*test|skip.*test/i.test(text)) {
    score -= 0.3;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate complexity score
 */
function calculateComplexityScore(complexity, changeType, dbMigrationFlag) {
  let score = 0;

  // Base complexity
  switch (complexity) {
    case 'critical':
      score += 0.9;
      break;
    case 'high':
      score += 0.7;
      break;
    case 'medium':
      score += 0.4;
      break;
    case 'low':
      score += 0.2;
      break;
    default:
      score += 0.4;
  }

  // Emergency changes are inherently more risky
  if (changeType === 'emergency') {
    score += 0.2;
  }

  // Database migrations add complexity
  if (dbMigrationFlag) {
    score += 0.2;
  }

  return Math.min(1, score);
}

/**
 * Calculate historical failure rate for similar changes
 */
function calculateHistoricalFailureRate(historicalChanges) {
  if (!historicalChanges || historicalChanges.length === 0) {
    return 0.3; // Default moderate risk if no history
  }

  const failures = historicalChanges.filter(change =>
    change.final_outcome !== 'success'
  ).length;

  return failures / historicalChanges.length;
}

/**
 * Check if change is during peak hours
 */
function isDuringPeakHours(plannedWindow) {
  if (!plannedWindow) return false;

  const date = new Date(plannedWindow);
  const hour = date.getUTCHours();
  const dayOfWeek = date.getUTCDay();

  // Peak hours: 12:00-20:00 UTC, Monday-Friday
  return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 12 && hour <= 20;
}

/**
 * Calculate all risk features
 */
function calculateFeatures(changeData, historicalChanges = []) {
  const rollbackQualityScore = calculateRollbackQuality(changeData.rollback_plan);
  const evidenceScore = calculateEvidenceScore(changeData.validation_steps || []);
  const complexityScore = calculateComplexityScore(
    changeData.complexity,
    changeData.change_type,
    changeData.dbMigrationFlag
  );
  const historicalFailureRate = calculateHistoricalFailureRate(historicalChanges);
  const isPeakHours = isDuringPeakHours(changeData.planned_window);

  return {
    rollback_quality_score: rollbackQualityScore,
    evidence_score: evidenceScore,
    complexity_score: complexityScore,
    historical_failure_rate: historicalFailureRate,
    is_peak_hours: isPeakHours,
    emergency_modifier: changeData.change_type === 'emergency' ? 1 : 0
  };
}

module.exports = {
  calculateRollbackQuality,
  calculateEvidenceScore,
  calculateComplexityScore,
  calculateHistoricalFailureRate,
  isDuringPeakHours,
  calculateFeatures
};
