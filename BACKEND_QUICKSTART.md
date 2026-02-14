# Backend Quick Start Guide

This guide will help you get the Change Management System backend up and running in minutes.

## Prerequisites

- Node.js 16+ installed (verify with `node --version`)
- npm (comes with Node.js)

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- express (web framework)
- sqlite3 (database)
- cors (cross-origin support)
- dotenv (environment variables)
- openai (LLM integration)
- uuid (unique IDs)

### Step 2: Configure Environment (Optional)

The backend works out of the box with mock LLM data. To enable real OpenAI integration:

```bash
# Edit the .env file
nano .env  # or use your preferred editor

# Replace the API key:
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

**Note:** If you don't have an OpenAI API key, the system will automatically use intelligent mock data that still provides full functionality.

### Step 3: Start the Server

```bash
npm start
```

You should see:

```
============================================================
Change Management System Backend
============================================================
Server running on: http://localhost:3001
Environment: development
LLM Service: Mock

Available endpoints:
  POST   http://localhost:3001/api/v1/evaluate-change
  GET    http://localhost:3001/api/v1/predictions/:id
  GET    http://localhost:3001/api/v1/changes/history
  GET    http://localhost:3001/api/v1/changes/:id
  GET    http://localhost:3001/api/v1/changes/stats/summary
  GET    http://localhost:3001/health
============================================================
```

## Verify Installation

### Option 1: Using Browser

Open your browser and go to:
```
http://localhost:3001/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-13T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "llm": "not_configured"
  }
}
```

### Option 2: Using Test Script

In a new terminal (keep the server running):

```bash
# Node.js 18+ required for native fetch
node test-api.js
```

This will run comprehensive tests of all API endpoints.

### Option 3: Using curl

```bash
# Health check
curl http://localhost:3001/health

# Get historical changes
curl http://localhost:3001/api/v1/changes/history

# Evaluate a change
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Deploy new feature to production",
    "change_type": "normal",
    "change_category": "deployment",
    "rollback_plan": "Revert via CI/CD pipeline",
    "validation_steps": ["Unit tests passed", "Integration tests passed"]
  }'
```

## Quick API Tour

### 1. Evaluate a Low-Risk Change

```bash
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Update feature flag configuration",
    "change_type": "standard",
    "change_category": "configuration",
    "implementation_steps": ["Update config", "Verify propagation"],
    "validation_steps": ["Tested in staging", "Smoke tests passed"],
    "rollback_plan": "Disable feature flag via API, takes 2 minutes",
    "planned_window": "2024-03-20T03:00:00Z",
    "impacted_services": ["svc-checkout"]
  }'
```

Expected: Risk Score ~20-35 (Low/Medium)

### 2. Evaluate a High-Risk Change

```bash
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Database migration during peak hours",
    "long_description": "Schema changes to orders table",
    "change_type": "emergency",
    "change_category": "database",
    "complexity": "high",
    "implementation_steps": ["Apply schema", "Migrate data"],
    "validation_steps": ["Tested in staging"],
    "rollback_plan": "Manual database restore",
    "planned_window": "2024-03-20T14:00:00Z",
    "impacted_services": ["svc-order-api", "svc-payment"]
  }'
```

Expected: Risk Score ~65-85 (High/Critical)

### 3. View Historical Data

```bash
# Get all historical changes
curl http://localhost:3001/api/v1/changes/history

# Filter by outcome
curl "http://localhost:3001/api/v1/changes/history?outcome=rollback"

