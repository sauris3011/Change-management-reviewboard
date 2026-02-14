/**
 * API Test Script
 * Quick script to test the Change Management API endpoints
 */

const API_BASE = 'http://localhost:3001';

// Helper function to make API calls
async function makeRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Test cases
async function runTests() {
  console.log('='.repeat(60));
  console.log('Change Management API Tests');
  console.log('='.repeat(60));
  console.log('');

  // Test 1: Health Check
  console.log('Test 1: Health Check');
  console.log('GET /health');
  const health = await makeRequest('GET', '/health');
  console.log('Status:', health.status);
  console.log('Response:', JSON.stringify(health.data, null, 2));
  console.log('');

  // Test 2: Evaluate Low-Risk Change
  console.log('Test 2: Evaluate Low-Risk Change');
  console.log('POST /api/v1/evaluate-change');
  const lowRiskChange = {
    short_description: 'Update feature flag configuration for new checkout flow',
    long_description: 'Enable new checkout flow for 10% of users in production',
    change_type: 'standard',
    change_category: 'configuration',
    implementation_steps: [
      '1. Update feature flag in DynamoDB',
      '2. Verify flag propagation',
      '3. Monitor metrics for 30 minutes'
    ],
    validation_steps: [
      'Configuration validated in staging',
      'Smoke tests passed',
      'Rollout plan reviewed'
    ],
    rollback_plan: 'Disable feature flag via admin API, takes 2 minutes. Automated rollback available.',
    planned_window: '2024-03-20T03:00:00Z',
    impacted_services: ['svc-checkout-service']
  };

  const lowRiskResult = await makeRequest('POST', '/api/v1/evaluate-change', lowRiskChange);
  console.log('Status:', lowRiskResult.status);
  if (lowRiskResult.data && lowRiskResult.data.result) {
    console.log('Risk Score:', lowRiskResult.data.result.risk_score);
    console.log('Risk Band:', lowRiskResult.data.result.risk_band);
    console.log('Probabilities:', JSON.stringify(lowRiskResult.data.result.probabilities, null, 2));
    console.log('Drivers:', lowRiskResult.data.result.drivers.length);
    console.log('Recommendations:', lowRiskResult.data.result.recommendations.length);
  }
  console.log('');

  // Test 3: Evaluate High-Risk Change
  console.log('Test 3: Evaluate High-Risk Change');
  console.log('POST /api/v1/evaluate-change');
  const highRiskChange = {
    short_description: 'Database schema migration for orders table during business hours',
    long_description: 'Add new payment_method column and migrate existing data. This affects core order processing.',
    change_type: 'emergency',
    change_category: 'database',
    complexity: 'high',
    implementation_steps: [
      '1. Apply schema changes',
      '2. Run data migration script',
      '3. Verify data integrity'
    ],
    validation_steps: [
      'Tested in staging environment'
    ],
    rollback_plan: 'Manual rollback, requires database restore from backup',
    planned_window: '2024-03-20T14:00:00Z',
    impacted_services: ['svc-oms-order-api', 'svc-payment-processor', 'svc-inventory']
  };

  const highRiskResult = await makeRequest('POST', '/api/v1/evaluate-change', highRiskChange);
  console.log('Status:', highRiskResult.status);
  if (highRiskResult.data && highRiskResult.data.result) {
    console.log('Risk Score:', highRiskResult.data.result.risk_score);
    console.log('Risk Band:', highRiskResult.data.result.risk_band);
    console.log('Probabilities:', JSON.stringify(highRiskResult.data.result.probabilities, null, 2));
    console.log('Drivers:', highRiskResult.data.result.drivers.length);
    console.log('Recommendations:', highRiskResult.data.result.recommendations.length);
    console.log('');
    console.log('Sample Driver:');
    if (highRiskResult.data.result.drivers.length > 0) {
      console.log(JSON.stringify(highRiskResult.data.result.drivers[0], null, 2));
    }
  }
  console.log('');

  // Test 4: Get Change History
  console.log('Test 4: Get Change History');
  console.log('GET /api/v1/changes/history');
  const history = await makeRequest('GET', '/api/v1/changes/history?limit=5');
  console.log('Status:', history.status);
  if (history.data && history.data.changes) {
    console.log('Total Changes:', history.data.pagination.total);
    console.log('Retrieved:', history.data.changes.length);
    console.log('Sample Change:', history.data.changes[0]?.change_id, '-', history.data.changes[0]?.short_description);
  }
  console.log('');

  // Test 5: Get Statistics
  console.log('Test 5: Get Statistics');
  console.log('GET /api/v1/changes/stats/summary');
  const stats = await makeRequest('GET', '/api/v1/changes/stats/summary');
  console.log('Status:', stats.status);
  if (stats.data) {
    console.log('Total Changes:', stats.data.total_changes);
    console.log('Outcome Distribution:', JSON.stringify(stats.data.outcome_distribution, null, 2));
    console.log('Category Distribution:', JSON.stringify(stats.data.category_distribution, null, 2));
  }
  console.log('');

  // Test 6: Get Specific Change
  console.log('Test 6: Get Specific Change');
  console.log('GET /api/v1/changes/CHG001');
  const change = await makeRequest('GET', '/api/v1/changes/CHG001');
  console.log('Status:', change.status);
  if (change.data) {
    console.log('Change ID:', change.data.change_id);
    console.log('Description:', change.data.short_description);
    console.log('Outcome:', change.data.final_outcome);
    console.log('Failure Reason:', change.data.failure_reason_code);
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('This test script requires Node.js 18+ with native fetch support.');
  console.log('Alternatively, run: npm install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
