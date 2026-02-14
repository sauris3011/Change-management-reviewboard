#!/bin/bash

# Change Management System - API Testing Examples
# Run these commands to test the API endpoints

BASE_URL="http://localhost:3001"

echo "=================================="
echo "Change Management API Test Suite"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "GET $BASE_URL/health"
curl -s "$BASE_URL/health" | json_pp
echo ""
echo ""

# Test 2: Get Statistics
echo -e "${BLUE}Test 2: Get Statistics${NC}"
echo "GET $BASE_URL/api/v1/changes/stats/summary"
curl -s "$BASE_URL/api/v1/changes/stats/summary" | json_pp
echo ""
echo ""

# Test 3: Get Historical Changes
echo -e "${BLUE}Test 3: Get Historical Changes${NC}"
echo "GET $BASE_URL/api/v1/changes/history?limit=3"
curl -s "$BASE_URL/api/v1/changes/history?limit=3" | json_pp
echo ""
echo ""

# Test 4: Get Specific Change
echo -e "${BLUE}Test 4: Get Specific Change (CHG001)${NC}"
echo "GET $BASE_URL/api/v1/changes/CHG001"
curl -s "$BASE_URL/api/v1/changes/CHG001" | json_pp
echo ""
echo ""

# Test 5: Evaluate Low-Risk Change
echo -e "${BLUE}Test 5: Evaluate Low-Risk Change${NC}"
echo "POST $BASE_URL/api/v1/evaluate-change"
curl -s -X POST "$BASE_URL/api/v1/evaluate-change" \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Update feature flag configuration for new checkout flow",
    "long_description": "Enable new checkout experience for 10% of users",
    "change_type": "standard",
    "change_category": "configuration",
    "implementation_steps": [
      "Update feature flag in DynamoDB",
      "Verify flag propagation",
      "Monitor metrics for 30 minutes"
    ],
    "validation_steps": [
      "Configuration validated in staging",
      "Smoke tests passed",
      "Rollout plan reviewed"
    ],
    "rollback_plan": "Disable feature flag via admin API, takes 2 minutes. Automated rollback available.",
    "planned_window": "2024-03-20T03:00:00Z",
    "impacted_services": ["svc-checkout-service"]
  }' | json_pp
echo ""
echo ""

# Test 6: Evaluate High-Risk Change
echo -e "${BLUE}Test 6: Evaluate High-Risk Change${NC}"
echo "POST $BASE_URL/api/v1/evaluate-change"
curl -s -X POST "$BASE_URL/api/v1/evaluate-change" \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Database schema migration for orders table during business hours",
    "long_description": "Add new payment_method column and migrate existing data. This affects core order processing.",
    "change_type": "emergency",
    "change_category": "database",
    "complexity": "high",
    "implementation_steps": [
      "Apply schema changes",
      "Run data migration script",
      "Verify data integrity"
    ],
    "validation_steps": [
      "Tested in staging environment"
    ],
    "rollback_plan": "Manual rollback, requires database restore from backup",
    "planned_window": "2024-03-20T14:00:00Z",
    "impacted_services": ["svc-oms-order-api", "svc-payment-processor", "svc-inventory"]
  }' | json_pp
echo ""
echo ""

# Test 7: Evaluate Medium-Risk Change
echo -e "${BLUE}Test 7: Evaluate Medium-Risk Change${NC}"
echo "POST $BASE_URL/api/v1/evaluate-change"
curl -s -X POST "$BASE_URL/api/v1/evaluate-change" \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Deploy Order API v2.5.0 with new payment gateway",
    "long_description": "Integrate with NewPay payment gateway for credit card processing",
    "change_type": "normal",
    "change_category": "deployment",
    "implementation_steps": [
      "Deploy new ECS task definition",
      "Update API Gateway routing",
      "Run smoke tests",
      "Monitor for 1 hour"
    ],
    "validation_steps": [
      "Unit tests passed (85% coverage)",
      "Integration tests passed",
      "Load testing completed"
    ],
    "rollback_plan": "Revert ECS task definition to previous version via CI/CD pipeline. Rollback time: 5 minutes. Automated rollback triggers configured.",
    "planned_window": "2024-03-20T02:00:00Z",
    "impacted_services": ["svc-oms-order-api", "svc-payment-processor"]
  }' | json_pp
echo ""
echo ""

# Test 8: Filter Historical Changes
echo -e "${BLUE}Test 8: Filter Historical Changes by Outcome${NC}"
echo "GET $BASE_URL/api/v1/changes/history?outcome=rollback"
curl -s "$BASE_URL/api/v1/changes/history?outcome=rollback" | json_pp
echo ""
echo ""

echo -e "${GREEN}=================================="
echo "All tests completed!"
echo "==================================${NC}"
