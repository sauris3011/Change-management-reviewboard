/**
 * Seed 500 synthetic historical change records with matching predictions.
 *
 * Distribution (user-specified):
 *   96% passed (480): 70% low, 20% medium, 6% high, 4% critical
 *    4% failed  (20): 50% low, 25% medium, 25% high
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'change_management.db');

// ── helpers ────────────────────────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function days(n) { return n * 24 * 60 * 60 * 1000; }

// Realistic service names
const services = [
  'svc-oms-order-api', 'svc-oms-checkout', 'svc-payment-processor',
  'svc-inventory-sync', 'svc-notification-service', 'svc-user-auth',
  'svc-catalog-api', 'svc-shipping-tracker', 'svc-analytics-pipeline',
  'svc-recommendation-engine', 'svc-search-indexer', 'svc-loyalty-points',
  'svc-cart-service', 'svc-pricing-engine', 'svc-returns-handler',
  'svc-fraud-detector', 'svc-warehouse-mgmt', 'svc-customer-support',
  'svc-image-processor', 'svc-email-sender', 'svc-sms-gateway',
  'svc-audit-logger', 'svc-config-manager', 'svc-feature-flags',
  'svc-rate-limiter', 'svc-cache-warmer', 'svc-data-exporter',
  'svc-report-generator', 'svc-webhook-dispatcher', 'svc-event-bus',
];

const awsComponents = [
  'ECS', 'Lambda', 'RDS', 'DynamoDB', 'API Gateway', 'SQS', 'SNS',
  'MSK', 'ElastiCache', 'S3', 'CloudFront', 'Route53', 'IAM',
  'CloudWatch', 'Secrets Manager', 'Step Functions', 'EventBridge',
];

const changeTypes = ['Standard', 'Normal', 'Emergency'];
const changeCategories = ['Deployment', 'Configuration', 'Infrastructure', 'Database'];
const complexities = ['low', 'medium', 'high'];

const assignees = [
  'John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Johnson', 'Charlie Brown',
  'David Lee', 'Eve Martinez', 'Frank White', 'Grace Kim', 'Henry Chen',
  'Isabella Garcia', 'Jack Thompson', 'Katie Liu', 'Liam O\'Brien', 'Mia Patel',
  'Noah Williams', 'Olivia Davis', 'Peter Zhang', 'Quinn Taylor', 'Rachel Moore',
  'Sam Anderson', 'Tina Jackson', 'Uma Sharma', 'Victor Lopez', 'Wendy Park',
];

const successOutcomes = ['success'];
const failOutcomes = ['rollback', 'deploy_fail', 'post_deploy_incident', 'degraded'];
const failReasons = [
  'data_integrity_issues', 'performance_degradation', 'missing_iam_permissions',
  'timeout_exceeded', 'dependency_failure', 'config_mismatch',
  'resource_limit_exceeded', 'network_connectivity', 'certificate_expired',
  'memory_overflow', 'race_condition', 'schema_incompatibility',
];

// Description templates
const descTemplates = {
  Deployment: [
    'Deploy {svc} {ver}', 'Release {svc} hotfix {ver}',
    'Update {svc} with new payment integration', 'Roll out {svc} feature release {ver}',
    'Deploy canary release for {svc}', 'Blue-green deployment of {svc} {ver}',
    'Push {svc} bug fix for order processing', 'Deploy {svc} with logging improvements',
    'Release {svc} performance optimizations', 'Deploy {svc} security patch {ver}',
  ],
  Configuration: [
    'Update feature flags for {svc}', 'Adjust rate limits on API Gateway',
    'Modify DynamoDB throughput for {svc}', 'Update environment variables for {svc}',
    'Change cache TTL settings for {svc}', 'Update CORS policy for {svc}',
    'Modify retry configuration for {svc}', 'Update log level for {svc} to DEBUG',
    'Adjust auto-scaling thresholds for {svc}', 'Update connection pool settings for {svc}',
  ],
  Infrastructure: [
    'Add RDS read replica for {svc}', 'Scale ECS cluster for {svc}',
    'Create new SQS queue for {svc}', 'Update security groups for {svc}',
    'Add ElastiCache cluster for {svc}', 'Migrate {svc} to new VPC',
    'Update CloudFront distribution for {svc}', 'Add NAT gateway for {svc} subnet',
    'Create new S3 bucket for {svc} assets', 'Update Route53 records for {svc}',
  ],
  Database: [
    'Database migration for {svc} schema update', 'Add index on {svc} orders table',
    'Archive old records in {svc} database', 'Add new columns to {svc} user table',
    'Optimize {svc} query performance with indexes', 'Migrate {svc} data to new schema',
    'Run backfill script for {svc} analytics', 'Update {svc} stored procedures',
    'Partition large table in {svc} database', 'Create materialized view for {svc} reports',
  ],
};

function makeVersion() {
  return `v${Math.floor(rand(1, 9))}.${Math.floor(rand(0, 20))}.${Math.floor(rand(0, 50))}`;
}

function makeDescription(category) {
  const tpl = pick(descTemplates[category] || descTemplates.Deployment);
  return tpl.replace('{svc}', pick(services)).replace('{ver}', makeVersion());
}

function makeRiskScore(band) {
  switch (band) {
    case 'Low':      return rand(5, 30);
    case 'Medium':   return rand(31, 55);
    case 'High':     return rand(56, 75);
    case 'Critical': return rand(76, 98);
  }
}

function makeProbabilities(passed, riskScore) {
  if (passed) {
    const pSuccess = rand(0.55, 0.92);
    const remaining = 1 - pSuccess;
    return [
      { outcome: 'Success', probability: pSuccess },
      { outcome: 'Degraded', probability: remaining * rand(0.3, 0.6) },
      { outcome: 'Rollback', probability: remaining * rand(0.1, 0.3) },
      { outcome: 'Incident', probability: remaining * rand(0.05, 0.2) },
    ];
  } else {
    const pSuccess = rand(0.08, 0.35);
    const remaining = 1 - pSuccess;
    return [
      { outcome: 'Success', probability: pSuccess },
      { outcome: 'Degraded', probability: remaining * rand(0.15, 0.35) },
      { outcome: 'Rollback', probability: remaining * rand(0.25, 0.5) },
      { outcome: 'Incident', probability: remaining * rand(0.1, 0.3) },
    ];
  }
}

function makeDrivers(passed) {
  const pool = [
    { driver: 'Peak-hour deployment window', evidence: ['Deployment scheduled during business hours', 'Higher traffic volume expected'] },
    { driver: 'Missing comprehensive test coverage', evidence: ['No load test results provided', 'Unit test coverage below 80%'] },
    { driver: 'Database migration without dry-run', evidence: ['No migration dry-run documented', 'Schema change affects critical tables'] },
    { driver: 'Multiple services impacted', evidence: ['Change affects 3+ microservices', 'Cross-service dependencies detected'] },
    { driver: 'Incomplete rollback plan', evidence: ['Rollback steps lack detail', 'No rollback time estimate provided'] },
    { driver: 'Emergency change with limited review', evidence: ['Bypassed standard review process', 'Limited peer review documentation'] },
    { driver: 'First deployment of new service', evidence: ['No production deployment history', 'New infrastructure components'] },
    { driver: 'High blast radius configuration', evidence: ['Affects customer-facing endpoints', 'Potential data loss on failure'] },
  ];
  const count = passed ? Math.floor(rand(1, 3)) : Math.floor(rand(2, 5));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function makeRecommendations(passed) {
  const pool = [
    { category: 'Testing', recommendation: 'Run load tests before deployment', priority: 'HIGH', rationale: 'No load test evidence provided' },
    { category: 'Planning', recommendation: 'Add detailed implementation steps', priority: 'MEDIUM', rationale: 'Current plan lacks granularity' },
    { category: 'Scheduling', recommendation: 'Reschedule to off-peak hours', priority: 'HIGH', rationale: 'Peak hour deployment increases risk' },
    { category: 'Rollback', recommendation: 'Document rollback procedure with time estimates', priority: 'HIGH', rationale: 'Current rollback plan is insufficient' },
    { category: 'Monitoring', recommendation: 'Set up real-time alerting for key metrics', priority: 'MEDIUM', rationale: 'No monitoring strategy defined' },
    { category: 'Testing', recommendation: 'Complete integration test suite', priority: 'MEDIUM', rationale: 'Missing cross-service integration tests' },
    { category: 'Planning', recommendation: 'Get additional peer review', priority: 'LOW', rationale: 'Complex change benefits from wider review' },
    { category: 'Monitoring', recommendation: 'Add canary deployment phase', priority: 'MEDIUM', rationale: 'Gradual rollout reduces blast radius' },
  ];
  const count = passed ? Math.floor(rand(1, 3)) : Math.floor(rand(3, 6));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── build the 500-record set ───────────────────────────────────────────

const records = [];

// Passed changes (480 total)
function addBatch(count, band, passed) {
  for (let i = 0; i < count; i++) {
    const category = pick(changeCategories);
    const svcList = [];
    const svcCount = Math.floor(rand(1, 4));
    while (svcList.length < svcCount) {
      const s = pick(services);
      if (!svcList.includes(s)) svcList.push(s);
    }
    const awsList = [];
    const awsCount = Math.floor(rand(1, 4));
    while (awsList.length < awsCount) {
      const a = pick(awsComponents);
      if (!awsList.includes(a)) awsList.push(a);
    }

    const riskScore = makeRiskScore(band);
    const complexity = band === 'Low' ? pick(['low', 'low', 'medium'])
                     : band === 'Medium' ? pick(['medium', 'medium', 'high'])
                     : pick(['high', 'high', 'medium']);

    const daysAgo = rand(1, 365);
    const createdAt = new Date(Date.now() - days(daysAgo)).toISOString();

    records.push({
      passed,
      band,
      category,
      riskScore: Math.round(riskScore * 10) / 10,
      complexity,
      services: svcList,
      awsComponents: awsList,
      createdAt,
    });
  }
}

// 96% passed = 480
addBatch(336, 'Low', true);       // 70% of 480
addBatch(96, 'Medium', true);     // 20% of 480
addBatch(29, 'High', true);       //  6% of 480
addBatch(19, 'Critical', true);   //  4% of 480

// 4% failed = 20
addBatch(10, 'Low', false);       // 50% of 20
addBatch(5, 'Medium', false);     // 25% of 20
addBatch(5, 'High', false);       // 25% of 20

// Shuffle
records.sort(() => Math.random() - 0.5);

// ── insert into database ───────────────────────────────────────────────

console.log(`Seeding ${records.length} records...`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) { console.error('Cannot open DB:', err); process.exit(1); }
});

db.serialize(() => {
  // Clear existing data
  db.run('DELETE FROM predictions');
  db.run('DELETE FROM changes');

  const insertChange = db.prepare(`
    INSERT INTO changes (
      change_id, short_description, long_description, change_type,
      change_category, complexity, impacted_services, implementation_steps,
      validation_steps, rollback_plan, planned_window, rollback_quality_score,
      evidence_score, assignee, final_outcome, failure_reason_code,
      submitted_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPrediction = db.prepare(`
    INSERT INTO predictions (
      prediction_id, change_id, risk_score, probabilities, drivers,
      positive_signals, missing_evidence, recommendations,
      retrieved_change_ids, model_version, llm_model, feature_vector,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  records.forEach((rec, idx) => {
    const changeId = `CHG${String(idx + 1).padStart(6, '0')}`;
    const predictionId = uuidv4();
    const desc = makeDescription(rec.category);
    const longDesc = `${desc}. This change involves ${rec.services.join(', ')} using ${rec.awsComponents.join(', ')}.`;
    const changeType = pick(changeTypes);
    const assignee = pick(assignees);
    const outcome = rec.passed ? 'success' : pick(failOutcomes);
    const failReason = rec.passed ? null : pick(failReasons);
    const rollbackScore = rec.passed ? rand(0.6, 0.99) : rand(0.1, 0.6);
    const evidenceScore = rec.passed ? rand(0.5, 0.99) : rand(0.1, 0.5);
    const probabilities = makeProbabilities(rec.passed, rec.riskScore);
    const drivers = makeDrivers(rec.passed);
    const recommendations = makeRecommendations(rec.passed);
    const positiveSignals = rec.passed
      ? ['Change follows standard deployment procedure', 'Rollback plan documented', 'Testing evidence provided']
      : ['Change has defined scope'];
    const missingEvidence = rec.passed
      ? []
      : ['Load test results', 'Rollback dry-run', 'Peer review sign-off'];
    const plannedWindow = new Date(new Date(rec.createdAt).getTime() + days(rand(0.5, 3))).toISOString();
    const steps = [
      `1. Prepare ${rec.category.toLowerCase()} changes`,
      `2. Deploy to staging and validate`,
      `3. Execute ${rec.category.toLowerCase()} change in production`,
      `4. Monitor key metrics for 30 minutes`,
      `5. Confirm success or initiate rollback`,
    ];

    insertChange.run(
      changeId, desc, longDesc, changeType,
      rec.category, rec.complexity,
      JSON.stringify(rec.services),
      JSON.stringify(steps),
      JSON.stringify(['Smoke tests', 'Health check', 'Metric validation']),
      `Revert to previous version using CI/CD pipeline. Estimated time: ${Math.floor(rand(5, 30))} minutes.`,
      plannedWindow,
      Math.round(rollbackScore * 100) / 100,
      Math.round(evidenceScore * 100) / 100,
      assignee,
      outcome,
      failReason,
      rec.createdAt,
      rec.createdAt
    );

    insertPrediction.run(
      predictionId, changeId, rec.riskScore,
      JSON.stringify(probabilities),
      JSON.stringify(drivers),
      JSON.stringify(positiveSignals),
      JSON.stringify(missingEvidence),
      JSON.stringify(recommendations),
      JSON.stringify([]),
      'v1.0.0', 'gpt-4',
      JSON.stringify({ complexity_score: rec.complexity === 'high' ? 0.8 : rec.complexity === 'medium' ? 0.5 : 0.2 }),
      rec.createdAt
    );
  });

  insertChange.finalize();
  insertPrediction.finalize(() => {
    // Verify counts
    db.get('SELECT COUNT(*) as cnt FROM changes', (err, row) => {
      console.log(`Changes inserted: ${row.cnt}`);
    });
    db.get('SELECT COUNT(*) as cnt FROM predictions', (err, row) => {
      console.log(`Predictions inserted: ${row.cnt}`);
    });
    db.get(`SELECT final_outcome, COUNT(*) as cnt FROM changes GROUP BY final_outcome`, () => {});
    db.all(`SELECT final_outcome, COUNT(*) as cnt FROM changes GROUP BY final_outcome`, (err, rows) => {
      console.log('Outcome distribution:');
      rows.forEach(r => console.log(`  ${r.final_outcome}: ${r.cnt}`));
    });
    db.all(`
      SELECT
        CASE
          WHEN risk_score <= 30 THEN 'Low'
          WHEN risk_score <= 55 THEN 'Medium'
          WHEN risk_score <= 75 THEN 'High'
          ELSE 'Critical'
        END as band,
        COUNT(*) as cnt
      FROM predictions
      GROUP BY band
    `, (err, rows) => {
      console.log('Risk band distribution:');
      rows.forEach(r => console.log(`  ${r.band}: ${r.cnt}`));
      console.log('\nDone! Restart the backend to use new data.');
      db.close();
    });
  });
});
