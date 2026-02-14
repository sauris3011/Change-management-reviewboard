/**
 * Risk Scoring Service
 * Implements the risk scoring formula from the specification
 */

/**
 * Calculate outcome probabilities based on features
 */
function calculateProbabilities(features, blastRadiusScore) {
  // Base probabilities
  let pSuccess = 0.75;
  let pDeployFail = 0.05;
  let pRollback = 0.10;
  let pIncident = 0.05;
  let pDegraded = 0.05;

  // Adjust based on complexity
  const complexityPenalty = features.complexity_score * 0.3;
  pSuccess -= complexityPenalty;
  pRollback += complexityPenalty * 0.4;
  pIncident += complexityPenalty * 0.3;
  pDegraded += complexityPenalty * 0.3;

  // Adjust based on evidence quality
  const evidencePenalty = (1 - features.evidence_score) * 0.25;
  pSuccess -= evidencePenalty;
  pDeployFail += evidencePenalty * 0.5;
  pRollback += evidencePenalty * 0.3;
  pIncident += evidencePenalty * 0.2;

  // Adjust based on rollback plan quality
  const rollbackPenalty = (1 - features.rollback_quality_score) * 0.2;
  pSuccess -= rollbackPenalty;
  pRollback += rollbackPenalty * 0.7;
  pIncident += rollbackPenalty * 0.3;

  // Adjust based on historical failure rate
  const historyPenalty = features.historical_failure_rate * 0.3;
  pSuccess -= historyPenalty;
  pDeployFail += historyPenalty * 0.3;
  pRollback += historyPenalty * 0.4;
  pIncident += historyPenalty * 0.3;

  // Blast radius affects incident probability
  const blastPenalty = (blastRadiusScore / 100) * 0.2;
  pSuccess -= blastPenalty;
  pIncident += blastPenalty * 0.6;
  pDegraded += blastPenalty * 0.4;

  // Peak hours increase risk
  if (features.is_peak_hours) {
    pSuccess -= 0.15;
    pIncident += 0.1;
    pDegraded += 0.05;
  }

  // Emergency changes are riskier
  if (features.emergency_modifier === 1) {
    pSuccess -= 0.2;
    pDeployFail += 0.1;
    pRollback += 0.05;
    pIncident += 0.05;
  }

  // Normalize probabilities to sum to 1.0
  const total = pSuccess + pDeployFail + pRollback + pIncident + pDegraded;

  return {
    success: Math.max(0, pSuccess / total),
    deploy_fail: Math.max(0, pDeployFail / total),
    rollback: Math.max(0, pRollback / total),
    post_deploy_incident: Math.max(0, pIncident / total),
    degraded: Math.max(0, pDegraded / total)
  };
}

/**
 * Calculate risk score using the formula from specification:
 * RiskScore = P(failure)*60 + BlastRadius*15 + EvidencePenalty*10 + HistoricalFailureRate*10
 */
function calculateRiskScore(probabilities, features, blastRadiusScore) {
  // P(failure) = sum of all non-success probabilities
  const pFailure =
    probabilities.deploy_fail +
    probabilities.rollback +
    probabilities.post_deploy_incident +
    probabilities.degraded;

  // Evidence penalty (inverse of evidence score)
  const evidencePenalty = Math.min(
    1 - features.evidence_score,
    1 - features.rollback_quality_score
  );

  // Calculate risk score
  const riskScore =
    (pFailure * 60) +
    ((blastRadiusScore / 100) * 15) +
    (evidencePenalty * 10) +
    (features.historical_failure_rate * 10) +
    (features.emergency_modifier * 5);

  return Math.round(riskScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine risk band based on score
 */
function getRiskBand(riskScore) {
  if (riskScore <= 30) return { level: 'Low', color: 'green' };
  if (riskScore <= 55) return { level: 'Medium', color: 'yellow' };
  if (riskScore <= 75) return { level: 'High', color: 'orange' };
  return { level: 'Critical', color: 'red' };
}

/**
 * Find similar historical changes
 */
function findSimilarChanges(currentChange, historicalChanges, limit = 5) {
  // Ensure historicalChanges is an array
  if (!historicalChanges || !Array.isArray(historicalChanges)) {
    return [];
  }

  const currentServices = new Set(currentChange.services || []);
  const currentCategory = currentChange.change_category;
  const currentType = currentChange.change_type;

  // Calculate similarity scores
  const scored = historicalChanges.map(change => {
    let score = 0;

    // Same category
    if (change.change_category === currentCategory) {
      score += 30;
    }

    // Same type
    if (change.change_type === currentType) {
      score += 20;
    }

    // Same complexity
    if (change.complexity === currentChange.complexity) {
      score += 15;
    }

    // Service overlap
    try {
      const changeServices = JSON.parse(change.impacted_services || '[]');
      const overlap = changeServices.filter(svc => currentServices.has(svc)).length;
      score += overlap * 20;
    } catch (e) {
      // Skip if JSON parsing fails
    }

    // Database migration flag
    if (change.complexity && change.complexity.includes('database') && currentChange.dbMigrationFlag) {
      score += 25;
    }

    return { change, score };
  });

  // Sort by score and return top matches
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({
      change_id: item.change.change_id,
      short_description: item.change.short_description,
      final_outcome: item.change.final_outcome,
      similarity_score: Math.min(100, item.score)
    }));
}

module.exports = {
  calculateProbabilities,
  calculateRiskScore,
  getRiskBand,
  findSimilarChanges
};
