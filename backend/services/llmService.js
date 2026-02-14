/**
 * LLM Service
 * Integrates with OpenAI to generate risk explanations and recommendations
 */

const OpenAI = require('openai');

let openai = null;

function initializeOpenAI(apiKey) {
  if (!apiKey) {
    console.warn('OpenAI API key not provided. LLM features will use mock data.');
    return null;
  }

  try {
    openai = new OpenAI({
      apiKey: apiKey
    });
    return openai;
  } catch (error) {
    console.error('Error initializing OpenAI:', error);
    return null;
  }
}

/**
 * Generate mock risk assessment (fallback when OpenAI is not available)
 */
function generateMockAssessment(changeData, features, similarChanges) {
  const drivers = [];
  const positiveSignals = [];
  const missingEvidence = [];
  const recommendations = [];

  // Generate drivers based on features
  if (features.rollback_quality_score < 0.6) {
    drivers.push({
      driver: 'Inadequate rollback plan',
      evidence: `rollback_quality_score: ${features.rollback_quality_score.toFixed(2)} (Below threshold of 0.6)`,
      historical_reference: similarChanges[0]?.change_id
        ? `${similarChanges[0].change_id}: Similar change required extended rollback time`
        : 'Historical data shows rollback complexity increases incident duration'
    });

    recommendations.push({
      recommendation: 'Document detailed rollback procedure with time estimates and validation steps',
      category: 'rollback',
      rationale: 'Clear rollback procedures reduce mean time to recovery (MTTR) by 40%'
    });
  }

  if (features.evidence_score < 0.7) {
    drivers.push({
      driver: 'Insufficient test coverage',
      evidence: `evidence_score: ${features.evidence_score.toFixed(2)} (Below best practice threshold of 0.7)`,
      historical_reference: 'Changes with comprehensive testing have 60% fewer post-deploy incidents'
    });

    missingEvidence.push({
      gap: 'Load/performance testing results',
      impact: 'Cannot verify system behavior under production traffic levels'
    });

    recommendations.push({
      recommendation: 'Conduct load testing at 150% of peak traffic before deployment',
      category: 'testing',
      rationale: 'Performance issues are the #2 cause of rollbacks in similar changes'
    });
  }

  if (changeData.dbMigrationFlag) {
    drivers.push({
      driver: 'Database schema modification carries inherent risk',
      evidence: 'Change involves database migration or schema changes',
      historical_reference: similarChanges.find(c => c.final_outcome !== 'success')?.change_id
        ? `${similarChanges.find(c => c.final_outcome !== 'success').change_id}: Database migration resulted in ${similarChanges.find(c => c.final_outcome !== 'success').final_outcome}`
        : 'Database changes have 3x higher rollback rate than application deployments'
    });

    recommendations.push({
      recommendation: 'Execute database migration in transaction with verification queries',
      category: 'planning',
      rationale: 'Transactional migrations enable instant rollback on failure'
    });

    missingEvidence.push({
      gap: 'Database backup verification',
      impact: 'Cannot guarantee data recovery if migration fails'
    });
  }

  if (features.is_peak_hours) {
    drivers.push({
      driver: 'Change scheduled during peak business hours',
      evidence: `Planned window overlaps with high-traffic period`,
      historical_reference: 'Peak-hour deployments have 2.5x higher incident rate'
    });

    recommendations.push({
      recommendation: 'Reschedule to off-peak hours (02:00-04:00 UTC) to minimize blast radius',
      category: 'scheduling',
      rationale: 'Off-peak deployments allow more time for detection and recovery'
    });
  }

  if (changeData.complexity === 'high' || changeData.complexity === 'critical') {
    drivers.push({
      driver: 'High complexity change affects multiple system components',
      evidence: `Complexity: ${changeData.complexity}, impacting ${changeData.services?.length || 'multiple'} services`,
      historical_reference: 'Complex changes require 3x more monitoring and validation steps'
    });

    recommendations.push({
      recommendation: 'Implement phased rollout with automated rollback triggers',
      category: 'planning',
      rationale: 'Gradual rollout limits exposure and enables early detection of issues'
    });
  }

  // Positive signals
  if (features.rollback_quality_score >= 0.8) {
    positiveSignals.push({
      signal: 'Well-documented rollback procedure',
      evidence: `rollback_quality_score: ${features.rollback_quality_score.toFixed(2)}`
    });
  }

  if (features.evidence_score >= 0.8) {
    positiveSignals.push({
      signal: 'Comprehensive test coverage',
      evidence: `evidence_score: ${features.evidence_score.toFixed(2)}`
    });
  }

  if (changeData.change_type === 'standard') {
    positiveSignals.push({
      signal: 'Standard change type with established procedures',
      evidence: 'Standard changes have 85% success rate in historical data'
    });
  }

  if (!features.is_peak_hours) {
    positiveSignals.push({
      signal: 'Scheduled during low-traffic window',
      evidence: 'Off-peak timing reduces blast radius and allows adequate response time'
    });
  }

  // Additional recommendations
  recommendations.push({
    recommendation: 'Configure comprehensive monitoring alerts for key metrics before deployment',
    category: 'monitoring',
    rationale: 'Early detection through monitoring reduces incident severity by 50%'
  });

  if (changeData.services && changeData.services.length > 1) {
    recommendations.push({
      recommendation: 'Prepare communication plan for impacted service teams',
      category: 'planning',
      rationale: 'Cross-team coordination critical for changes affecting multiple services'
    });
  }

  return {
    drivers: drivers.slice(0, 5),
    positive_signals: positiveSignals.slice(0, 3),
    missing_evidence: missingEvidence.slice(0, 3),
    recommendations: recommendations.slice(0, 6)
  };
}

