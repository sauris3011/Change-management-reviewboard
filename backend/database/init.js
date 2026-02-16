const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'change_management.db');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    db.serialize(() => {
      // Create changes table
      db.run(`
        CREATE TABLE IF NOT EXISTS changes (
          change_id TEXT PRIMARY KEY,
          short_description TEXT NOT NULL,
          long_description TEXT,
          change_type TEXT NOT NULL,
          change_category TEXT NOT NULL,
          complexity TEXT,
          impacted_services TEXT,
          implementation_steps TEXT,
          validation_steps TEXT,
          rollback_plan TEXT,
          planned_window TEXT,
          rollback_quality_score REAL,
          evidence_score REAL,
          assignee TEXT,
          final_outcome TEXT,
          failure_reason_code TEXT,
          submitted_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create predictions table
      db.run(`
        CREATE TABLE IF NOT EXISTS predictions (
          prediction_id TEXT PRIMARY KEY,
          change_id TEXT NOT NULL,
          short_description TEXT,
          risk_score REAL NOT NULL,
          risk_band TEXT,
          probabilities TEXT NOT NULL,
          drivers TEXT,
          positive_signals TEXT,
          missing_evidence TEXT,
          recommendations TEXT,
          similar_changes TEXT,
          features TEXT,
          entities TEXT,
          retrieved_change_ids TEXT,
          model_version TEXT DEFAULT '1.0.0',
          llm_model TEXT,
          feature_vector TEXT,
          evaluated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (change_id) REFERENCES changes(change_id)
        )
      `);

      // Check if we already have data (e.g. from seed-500.js) before inserting samples
      db.get('SELECT COUNT(*) as cnt FROM changes', (err, row) => {
        if (row && row.cnt > 10) {
          console.log(`Database already has ${row.cnt} records, skipping sample data`);
          resolve(db);
          return;
        }
        insertSampleData(db, resolve, reject);
      });
    });
  });
}

function insertSampleData(db, resolve, reject) {
  const sampleChanges = [
        {
          change_id: 'CHG001',
          short_description: 'Database migration for Order Service schema update',
          long_description: 'Add new payment_method column to orders table and migrate existing data',
          change_type: 'normal',
          change_category: 'database',
          complexity: 'high',
          impacted_services: JSON.stringify(['svc-oms-order-api', 'svc-payment-processor']),
          implementation_steps: JSON.stringify(['1. Backup database', '2. Apply schema changes', '3. Run data migration script', '4. Verify data integrity']),
          validation_steps: JSON.stringify(['Unit tests passed', 'Schema validation completed']),
          rollback_plan: 'Restore from backup, estimated time: 30 minutes',
          planned_window: '2024-02-10T02:00:00Z',
          rollback_quality_score: 0.4,
          evidence_score: 0.5,
          final_outcome: 'rollback',
          failure_reason_code: 'data_integrity_issues'
        },
        {
          change_id: 'CHG002',
          short_description: 'Deploy Order API v2.1.0 during peak hours',
          long_description: 'Update to include new payment gateway integration',
          change_type: 'normal',
          change_category: 'deployment',
          complexity: 'medium',
          impacted_services: JSON.stringify(['svc-oms-order-api']),
          implementation_steps: JSON.stringify(['1. Deploy to ECS', '2. Update API Gateway', '3. Monitor']),
          validation_steps: JSON.stringify(['Unit tests passed', 'Integration tests passed']),
          rollback_plan: 'Revert to previous ECS task definition',
          planned_window: '2024-02-15T14:00:00Z',
          rollback_quality_score: 0.7,
          evidence_score: 0.8,
          final_outcome: 'post_deploy_incident',
          failure_reason_code: 'performance_degradation'
        },
        {
          change_id: 'CHG003',
          short_description: 'Configuration change for feature flags - low traffic window',
          long_description: 'Enable new checkout flow for 10% of users',
          change_type: 'standard',
          change_category: 'configuration',
          complexity: 'low',
          impacted_services: JSON.stringify(['svc-oms-checkout']),
          implementation_steps: JSON.stringify(['1. Update config in DynamoDB', '2. Verify flag propagation', '3. Monitor metrics']),
          validation_steps: JSON.stringify(['Config validation passed', 'Smoke tests completed']),
          rollback_plan: 'Revert config change via API, takes 2 minutes',
          planned_window: '2024-02-20T03:00:00Z',
          rollback_quality_score: 0.9,
          evidence_score: 0.9,
          final_outcome: 'success',
          failure_reason_code: null
        },
        {
          change_id: 'CHG004',
          short_description: 'Lambda function update without comprehensive testing',
          long_description: 'Update inventory-sync Lambda to fix race condition',
          change_type: 'emergency',
          change_category: 'deployment',
          complexity: 'medium',
          impacted_services: JSON.stringify(['svc-inventory-sync']),
          implementation_steps: JSON.stringify(['1. Deploy new Lambda version', '2. Update alias', '3. Test manually']),
          validation_steps: JSON.stringify(['Code review completed']),
          rollback_plan: 'Revert Lambda alias to previous version',
          planned_window: '2024-02-22T16:00:00Z',
          rollback_quality_score: 0.6,
          evidence_score: 0.3,
          final_outcome: 'deploy_fail',
          failure_reason_code: 'missing_iam_permissions'
        },
        {
          change_id: 'CHG005',
          short_description: 'Standard change with comprehensive testing',
          long_description: 'Update notification service with new email templates',
          change_type: 'standard',
          change_category: 'deployment',
          complexity: 'low',
          impacted_services: JSON.stringify(['svc-notification-service']),
          implementation_steps: JSON.stringify(['1. Deploy to ECS', '2. Verify template rendering', '3. Monitor delivery rates']),
          validation_steps: JSON.stringify(['Unit tests passed', 'Integration tests passed', 'Load testing completed', 'UAT completed']),
          rollback_plan: 'Automated rollback via CI/CD pipeline, takes 5 minutes',
          planned_window: '2024-02-25T02:00:00Z',
          rollback_quality_score: 0.95,
          evidence_score: 0.95,
          final_outcome: 'success',
          failure_reason_code: null
        },
        {
          change_id: 'CHG006',
          short_description: 'Infrastructure change to add new RDS read replica',
          long_description: 'Add read replica in us-west-2 for improved read performance',
          change_type: 'normal',
          change_category: 'infrastructure',
          complexity: 'medium',
          impacted_services: JSON.stringify(['svc-oms-order-api', 'svc-oms-inventory']),
          implementation_steps: JSON.stringify(['1. Create RDS read replica', '2. Update connection strings', '3. Monitor replication lag']),
          validation_steps: JSON.stringify(['Terraform plan reviewed', 'Load tests on staging']),
          rollback_plan: 'Remove read replica, revert connection strings',
          planned_window: '2024-02-28T04:00:00Z',
          rollback_quality_score: 0.8,
          evidence_score: 0.85,
          final_outcome: 'success',
          failure_reason_code: null
        },
        {
          change_id: 'CHG007',
          short_description: 'Emergency hotfix during business hours',
          long_description: 'Fix critical bug in payment processing causing failed transactions',
          change_type: 'emergency',
          change_category: 'deployment',
          complexity: 'high',
          impacted_services: JSON.stringify(['svc-payment-processor', 'svc-oms-order-api']),
          implementation_steps: JSON.stringify(['1. Deploy hotfix to ECS', '2. Verify payment flow', '3. Monitor error rates']),
          validation_steps: JSON.stringify(['Unit tests passed', 'Manual testing in production']),
          rollback_plan: 'Revert to previous version if issues detected',
          planned_window: '2024-03-01T15:30:00Z',
          rollback_quality_score: 0.5,
          evidence_score: 0.4,
          final_outcome: 'degraded',
          failure_reason_code: 'partial_functionality'
        },
        {
          change_id: 'CHG008',
          short_description: 'Kafka topic configuration update',
          long_description: 'Increase partition count for order-events topic to improve throughput',
          change_type: 'normal',
          change_category: 'configuration',
          complexity: 'medium',
          impacted_services: JSON.stringify(['svc-order-events-producer', 'svc-order-events-consumer']),
          implementation_steps: JSON.stringify(['1. Add partitions to topic', '2. Restart consumers', '3. Verify message distribution']),
          validation_steps: JSON.stringify(['Config change tested in staging', 'Consumer group rebalancing verified']),
          rollback_plan: 'Cannot reduce partitions - consumers can handle increased partitions',
          planned_window: '2024-03-05T03:00:00Z',
          rollback_quality_score: 0.3,
          evidence_score: 0.7,
          final_outcome: 'success',
          failure_reason_code: null
        },
        {
          change_id: 'CHG009',
          short_description: 'API Gateway rate limiting update',
          long_description: 'Increase rate limits for premium customers from 1000 to 5000 req/min',
          change_type: 'standard',
          change_category: 'configuration',
          complexity: 'low',
          impacted_services: JSON.stringify(['api-gateway']),
          implementation_steps: JSON.stringify(['1. Update API Gateway configuration', '2. Deploy changes', '3. Monitor throttling metrics']),
          validation_steps: JSON.stringify(['Configuration validated', 'Impact assessment completed']),
          rollback_plan: 'Revert rate limit configuration via AWS Console or Terraform',
          planned_window: '2024-03-08T02:00:00Z',
          rollback_quality_score: 0.9,
          evidence_score: 0.85,
          final_outcome: 'success',
          failure_reason_code: null
        },
        {
          change_id: 'CHG010',
          short_description: 'Database index creation on production',
          long_description: 'Create composite index on orders table (customer_id, order_date) to improve query performance',
          change_type: 'normal',
          change_category: 'database',
          complexity: 'medium',
          impacted_services: JSON.stringify(['svc-oms-order-api', 'svc-analytics']),
          implementation_steps: JSON.stringify(['1. Create index CONCURRENTLY', '2. Verify index usage', '3. Monitor query performance']),
          validation_steps: JSON.stringify(['Index creation tested on staging', 'Query plans analyzed']),
          rollback_plan: 'Drop index if performance degrades',
          planned_window: '2024-03-10T04:00:00Z',
          rollback_quality_score: 0.85,
          evidence_score: 0.9,
          final_outcome: 'success',
          failure_reason_code: null
        }
      ];

      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO changes (
          change_id, short_description, long_description, change_type,
          change_category, complexity, impacted_services, implementation_steps,
          validation_steps, rollback_plan, planned_window, rollback_quality_score,
          evidence_score, final_outcome, failure_reason_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleChanges.forEach(change => {
        insertStmt.run(
          change.change_id,
          change.short_description,
          change.long_description,
          change.change_type,
          change.change_category,
          change.complexity,
          change.impacted_services,
          change.implementation_steps,
          change.validation_steps,
          change.rollback_plan,
          change.planned_window,
          change.rollback_quality_score,
          change.evidence_score,
          change.final_outcome,
          change.failure_reason_code
        );
      });

      insertStmt.finalize((err) => {
        if (err) {
          console.error('Error inserting sample data:', err);
          reject(err);
        } else {
          console.log('Database initialized with sample data');
          resolve(db);
        }
      });
}

module.exports = { initDatabase, dbPath };