# Get statistics
curl http://localhost:3001/api/v1/changes/stats/summary
```

## Understanding the Response

When you evaluate a change, you'll get:

```json
{
  "evaluation_id": "uuid-here",
  "change_id": "CHG123456",
  "status": "completed",
  "result": {
    "risk_score": 67.5,           // 0-100 scale
    "risk_band": "High",          // Low/Medium/High/Critical
    "risk_color": "orange",       // green/yellow/orange/red
    "probabilities": {            // Outcome likelihoods
      "success": 0.32,
      "deploy_fail": 0.15,
      "rollback": 0.28,
      "post_deploy_incident": 0.18,
      "degraded": 0.07
    },
    "drivers": [                  // Why it's risky
      {
        "driver": "Database migration without adequate rollback plan",
        "evidence": "rollback_quality_score: 0.3",
        "historical_reference": "CHG001: Similar migration required rollback"
      }
    ],
    "positive_signals": [...],    // What's good
    "missing_evidence": [...],    // What's missing
    "recommendations": [          // How to reduce risk
      {
        "recommendation": "Conduct load testing before deployment",
        "category": "testing",
        "rationale": "Performance issues are #2 cause of rollbacks"
      }
    ],
    "similar_changes": [...]      // Historical precedents
  }
}
```

## Sample Database

The backend comes with 10 pre-loaded historical changes:

- **CHG001**: Database migration → Rollback (poor rollback plan)
- **CHG002**: API deployment peak hours → Incident SEV2
- **CHG003**: Config change off-peak → Success
- **CHG004**: Lambda update no tests → Deploy failure
- **CHG005**: Standard change good tests → Success
- **CHG006**: Infrastructure change → Success
- **CHG007**: Emergency hotfix → Degraded
- **CHG008**: Kafka configuration → Success
- **CHG009**: API Gateway update → Success
- **CHG010**: Database indexing → Success

These provide realistic context for risk predictions.

## Common Issues

### Port 3001 Already in Use

```bash
# Change port in .env
echo "PORT=3002" >> .env
```

### Database Not Initializing

```bash
# Delete and recreate
rm database/change_management.db
npm start
```

### Node Version Too Old

```bash
# Check version
node --version

# Need 16.0.0 or higher
# Download from: https://nodejs.org/
```

## Next Steps

1. **Explore the API**: Try different change scenarios
2. **Check the Code**: Review `/backend/services/` for risk logic
3. **Integrate Frontend**: The API is ready for frontend connection
4. **Add Real Data**: Replace sample data with your historical changes
5. **Configure OpenAI**: Add API key for real LLM explanations

## API Documentation

Full API documentation is available in `/backend/README.md`

## Architecture Overview

```
Request → Express Server
    ↓
Entity Extractor (identify services, AWS resources)
    ↓
Feature Engine (calculate risk features)
    ↓
Risk Scorer (compute probabilities & risk score)
    ↓
LLM Service (generate explanations)
    ↓
SQLite Database (store assessment)
    ↓
Response → Client
```

## Support

For detailed documentation, see:
- `/backend/README.md` - Comprehensive backend docs
- `/SPECIFICATION.md` - Full system specification
- `/FRONTEND_SPEC.md` - Frontend integration guide

## Development Tips

### Auto-Restart on Changes

```bash
npm run dev
```

### View Database

```bash
sqlite3 database/change_management.db
sqlite> .tables
sqlite> SELECT * FROM changes LIMIT 5;
sqlite> .quit
```

### Add More Sample Data

Edit `database/init.js` and add more changes to the `sampleChanges` array, then delete the database and restart:

```bash
rm database/change_management.db
npm start
```

### Test Different Scenarios

Create a `test-scenarios.json` file with various change types and test them systematically.

## Production Considerations

Before deploying to production:

1. [ ] Set `NODE_ENV=production` in `.env`
2. [ ] Configure proper CORS origins in `server.js`
3. [ ] Add authentication/authorization
4. [ ] Set up proper logging (Winston, Bunyan)
5. [ ] Configure monitoring (CloudWatch, DataDog)
6. [ ] Use PostgreSQL instead of SQLite
7. [ ] Add rate limiting
8. [ ] Set up CI/CD pipeline
9. [ ] Configure SSL/TLS
10. [ ] Add comprehensive error tracking (Sentry)

---

**Congratulations!** Your Change Management System backend is now running. You can start evaluating changes and getting AI-powered risk assessments.
