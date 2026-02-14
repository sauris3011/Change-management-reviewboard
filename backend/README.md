# Change Management System - Backend

LLM-Driven Change Management System backend implementation using Node.js, Express, SQLite, and OpenAI.

## Features

- **Risk Assessment Engine**: Evaluates change requests using ML-based risk scoring
- **Entity Extraction**: Automatically identifies services and AWS resources from descriptions
- **Historical Analysis**: Finds similar past changes to inform risk predictions
- **LLM Integration**: Generates detailed explanations and recommendations using OpenAI GPT-4
- **RESTful API**: Clean API design following the specification
- **SQLite Database**: Lightweight database with sample historical data

## Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)

# Start the server
npm start
```

The server will start on `http://localhost:3001`

### Development Mode

```bash
npm run dev
```

This uses Node's built-in watch mode for auto-restart on file changes.

## API Endpoints

### 1. Evaluate Change Request

**POST** `/api/v1/evaluate-change`

Evaluates a new change request and returns comprehensive risk assessment.

**Request Body:**
```json
{
  "short_description": "Deploy OMS Order API v2.3.5",
  "long_description": "Update order API with new payment gateway integration",
  "change_type": "normal",
  "change_category": "deployment",
  "implementation_steps": [
    "1. Deploy new ECS task definition",
    "2. Update API Gateway routing",
    "3. Run smoke tests"
  ],
  "validation_steps": [
    "Unit tests passed",
    "Integration tests passed"
  ],
  "rollback_plan": "Revert ECS task definition to previous version, takes 5 minutes",
  "planned_window": "2024-03-20T02:00:00Z",
  "impacted_services": ["svc-oms-order-api"]
}
```

**Response:**
```json
{
  "evaluation_id": "uuid-1234",
  "change_id": "CHG001234",
  "status": "completed",
  "result": {
    "risk_score": 67.5,
    "risk_band": "High",
    "risk_color": "orange",
    "probabilities": {
      "success": 0.32,
      "deploy_fail": 0.15,
      "rollback": 0.28,
      "post_deploy_incident": 0.18,
      "degraded": 0.07
    },
    "drivers": [...],
    "positive_signals": [...],
    "recommendations": [...],
    "similar_changes": [...]
  }
}
```

### 2. Get Prediction Details

**GET** `/api/v1/predictions/:id`

Retrieves a specific risk assessment by prediction ID.

### 3. Get Change History

**GET** `/api/v1/changes/history`

Lists historical changes with optional filters.

**Query Parameters:**
- `outcome`: Filter by outcome (success, rollback, deploy_fail, etc.)
- `category`: Filter by change category
- `type`: Filter by change type
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

### 4. Get Change Details

**GET** `/api/v1/changes/:id`

Get detailed information about a specific change.

### 5. Get Statistics

**GET** `/api/v1/changes/stats/summary`

Get summary statistics about changes and risk distribution.

### 6. Health Check

**GET** `/health`

Check server health and service status.

## Architecture

```
backend/
├── server.js              # Main Express server
├── database/
│   ├── init.js           # Database initialization with sample data
│   └── db.js             # Database utility class
├── services/
│   ├── entityExtractor.js    # Extract services/AWS resources
│   ├── featureEngine.js      # Calculate risk features
│   ├── riskScorer.js         # Risk scoring and probability calculation
│   └── llmService.js         # OpenAI integration
└── routes/
    ├── changes.js        # Change evaluation endpoints
    └── history.js        # Historical data endpoints
```

## Risk Scoring Algorithm

The system uses the following formula from the specification:

```
RiskScore = P(failure)*60 + BlastRadius*15 + EvidencePenalty*10 + HistoricalFailureRate*10 + EmergencyModifier*5
```

**Risk Bands:**
- **0-30**: Low (Green) - Auto-approve eligible
- **31-55**: Medium (Yellow) - Standard review
- **56-75**: High (Orange) - Enhanced scrutiny
- **76-100**: Critical (Red) - Executive approval required

## Feature Calculations

### Rollback Quality Score (0-1)
- Base: 0.3 for having a plan
- +0.2 for time estimates
- +0.15 for specific steps
- +0.2 for automation keywords
- +0.15 for verification steps
- Penalties for manual processes or impossible rollbacks