/**
 * Generate risk assessment using OpenAI
 */
async function generateRiskAssessment(changeData, features, probabilities, similarChanges, blastRadiusScore) {
  // If OpenAI is not initialized, use mock data
  if (!openai) {
    console.log('Using mock LLM assessment (OpenAI not configured)');
    return generateMockAssessment(changeData, features, similarChanges);
  }

  try {
    const prompt = `You are a risk analysis expert for IT change management. Analyze the following change request and generate a detailed risk assessment.

Change Information:
- Description: ${changeData.short_description}
- Type: ${changeData.change_type}
- Category: ${changeData.change_category}
- Complexity: ${changeData.complexity}
- Impacted Services: ${changeData.services?.join(', ') || 'N/A'}
- Implementation Steps: ${changeData.implementation_steps?.join('; ') || 'N/A'}
- Rollback Plan: ${changeData.rollback_plan || 'N/A'}
- Validation Steps: ${changeData.validation_steps?.join('; ') || 'N/A'}

Risk Features:
- Complexity Score: ${features.complexity_score.toFixed(2)}
- Evidence Score: ${features.evidence_score.toFixed(2)}
- Rollback Quality: ${features.rollback_quality_score.toFixed(2)}
- Historical Failure Rate: ${(features.historical_failure_rate * 100).toFixed(1)}%
- Blast Radius Score: ${blastRadiusScore}/100
- Peak Hours: ${features.is_peak_hours ? 'Yes' : 'No'}

Similar Historical Changes:
${similarChanges.map(c => `- ${c.change_id}: ${c.short_description} (Outcome: ${c.final_outcome}, Similarity: ${c.similarity_score}%)`).join('\n')}

Generate a JSON response with the following structure:
{
  "drivers": [
    {
      "driver": "Brief description of risk driver",
      "evidence": "Specific evidence from the change data",
      "historical_reference": "Reference to similar historical changes or patterns"
    }
  ],
  "positive_signals": [
    {
      "signal": "Positive aspect that reduces risk",
      "evidence": "Supporting evidence"
    }
  ],
  "missing_evidence": [
    {
      "gap": "What evidence is missing",
      "impact": "Why this gap matters"
    }
  ],
  "recommendations": [
    {
      "recommendation": "Specific actionable recommendation",
      "category": "testing|planning|scheduling|rollback|monitoring",
      "rationale": "Why this recommendation will reduce risk"
    }
  ]
}

Requirements:
- Provide 3-5 risk drivers with specific evidence
- Include 2-3 positive signals if applicable
- Identify 0-3 critical missing evidence items
- Provide 3-6 actionable recommendations
- Reference specific historical changes when relevant
- Be concise and actionable`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in IT change management and risk assessment. Provide detailed, evidence-based analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;

  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    console.log('Falling back to mock assessment');
    return generateMockAssessment(changeData, features, similarChanges);
  }
}

module.exports = {
  initializeOpenAI,
  generateRiskAssessment
};
