# Quick Test Commands

Copy and paste these commands to test your Change Management System API.

**Prerequisites**: Server must be running (`cd backend && npm start`)

---

## 1. Health Check

```bash
curl http://localhost:3001/health
```

---

## 2. Get Statistics

```bash
curl http://localhost:3001/api/v1/changes/stats/summary
```

---

## 3. View Historical Changes

```bash
curl http://localhost:3001/api/v1/changes/history
```

---

## 4. View Specific Change (CHG001)

```bash
curl http://localhost:3001/api/v1/changes/CHG001
```

---

## 5. Evaluate Low-Risk Change

```bash
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Update feature flag configuration",
    "change_type": "standard",
    "change_category": "configuration",
    "implementation_steps": ["Update config", "Verify propagation", "Monitor"],
    "validation_steps": ["Tested in staging", "Smoke tests passed"],
    "rollback_plan": "Disable feature flag via API, takes 2 minutes",
    "planned_window": "2024-03-20T03:00:00Z",
    "impacted_services": ["svc-checkout"]
  }'
```

Expected: Risk Score ~20-35 (Low/Medium)

---

## 6. Evaluate High-Risk Change

```bash
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Database migration during business hours",
    "long_description": "Schema changes to orders table affecting payment processing",
    "change_type": "emergency",
    "change_category": "database",
    "complexity": "high",
    "implementation_steps": ["Apply schema", "Migrate data", "Verify"],
    "validation_steps": ["Basic testing only"],
    "rollback_plan": "Manual restore from backup",
    "planned_window": "2024-03-20T14:00:00Z",
    "impacted_services": ["svc-order-api", "svc-payment", "svc-inventory"]
  }'
```

Expected: Risk Score ~65-85 (High/Critical)

---

## 7. Evaluate Well-Planned Change

```bash
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Deploy Order API v2.5.0 with comprehensive testing",
    "change_type": "normal",
    "change_category": "deployment",
    "implementation_steps": [
      "Deploy new ECS task",
      "Update API Gateway",
      "Run smoke tests",
      "Monitor for 1 hour"
    ],
    "validation_steps": [
      "Unit tests passed (85% coverage)",
      "Integration tests passed",
      "Load testing completed",
      "Security scan passed"
    ],
    "rollback_plan": "Automated rollback via CI/CD pipeline, takes 5 minutes. Rollback triggers configured.",
    "planned_window": "2024-03-20T02:00:00Z",
    "impacted_services": ["svc-order-api"]
  }'
```

Expected: Risk Score ~30-45 (Medium)

---

## 8. Filter Changes by Outcome

```bash
# Get all failed changes
curl "http://localhost:3001/api/v1/changes/history?outcome=rollback"

# Get deployment changes
curl "http://localhost:3001/api/v1/changes/history?category=deployment"

# Get emergency changes
curl "http://localhost:3001/api/v1/changes/history?type=emergency"
```

---

## 9. Test Complete Workflow

```bash
# Step 1: Evaluate a change
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Test change",
    "change_type": "normal",
    "change_category": "deployment",
    "rollback_plan": "Standard rollback procedure"
  }')

# Step 2: Extract prediction ID
PREDICTION_ID=$(echo $RESPONSE | grep -o '"evaluation_id":"[^"]*"' | cut -d'"' -f4)

# Step 3: Retrieve the prediction
curl "http://localhost:3001/api/v1/predictions/$PREDICTION_ID"
```

---

## 10. Batch Test (Run All)

```bash
# Health
echo "=== Health Check ==="
curl -s http://localhost:3001/health | json_pp

echo ""
echo "=== Statistics ==="
curl -s http://localhost:3001/api/v1/changes/stats/summary | json_pp

echo ""
echo "=== Low-Risk Evaluation ==="
curl -s -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{"short_description":"Config update","change_type":"standard","change_category":"configuration","rollback_plan":"Revert config"}' \
  | json_pp

echo ""
echo "=== High-Risk Evaluation ==="
curl -s -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{"short_description":"Emergency DB migration","change_type":"emergency","change_category":"database","complexity":"high","rollback_plan":"Manual restore"}' \
  | json_pp
```

---

## Response Format

Successful evaluation returns:

```json
{
  "evaluation_id": "uuid",
  "change_id": "CHG123456",
  "status": "completed",
  "result": {
    "risk_score": 42.5,
    "risk_band": "Medium",
    "risk_color": "yellow",
    "probabilities": {
      "success": 0.68,
      "deploy_fail": 0.08,
      "rollback": 0.12,
      "post_deploy_incident": 0.08,
      "degraded": 0.04
    },
    "drivers": [
      {
        "driver": "Risk description",
        "evidence": "Supporting evidence",
        "historical_reference": "CHG001: Similar case"
      }
    ],
    "positive_signals": [...],
    "missing_evidence": [...],
    "recommendations": [
      {
        "recommendation": "Action to take",
        "category": "testing|planning|scheduling|rollback|monitoring",
        "rationale": "Why this helps"
      }
    ],
    "similar_changes": [...],
    "extracted_entities": {...},
    "metadata": {...}
  }
}
```

---

## Understanding Risk Scores

- **0-30 (Low, 🟢)**: Safe to proceed, auto-approve eligible
- **31-55 (Medium, 🟡)**: Standard CAB review recommended
- **56-75 (High, 🟠)**: Enhanced scrutiny required, consider risk reduction
- **76-100 (Critical, 🔴)**: Executive approval needed, significant risk

---

## Common Scenarios to Test

### Scenario 1: Perfect Change (Low Risk)
- Standard change type
- Comprehensive testing (unit, integration, load)
- Automated rollback plan with time estimate
- Off-peak timing
- Single service impact

### Scenario 2: Risky Change (High Risk)
- Emergency change type
- Database migration
- Minimal testing
- Manual rollback only
- Peak hours timing
- Multiple service impact

### Scenario 3: Improving a Change
1. Submit high-risk change
2. Review recommendations
3. Add missing tests
4. Improve rollback plan
5. Reschedule to off-peak
6. Re-evaluate (score should improve)

---

## Tips

1. **Use json_pp for pretty output**: Add `| json_pp` to curl commands
2. **Save responses**: Add `-o response.json` to save output
3. **Verbose mode**: Add `-v` to see request/response headers
4. **Silent mode**: Add `-s` to hide progress
5. **Test different times**: Vary `planned_window` to test peak/off-peak detection

---

## Troubleshooting

**Connection Refused**:
```bash
# Check if server is running
curl http://localhost:3001/health
# If not, start it:
cd backend && npm start
```

**Invalid JSON**:
```bash
# Validate your JSON first
echo '{"your":"json"}' | json_pp
```

**Command Not Found (json_pp)**:
```bash
# Use python instead
curl http://localhost:3001/health | python -m json.tool
```

---

## Next Steps

After testing:
1. Review the risk assessments
2. Check recommendation quality
3. Compare similar historical changes
4. Test edge cases
5. Integrate with your frontend

Enjoy testing your Change Management System! 🚀
