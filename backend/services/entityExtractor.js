/**
 * Entity Extractor Service
 * Extracts services and AWS resources from change descriptions
 */

// Common service patterns
const servicePatterns = [
  /svc-[\w-]+/gi,
  /\b(order|payment|inventory|notification|checkout|fulfillment|carrier|shipping)[\s-]*(api|service|processor|engine|handler)\b/gi,
  /\b(oms|wms|cms)[\s-]*[\w-]+/gi
];

// AWS resource patterns
const awsPatterns = {
  ecs_services: /\b(ecs|fargate)[\s-]*(service|task|cluster)\b/gi,
  lambda_functions: /\blambda[\s-]*(function)?\b/gi,
  rds_instances: /\b(rds|database|postgres|mysql)[\s-]*(instance|cluster)?\b/gi,
  dynamodb_tables: /\b(dynamodb|dynamo)[\s-]*(table)?\b/gi,
  sqs_queues: /\b(sqs|queue)\b/gi,
  sns_topics: /\b(sns|topic)\b/gi,
  api_gateway: /\b(api[\s-]*gateway|apigw)\b/gi,
  s3_buckets: /\bs3[\s-]*(bucket)?\b/gi,
  cloudwatch: /\b(cloudwatch|cw)[\s-]*(logs|metrics|alarms)?\b/gi,
  iam_roles: /\b(iam|role|policy)\b/gi
};

// Complexity indicators
const complexityIndicators = {
  high: [
    /database.*migration/i,
    /schema.*change/i,
    /breaking.*change/i,
    /multiple.*services/i,
    /critical.*service/i,
    /emergency/i,
    /hotfix/i,
    /peak.*hours/i
  ],
  medium: [
    /deployment/i,
    /configuration.*change/i,
    /api.*update/i,
    /integration/i,
    /infrastructure/i
  ],
  low: [
    /feature.*flag/i,
    /config.*update/i,
    /documentation/i,
    /monitoring/i,
    /logging/i
  ]
};

/**
 * Extract entities from change description and related fields
 */
function extractEntities(changeData) {
  const text = `
    ${changeData.short_description || ''}
    ${changeData.long_description || ''}
    ${changeData.implementation_steps ? changeData.implementation_steps.join(' ') : ''}
    ${changeData.rollback_plan || ''}
  `.toLowerCase();

  // Extract services
  const services = new Set();

  // Add explicitly provided services
  if (changeData.impacted_services && Array.isArray(changeData.impacted_services)) {
    changeData.impacted_services.forEach(svc => services.add(svc));
  }

  // Extract from text
  servicePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => services.add(match.trim()));
    }
  });

  // Extract AWS components
  const awsComponents = {};
  Object.keys(awsPatterns).forEach(componentType => {
    const matches = text.match(awsPatterns[componentType]);
    if (matches && matches.length > 0) {
      awsComponents[componentType] = true;
    }
  });

  // Determine complexity if not provided
  let complexity = changeData.complexity;
  if (!complexity) {
    if (complexityIndicators.high.some(pattern => pattern.test(text))) {
      complexity = 'high';
    } else if (complexityIndicators.medium.some(pattern => pattern.test(text))) {
      complexity = 'medium';
    } else if (complexityIndicators.low.some(pattern => pattern.test(text))) {
      complexity = 'low';
    } else {
      complexity = 'medium'; // default
    }
  }

  // Check for database migration
  const dbMigrationFlag = /database.*migration|schema.*change|alter.*table|add.*column|create.*index/i.test(text);

  return {
    services: Array.from(services),
    awsComponents,
    complexity,
    dbMigrationFlag
  };
}

/**
 * Calculate blast radius based on number and type of impacted services
 */
function calculateBlastRadius(services, awsComponents) {
  let radius = 0;

  // Base score from number of services
  radius += Math.min(services.length * 10, 40);

  // Additional score based on AWS components
  const criticalComponents = ['rds_instances', 'dynamodb_tables', 'api_gateway'];
  const criticalCount = criticalComponents.filter(comp => awsComponents[comp]).length;
  radius += criticalCount * 15;

  // Normalize to 0-100 scale
  return Math.min(radius, 100);
}

module.exports = {
  extractEntities,
  calculateBlastRadius
};