### Evidence Score (0-1)
- Base: 0.2 for some validation
- +0.15 per test type (unit, integration, load, e2e, security, smoke)
- +0.15 for test results
- +0.1 for coverage metrics
- Penalties for missing tests

### Blast Radius
- Based on number of impacted services
- Additional weight for critical AWS components (RDS, DynamoDB, API Gateway)
- Normalized to 0-100 scale

## Sample Data

The database includes 10 sample historical changes with various outcomes:

- **CHG001**: Database migration → Rollback
- **CHG002**: Peak hour deployment → Incident
- **CHG003**: Config change off-peak → Success
- **CHG004**: Lambda update without tests → Deploy failure
- **CHG005**: Well-tested standard change → Success
- **CHG006**: Infrastructure change → Success
- **CHG007**: Emergency hotfix → Degraded
- **CHG008**: Kafka configuration → Success
- **CHG009**: API Gateway update → Success
- **CHG010**: Database indexing → Success

## LLM Integration

### With OpenAI API Key

Set `OPENAI_API_KEY` in `.env` to enable real LLM integration:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

The system will use GPT-4 to generate:
- Detailed risk drivers with evidence
- Positive signals
- Missing evidence gaps
- Actionable recommendations

### Without OpenAI API Key

The system automatically falls back to intelligent mock data that:
- Analyzes actual risk features
- References real historical changes
- Provides contextual recommendations
- Maintains consistent quality

## Environment Variables

```bash
# OpenAI API key (optional - uses mock data if not set)
OPENAI_API_KEY=your_openai_api_key_here

# Server port
PORT=3001

# Environment
NODE_ENV=development
```

## Error Handling

All endpoints include comprehensive error handling:
- **400**: Bad request (missing required fields)
- **404**: Resource not found
- **500**: Internal server error

Errors include descriptive messages and debugging information in development mode.

## CORS Configuration

CORS is enabled for all origins to support frontend development. For production, configure specific allowed origins in `server.js`.

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Evaluate a change
curl -X POST http://localhost:3001/api/v1/evaluate-change \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "Deploy new payment service",
    "change_type": "normal",
    "change_category": "deployment",
    "rollback_plan": "Revert via CI/CD pipeline",
    "validation_steps": ["Unit tests passed", "Integration tests passed"]
  }'

# Get history
curl http://localhost:3001/api/v1/changes/history

# Get statistics
curl http://localhost:3001/api/v1/changes/stats/summary
```

### Using Postman

1. Import the following collection or create requests manually
2. Base URL: `http://localhost:3001`
3. Test each endpoint with sample payloads

## Database Schema

### Changes Table
Stores all change requests (historical and new).

**Key Fields:**
- `change_id`: Unique identifier
- `short_description`: Brief summary
- `change_type`: standard, normal, emergency
- `change_category`: deployment, configuration, database, infrastructure
- `complexity`: low, medium, high, critical
- `rollback_quality_score`: 0-1 scale
- `evidence_score`: 0-1 scale
- `final_outcome`: success, rollback, deploy_fail, post_deploy_incident, degraded

### Predictions Table
Stores risk assessments and audit trail.

**Key Fields:**
- `prediction_id`: UUID
- `change_id`: Reference to change
- `risk_score`: 0-100
- `probabilities`: JSON outcome probabilities
- `drivers`: JSON risk drivers
- `recommendations`: JSON actionable recommendations
- `model_version`: Model version used

## Performance

Typical evaluation times:
- Entity extraction: <10ms
- Feature calculation: <20ms
- Historical similarity search: <50ms
- LLM generation: 2-5 seconds (or <50ms for mock)
- **Total**: 3-6 seconds with OpenAI, <200ms with mock

## Future Enhancements

- [ ] Graph database integration (Neo4j/Neptune) for dependency analysis
- [ ] Vector store for semantic similarity search
- [ ] Real-time model retraining pipeline
- [ ] Integration with ServiceNow API
- [ ] WebSocket support for real-time updates
- [ ] Batch evaluation endpoints
- [ ] Advanced caching strategies
- [ ] Metrics and observability (CloudWatch, DataDog)

## Troubleshooting

### Database Issues
```bash
# Delete and reinitialize database
rm database/change_management.db
npm start  # Will recreate with sample data
```

### Port Already in Use
```bash
# Change port in .env
PORT=3002
```

### OpenAI API Errors
- Check API key validity
- Verify sufficient credits
- System will automatically fall back to mock data

## License

MIT

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
