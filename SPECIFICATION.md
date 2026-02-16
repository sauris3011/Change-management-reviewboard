# LLM-Driven Change Management Optimization System
## Technical Specification Document

**Version:** 1.0
**Date:** 2026-02-13
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Scope](#2-system-scope)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Data Model Specification](#5-data-model-specification)
6. [Graph Model Specification](#6-graph-model-specification)
7. [Change Evaluation Workflow](#7-change-evaluation-workflow)
8. [Prediction Model](#8-prediction-model)
9. [Output Contract](#9-output-contract)
10. [Risk Scoring Logic](#10-risk-scoring-logic)
11. [Explainability Rules](#11-explainability-rules)
12. [Front-End Specification](#12-front-end-specification)
13. [Governance & Audit](#13-governance--audit)
14. [Security Requirements](#14-security-requirements)
15. [Observability](#15-observability)
16. [Performance Targets](#16-performance-targets)
17. [Phase-wise Delivery Plan](#17-phase-wise-delivery-plan)
18. [Acceptance Criteria](#18-acceptance-criteria)
19. [Future Enhancements](#19-future-enhancements)
20. [Summary](#20-summary)

---

## 1. Executive Summary

### 1.1 Objective

Build an AI-powered system that:

- **Ingests** historical change management records (ServiceNow-style)
- **Constructs** a structured + graph-based knowledge model of:
  - Services
  - AWS resources
  - Configuration Items (CIs)
  - Incidents
  - Dependencies
- **Evaluates** new change requests before implementation
- **Produces**:
  - Risk score (0–100)
  - Outcome probabilities
  - Failure/success drivers (explainable)
  - Gap analysis
  - De-risk recommendations
  - Historical citations
- **Logs** a full audit trail for every prediction

### 1.2 Business Value

- Reduce change-related incidents by predicting high-risk changes
- Enable data-driven CAB (Change Advisory Board) decisions
- Accelerate approval cycles for low-risk changes
- Improve change quality through actionable recommendations
- Build organizational knowledge base from historical patterns

---

## 2. System Scope

### 2.1 MVP Scope

**Domains:**
- Order Management (OMS)
- Carrier / Fulfillment

**Infrastructure:**
- AWS-native microservices including:
  - ECS (Elastic Container Service)
  - Lambda
  - API Gateway
  - RDS Postgres
  - DynamoDB
  - MSK (Managed Streaming for Kafka)
  - SQS (Simple Queue Service)
  - SNS (Simple Notification Service)
  - IAM (Identity and Access Management)
  - CloudWatch

**Data Sources:**
- ServiceNow Change Records
- ServiceNow Incidents
- PIR/RCA (Post-Incident Review / Root Cause Analysis) notes
- CMDB / CI catalog
- AWS resource mapping

### 2.2 Out of Scope (MVP)

- Real-time change monitoring
- Automated rollback execution
- Multi-cloud environments (Azure, GCP)
- Legacy on-premise systems
- Change approval workflow automation

---

## 3. High-Level Architecture

### 3.1 Logical Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      API & UI Layer                             │
│              (Change Request Submission & Results)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              LLM Orchestration Engine                           │
│         (Prompt Management, Reasoning, Explanation)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Risk & Feature Engine  │   │ Prediction & Scoring    │
│  (Feature Extraction)   │   │  (ML Model Inference)   │
└─────────────────────────┘   └─────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Knowledge Stores                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │   Graph DB   │  │ Vector Store │         │
│  │  (Relational)│  │  (Relations) │  │  (Semantic)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│            Data Normalization & Feature Extraction              │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Ingestion Layer                              │
│          (ServiceNow, AWS, CMDB Integration)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Ingestion Layer** | Fetch and normalize data from ServiceNow, AWS APIs, CMDB |
| **Data Normalization** | Standardize formats, extract entities, validate data quality |
| **Knowledge Stores** | Persist structured data, relationships, and embeddings |
| **Risk & Feature Engine** | Compute risk indicators, dependency metrics, blast radius |
| **Prediction Service** | Execute ML models, calculate probabilities |
| **LLM Orchestration** | Generate explanations, recommendations, and narratives |
| **API & UI Layer** | Expose evaluation endpoints, serve dashboard |
| **Audit Layer** | Log all predictions, decisions, and model versions |

---

## 4. Technology Stack

### 4.1 Recommended Technologies

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Backend API** | Node.js / Java (Spring Boot) | Scalable, AWS-native, good library support |
| **Data Store** | PostgreSQL (RDS) | ACID compliance, JSONB support, proven |
| **Graph DB** | Neo4j / Amazon Neptune | Native graph queries, relationship traversal |
| **Vector Store** | OpenSearch Vector / pgvector | Semantic search, embeddings storage |
| **Object Storage** | S3 | Document storage, attachments, logs |
| **Orchestration** | AWS Step Functions | Complex workflow management |
| **LLM** | OpenAI / Anthropic / Bedrock | Advanced reasoning, explanation generation |
| **Deployment** | ECS Fargate | Serverless containers, auto-scaling |
| **Authentication** | IAM + JWT | AWS-native, secure token management |
| **Observability** | CloudWatch + X-Ray | Metrics, logs, distributed tracing |
| **Message Queue** | SQS | Async processing, decoupling |
| **Caching** | ElastiCache (Redis) | Fast feature retrieval, session management |

### 4.2 Development Tools

- **Version Control:** Git (GitHub/GitLab)
- **CI/CD:** GitHub Actions / AWS CodePipeline
- **Infrastructure as Code:** Terraform / CloudFormation
- **API Documentation:** OpenAPI 3.0 / Swagger
- **Testing:** Jest / JUnit, Postman
- **Monitoring:** Datadog / New Relic (optional)

---

## 5. Data Model Specification

### 5.1 Relational Schema (PostgreSQL)

#### Table: `changes`

Stores historical and new change requests.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `change_id` | VARCHAR(50) | Unique change identifier | PK, NOT NULL |
| `short_description` | VARCHAR(255) | Brief change summary | NOT NULL |
| `long_description` | TEXT | Detailed change description | |
| `change_type` | VARCHAR(50) | Type (standard, normal, emergency) | NOT NULL |
| `change_category` | VARCHAR(50) | Category (deployment, config, infra) | NOT NULL |
| `risk_rating_initial` | VARCHAR(20) | Initial risk assessment | |
| `complexity` | VARCHAR(20) | Low, Medium, High, Critical | |
| `impacted_services` | JSONB | Array of service IDs/names | |
| `impacted_cis` | JSONB | Array of CI IDs | |
| `db_migration_flag` | BOOLEAN | Indicates DB schema change | DEFAULT FALSE |
| `aws_components` | JSONB | List of AWS resources affected | |
| `implementation_window` | TIMESTAMP | Scheduled change time | |
| `rollback_quality_score` | DECIMAL(3,2) | Rollback plan quality (0-1) | |
| `evidence_score` | DECIMAL(3,2) | Test evidence completeness (0-1) | |
| `final_outcome` | VARCHAR(50) | success, deploy_fail, rollback, incident, degraded | |
| `failure_reason_code` | VARCHAR(100) | Categorized failure reason | |
| `incident_id` | VARCHAR(50) | Linked incident (if any) | FK → incidents |
| `created_at` | TIMESTAMP | Record creation time | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT NOW() |

**Indexes:**
- `idx_changes_outcome` on `final_outcome`
- `idx_changes_category` on `change_category`
- `idx_changes_services` (GIN) on `impacted_services`
- `idx_changes_window` on `implementation_window`

---

#### Table: `incidents`

Stores incidents linked to changes.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `incident_id` | VARCHAR(50) | Unique incident identifier | PK, NOT NULL |
| `change_id` | VARCHAR(50) | Associated change | FK → changes |
| `severity` | VARCHAR(20) | SEV1, SEV2, SEV3, SEV4 | NOT NULL |
| `start_time` | TIMESTAMP | Incident start time | NOT NULL |
| `end_time` | TIMESTAMP | Incident resolution time | |
| `rca_category` | VARCHAR(100) | Root cause category | |
| `summary` | TEXT | Incident summary and RCA | |
| `created_at` | TIMESTAMP | Record creation time | DEFAULT NOW() |

**Indexes:**
- `idx_incidents_change` on `change_id`
- `idx_incidents_severity` on `severity`

---

#### Table: `services`

Catalog of microservices.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `service_id` | VARCHAR(50) | Unique service identifier | PK, NOT NULL |
| `name` | VARCHAR(100) | Service name | NOT NULL |
| `domain` | VARCHAR(50) | Business domain (OMS, Carrier, etc.) | NOT NULL |
| `runtime` | VARCHAR(50) | ECS, Lambda, EC2, etc. | |
| `criticality_score` | DECIMAL(3,2) | Business criticality (0-1) | |
| `volatility_score` | DECIMAL(3,2) | Historical change frequency (0-1) | |
| `created_at` | TIMESTAMP | Record creation time | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT NOW() |

**Indexes:**
- `idx_services_domain` on `domain`
- `idx_services_criticality` on `criticality_score`

---

#### Table: `ci_catalog`

Configuration Items (CIs) registry.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `ci_id` | VARCHAR(50) | Unique CI identifier | PK, NOT NULL |
| `type` | VARCHAR(50) | Application, Database, Infrastructure | NOT NULL |
| `owner_team` | VARCHAR(100) | Responsible team | |
| `business_criticality` | VARCHAR(20) | Critical, High, Medium, Low | |
| `dependencies` | JSONB | List of dependent CI IDs | |
| `created_at` | TIMESTAMP | Record creation time | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT NOW() |

**Indexes:**
- `idx_ci_type` on `type`
- `idx_ci_dependencies` (GIN) on `dependencies`

---

#### Table: `predictions`

Audit trail of all risk evaluations.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `prediction_id` | UUID | Unique prediction identifier | PK, DEFAULT gen_random_uuid() |
| `change_id` | VARCHAR(50) | Change being evaluated | FK → changes, NOT NULL |
| `risk_score` | DECIMAL(5,2) | Computed risk (0-100) | NOT NULL |
| `probabilities` | JSONB | Outcome probabilities | NOT NULL |
| `drivers` | JSONB | Risk drivers with evidence | |
| `recommendations` | JSONB | De-risk recommendations | |
| `retrieved_change_ids` | JSONB | Similar changes used in evaluation | |
| `model_version` | VARCHAR(20) | ML model version used | NOT NULL |
| `llm_model` | VARCHAR(50) | LLM model used (gpt-4, claude-3, etc.) | |
| `prompt_hash` | VARCHAR(64) | Hash of prompt template | |
| `feature_vector` | JSONB | Snapshot of computed features | |
| `created_at` | TIMESTAMP | Prediction timestamp | DEFAULT NOW() |

**Indexes:**
- `idx_predictions_change` on `change_id`
- `idx_predictions_score` on `risk_score`
- `idx_predictions_model` on `model_version`

---

### 5.2 JSONB Schema Examples

#### `impacted_services` (in `changes` table)

```json
[
  {
    "service_id": "svc-oms-order-api",
    "service_name": "Order API",
    "impact_type": "deployment"
  },
  {
    "service_id": "svc-oms-inventory",
    "service_name": "Inventory Service",
    "impact_type": "configuration"
  }
]
```

#### `aws_components` (in `changes` table)

```json
{
  "ecs_services": ["oms-order-api", "oms-inventory-service"],
  "lambda_functions": ["order-validator", "inventory-sync"],
  "rds_instances": ["oms-prod-db"],
  "dynamodb_tables": ["order-cache"],
  "sqs_queues": ["order-events-queue"],
  "iam_roles": ["ecs-task-role-oms"]
}
```

#### `probabilities` (in `predictions` table)

```json
{
  "success": 0.72,
  "deploy_fail": 0.08,
  "rollback": 0.12,
  "post_deploy_incident": 0.06,
  "degraded": 0.02
}
```

#### `drivers` (in `predictions` table)

```json
[
  {
    "driver": "DB migration without adequate rollback plan",
    "evidence": "rollback_quality_score: 0.3",
    "historical_reference": "CHG0045231 (similar migration, rollback required)"
  },
  {
    "driver": "High-criticality service impacted during peak hours",
    "evidence": "criticality_score: 0.95, implementation_window: 2024-03-15 14:00 UTC",
    "historical_reference": "CHG0038172 (peak hour deployment, SEV2 incident)"
  }
]
```

---

## 6. Graph Model Specification

### 6.1 Node Types

| Node Type | Properties | Description |
|-----------|-----------|-------------|
| **Change** | change_id, description, outcome, risk_score, timestamp | Represents a change request |
| **Incident** | incident_id, severity, start_time, end_time, rca_category | Represents an operational incident |
| **Service** | service_id, name, domain, criticality_score | Microservice or application |
| **CI** | ci_id, type, owner_team, business_criticality | Configuration Item |
| **AWSResource** | resource_id, resource_type, region, account_id | AWS infrastructure component |
| **DBObject** | object_id, object_type (table/schema/procedure), database_name | Database artifact |
| **Topic** | topic_id, topic_name, type (Kafka/SNS) | Message broker topic |
| **Queue** | queue_id, queue_name, type (SQS/MSK) | Message queue |
| **Team** | team_id, team_name, domain | Owning team |

### 6.2 Edge Types (Relationships)

| Relationship | From | To | Properties | Description |
|--------------|------|-----|-----------|-------------|
| **IMPACTS** | Change | Service | impact_type, severity | Change affects a service |
| **IMPACTS** | Change | CI | impact_type | Change affects a CI |
| **IMPACTS** | Change | AWSResource | modification_type | Change modifies AWS resource |
| **CAUSED** | Change | Incident | causation_confidence | Change caused an incident |
| **DEPENDS_ON** | Service | Service | dependency_type | Service-to-service dependency |
| **DEPENDS_ON** | CI | CI | dependency_type | CI-to-CI dependency |
| **ASSOCIATED_WITH** | AWSResource | Service | association_type | AWS resource belongs to service |
| **USES** | Service | DBObject | access_type | Service uses database object |
| **PUBLISHES_TO** | Service | Topic | message_schema | Service publishes to topic |
| **CONSUMES_FROM** | Service | Queue | message_schema | Service consumes from queue |
| **OWNS** | Team | Service | ownership_type | Team owns service |
| **SIMILAR_TO** | Change | Change | similarity_score | Changes are semantically similar |

### 6.3 Sample Cypher Queries

#### Find all services impacted by a change

```cypher
MATCH (c:Change {change_id: 'CHG0012345'})-[:IMPACTS]->(s:Service)
RETURN s.name, s.criticality_score
ORDER BY s.criticality_score DESC
```

#### Find historical changes to same service with incidents

```cypher
MATCH (c:Change)-[:IMPACTS]->(s:Service {service_id: 'svc-oms-order-api'})
MATCH (c)-[:CAUSED]->(i:Incident)
WHERE i.severity IN ['SEV1', 'SEV2']
RETURN c.change_id, c.short_description, c.final_outcome, i.severity, i.rca_category
ORDER BY c.timestamp DESC
LIMIT 10
```

#### Calculate blast radius (dependency depth)

```cypher
MATCH path = (s:Service {service_id: 'svc-oms-order-api'})-[:DEPENDS_ON*1..3]->(dep:Service)
RETURN dep.name, length(path) AS depth, dep.criticality_score
ORDER BY depth, dep.criticality_score DESC
```

#### Find similar changes by graph similarity

```cypher
MATCH (c1:Change {change_id: 'CHG0012345'})-[:IMPACTS]->(entity)
MATCH (c2:Change)-[:IMPACTS]->(entity)
WHERE c1 <> c2 AND c2.final_outcome IS NOT NULL
WITH c2, COUNT(entity) AS overlap
RETURN c2.change_id, c2.final_outcome, overlap
ORDER BY overlap DESC
LIMIT 15
```

---

## 7. Change Evaluation Workflow

### 7.1 Step 1: Change Intake

**API Endpoint:**
```
POST /api/v1/evaluate-change
```

**Request Body:**

```json
{
  "short_description": "Deploy OMS Order API v2.3.5 with new payment gateway integration",
  "long_description": "This change implements integration with NewPay payment gateway...",
  "change_type": "normal",
  "change_category": "deployment",
  "implementation_steps": [
    "1. Deploy new ECS task definition",
    "2. Update API Gateway to route to new version",
    "3. Run smoke tests",
    "4. Monitor for 30 minutes"
  ],
  "validation_steps": [
    "Unit tests passed",
    "Integration tests passed",
    "Load testing completed"
  ],
  "rollback_plan": "Revert ECS task definition to v2.3.4, rollback takes ~5 minutes",
  "planned_window": "2024-03-20T02:00:00Z",
  "impacted_services": ["svc-oms-order-api", "svc-payment-processor"],
  "attachments": [
    {"name": "test_results.pdf", "s3_url": "s3://..."}
  ]
}
```

**Response:**

```json
{
  "evaluation_id": "eval-uuid-1234",
  "status": "completed",
  "result": { /* See Output Contract section */ }
}
```

---

### 7.2 Step 2: Entity Extraction

The system extracts structured entities from the change description:

**Extracted Entities (ChangeFingerprint):**

```json
{
  "services": [
    {"id": "svc-oms-order-api", "name": "Order API", "confidence": 0.98},
    {"id": "svc-payment-processor", "name": "Payment Processor", "confidence": 0.95}
  ],
  "aws_resources": [
    {"type": "ecs_service", "name": "oms-order-api", "confidence": 0.99},
    {"type": "api_gateway", "name": "oms-api-gw", "confidence": 0.87}
  ],
  "db_objects": [
    {"type": "table", "name": "orders", "operation": "read", "confidence": 0.72}
  ],
  "kafka_topics": [],
  "sqs_queues": [
    {"name": "order-events-queue", "operation": "publish", "confidence": 0.65}
  ],
  "iam_policies": [
    {"name": "ecs-task-role-oms", "modification": "assume_role", "confidence": 0.45}
  ],
  "feature_flags": [
    {"name": "new_payment_gateway", "operation": "enable", "confidence": 0.88}
  ],
  "deployment_strategy": {
    "type": "blue_green",
    "confidence": 0.62
  }
}
```

**Extraction Methods:**
- Named Entity Recognition (NER) using LLM
- Regex patterns for AWS resource ARNs
- Service catalog lookup
- CMDB cross-reference

---

### 7.3 Step 3: Feature Engineering

Compute deterministic risk indicators:

| Feature | Type | Description | Range |
|---------|------|-------------|-------|
| `ci_criticality_aggregate` | DECIMAL | Average criticality of impacted CIs | 0-1 |
| `dependency_depth` | INTEGER | Maximum dependency chain length | 0-10+ |
| `blast_radius_score` | DECIMAL | Number of downstream services * criticality | 0-100 |
| `db_migration_indicator` | BOOLEAN | Schema change detected | 0/1 |
| `event_schema_change_indicator` | BOOLEAN | Message format change detected | 0/1 |
| `iam_security_modification_indicator` | BOOLEAN | IAM policy change detected | 0/1 |
| `test_evidence_score` | DECIMAL | Completeness of test results | 0-1 |
| `rollback_feasibility_score` | DECIMAL | Quality of rollback plan | 0-1 |
| `window_risk_factor` | DECIMAL | Risk based on time of day/week | 0-1 |
| `emergency_flag` | BOOLEAN | Emergency change bypass | 0/1 |
| `historical_failure_rate` | DECIMAL | Past failure rate for same CI/service | 0-1 |
| `change_frequency` | INTEGER | Number of changes to CI in last 30 days | 0-100+ |
| `time_since_last_incident` | INTEGER | Days since last incident on service | 0-365+ |
| `team_experience_score` | DECIMAL | Team's historical success rate | 0-1 |

**Feature Computation Example:**

```python
def compute_blast_radius(service_id, graph_db):
    """
    Calculate blast radius as weighted sum of:
    - Direct downstream dependencies
    - Indirect dependencies (up to depth 3)
    - Criticality scores
    """
    query = """
    MATCH path = (s:Service {service_id: $service_id})-[:DEPENDS_ON*0..3]->(dep:Service)
    RETURN dep.service_id, dep.criticality_score, length(path) AS depth
    """
    results = graph_db.execute(query, service_id=service_id)

    blast_radius = 0
    for record in results:
        weight = 1.0 / (record['depth'] + 1)  # Decay by depth
        blast_radius += record['criticality_score'] * weight

    return min(blast_radius * 10, 100)  # Scale to 0-100
```

---

### 7.4 Step 4: Hybrid Retrieval

Retrieve historically similar changes using three methods:

#### 4.1 Graph Query (Structural Similarity)

```cypher
// Find changes impacting same entities
MATCH (new:Change {change_id: $new_change_id})-[:IMPACTS]->(entity)
MATCH (historical:Change)-[:IMPACTS]->(entity)
WHERE historical <> new
  AND historical.final_outcome IS NOT NULL
  AND historical.timestamp > date() - duration({days: 365})
WITH historical, COUNT(DISTINCT entity) AS entity_overlap
RETURN historical.change_id,
       historical.final_outcome,
       entity_overlap,
       historical.short_description
ORDER BY entity_overlap DESC
LIMIT 20
```

#### 4.2 Postgres Query (Categorical Similarity)

```sql
SELECT
    c.change_id,
    c.short_description,
    c.final_outcome,
    c.change_category,
    c.failure_reason_code,
    (
        -- Similarity score based on shared attributes
        (CASE WHEN c.change_category = $new_category THEN 2 ELSE 0 END) +
        (CASE WHEN c.change_type = $new_type THEN 1 ELSE 0 END) +
        (CASE WHEN c.db_migration_flag = $new_db_migration THEN 1 ELSE 0 END) +
        (CASE WHEN c.impacted_services && $new_services THEN 3 ELSE 0 END)
    ) AS categorical_similarity_score
FROM changes c
WHERE c.final_outcome IS NOT NULL
  AND c.created_at > NOW() - INTERVAL '1 year'
  AND (
    c.change_category = $new_category
    OR c.impacted_services && $new_services
    OR c.failure_reason_code IS NOT NULL
  )
ORDER BY categorical_similarity_score DESC
LIMIT 20
```

#### 4.3 Vector Search (Semantic Similarity)

```python
def semantic_search(new_change_description, vector_store, top_k=20):
    """
    Perform semantic similarity search using embeddings
    """
    # Generate embedding for new change
    new_embedding = embedding_model.encode(new_change_description)

    # Search vector store
    query = {
        "size": top_k,
        "query": {
            "knn": {
                "change_embedding": {
                    "vector": new_embedding,
                    "k": top_k
                }
            }
        },
        "_source": ["change_id", "short_description", "final_outcome"],
        "filter": {
            "term": {"final_outcome_exists": True}
        }
    }

    results = vector_store.search(index="changes", body=query)
    return results['hits']['hits']
```

**Embedding Strategy:**
- Concatenate: `short_description + long_description + implementation_steps + PIR_summary`
- Model: `text-embedding-ada-002` or `sentence-transformers/all-MiniLM-L6-v2`
- Dimension: 768 or 1536

#### 4.4 Re-ranking (Fusion)

Combine results from all three methods using a weighted scoring function:

```python
def rerank_similar_changes(graph_results, postgres_results, vector_results):
    """
    Combine and re-rank results using multiple signals
    """
    change_scores = defaultdict(lambda: {
        'entity_overlap': 0,
        'categorical_similarity': 0,
        'semantic_similarity': 0,
        'recency_weight': 0,
        'outcome_relevance': 0
    })

    # Weight entity overlap (graph)
    for idx, result in enumerate(graph_results):
        change_id = result['change_id']
        change_scores[change_id]['entity_overlap'] = result['entity_overlap'] * 0.3
        change_scores[change_id]['outcome_relevance'] = (
            2.0 if result['final_outcome'] in ['deploy_fail', 'rollback', 'incident'] else 1.0
        )

    # Weight categorical similarity (postgres)
    for idx, result in enumerate(postgres_results):
        change_id = result['change_id']
        change_scores[change_id]['categorical_similarity'] = result['categorical_similarity_score'] * 0.25

    # Weight semantic similarity (vector)
    for idx, result in enumerate(vector_results):
        change_id = result['change_id']
        change_scores[change_id]['semantic_similarity'] = result['_score'] * 0.25

    # Recency weight (favor recent changes)
    for change_id in change_scores:
        change_detail = get_change_detail(change_id)
        days_old = (datetime.now() - change_detail['created_at']).days
        change_scores[change_id]['recency_weight'] = max(0, 1 - (days_old / 365)) * 0.2

    # Calculate final score
    final_scores = []
    for change_id, scores in change_scores.items():
        final_score = sum(scores.values())
        final_scores.append({
            'change_id': change_id,
            'final_score': final_score,
            'breakdown': scores
        })

    # Sort and return top 5-15
    final_scores.sort(key=lambda x: x['final_score'], reverse=True)
    return final_scores[:15]
```

---

## 8. Prediction Model

### 8.1 Structured Model (Primary Probability Engine)

**Model Type:** Gradient Boosted Trees (XGBoost) or Logistic Regression

**Training Data:**
- Features: All computed features from Step 3
- Labels: Historical `final_outcome` values

**Model Outputs:**

```json
{
  "probabilities": {
    "success": 0.72,
    "deploy_fail": 0.08,
    "rollback": 0.12,
    "post_deploy_incident": 0.06,
    "degraded": 0.02
  }
}
```

**Model Training Pipeline:**

```python
# Feature matrix
X = feature_dataframe[FEATURE_COLUMNS]
y = feature_dataframe['final_outcome']

# Train multi-class classifier
model = XGBClassifier(
    objective='multi:softprob',
    num_class=5,  # 5 outcome classes
    max_depth=6,
    learning_rate=0.1,
    n_estimators=100
)

model.fit(X, y)

# Feature importance
feature_importance = pd.DataFrame({
    'feature': FEATURE_COLUMNS,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
```

**Model Versioning:**
- Version format: `v{major}.{minor}.{patch}` (e.g., `v1.0.0`)
- Stored in model registry (S3 + metadata in RDS)
- A/B testing capability for new model versions

---

### 8.2 LLM Role (Reasoning + Explanation)

**LLM Input Context:**

```json
{
  "new_change": {
    "short_description": "...",
    "long_description": "...",
    "extracted_entities": { /* ChangeFingerprint */ },
    "computed_features": { /* All feature values */ }
  },
  "similar_changes": [
    {
      "change_id": "CHG0045231",
      "short_description": "...",
      "final_outcome": "rollback",
      "failure_reason": "DB migration rollback required",
      "similarity_score": 0.87
    }
    // ... more similar changes
  ],
  "risk_rules": [
    {
      "rule_id": "R001",
      "condition": "db_migration_flag = true AND rollback_quality_score < 0.5",
      "severity": "high",
      "message": "DB migrations without robust rollback plans are high-risk"
    }
    // ... more rules
  ],
  "ml_probabilities": { /* From structured model */ }
}
```

**LLM Prompt Template:**

```
You are a Change Risk Assessment AI. Analyze the provided change request and generate a risk assessment.

# New Change Request
{new_change.short_description}

## Details
{new_change.long_description}

## Extracted Entities
Services: {extracted_entities.services}
AWS Resources: {extracted_entities.aws_resources}
DB Objects: {extracted_entities.db_objects}

## Computed Risk Features
- CI Criticality Aggregate: {computed_features.ci_criticality_aggregate}
- Blast Radius Score: {computed_features.blast_radius_score}
- DB Migration: {computed_features.db_migration_indicator}
- Test Evidence Score: {computed_features.test_evidence_score}
- Rollback Feasibility: {computed_features.rollback_feasibility_score}
- Historical Failure Rate: {computed_features.historical_failure_rate}

## Similar Historical Changes
{for each similar_change:}
- {similar_change.change_id}: {similar_change.short_description}
  - Outcome: {similar_change.final_outcome}
  - Failure Reason: {similar_change.failure_reason}
  - Similarity: {similar_change.similarity_score}
{end for}

## ML Model Predictions
Success Probability: {ml_probabilities.success}
Deploy Fail Probability: {ml_probabilities.deploy_fail}
Rollback Probability: {ml_probabilities.rollback}
Incident Probability: {ml_probabilities.post_deploy_incident}

## Risk Rules Triggered
{for each triggered_rule:}
- [{triggered_rule.severity}] {triggered_rule.message}
{end for}

# Your Task
Generate a structured risk assessment with:

1. **Risk Drivers** (3-5 items): Key factors increasing risk, with evidence from features and historical citations
2. **Positive Signals** (2-4 items): Factors reducing risk
3. **Missing Evidence** (0-3 items): Information gaps that increase uncertainty
4. **Recommendations** (3-6 items): Actionable steps to reduce risk

## Output Format (JSON)
{
  "risk_drivers": [
    {
      "driver": "<concise driver description>",
      "evidence": "<reference to feature or data>",
      "historical_reference": "<change_id and brief context>"
    }
  ],
  "positive_signals": [
    {
      "signal": "<positive factor>",
      "evidence": "<supporting data>"
    }
  ],
  "missing_evidence": [
    {
      "gap": "<what is missing>",
      "impact": "<how this increases uncertainty>"
    }
  ],
  "recommendations": [
    {
      "recommendation": "<actionable step>",
      "category": "testing|planning|scheduling|rollback|monitoring",
      "rationale": "<why this helps>",
      "historical_precedent": "<change_id if applicable>"
    }
  ]
}

IMPORTANT:
- Only cite change_ids that were provided in "Similar Historical Changes"
- Do not fabricate data or change IDs
- Base all drivers on provided features and similar changes
- Be specific and actionable
```

**LLM Configuration:**
- Model: GPT-4, Claude 3 Opus, or AWS Bedrock (Anthropic)
- Temperature: 0.2 (low for consistency)
- Max tokens: 2000
- Timeout: 30 seconds

---

## 9. Output Contract

### 9.1 API Response Schema

```json
{
  "evaluation_id": "uuid",
  "change_id": "CHG0012345",
  "risk_score": 67.5,
  "risk_band": "high",
  "probabilities": {
    "success": 0.32,
    "deploy_fail": 0.15,
    "rollback": 0.28,
    "post_deploy_incident": 0.18,
    "degraded": 0.07
  },
  "drivers": [
    {
      "driver": "DB migration without adequate rollback plan",
      "evidence": "rollback_quality_score: 0.3, db_migration_flag: true",
      "historical_reference": "CHG0045231: Similar DB migration required rollback after 2 hours due to data inconsistency"
    },
    {
      "driver": "High-criticality service impacted during peak hours",
      "evidence": "criticality_score: 0.95, implementation_window: 2024-03-15 14:00 UTC (peak traffic period)",
      "historical_reference": "CHG0038172: Peak hour deployment caused SEV2 incident, 45min downtime"
    },
    {
      "driver": "Insufficient load testing evidence",
      "evidence": "test_evidence_score: 0.4, no performance test results provided",
      "historical_reference": "CHG0042018: Deployment without load testing caused capacity issues"
    }
  ],
  "positive_signals": [
    {
      "signal": "Comprehensive unit and integration test coverage",
      "evidence": "validation_steps indicate 98% test coverage, all tests passed"
    },
    {
      "signal": "Blue-green deployment strategy reduces risk",
      "evidence": "deployment_strategy: blue_green, allows instant rollback"
    }
  ],
  "missing_evidence": [
    {
      "gap": "No performance/load testing results",
      "impact": "Cannot assess system behavior under production load"
    },
    {
      "gap": "Rollback plan lacks database-specific steps",
      "impact": "DB rollback may be complex or time-consuming"
    }
  ],
  "recommendations": [
    {
      "recommendation": "Conduct load testing with 150% of peak traffic before deployment",
      "category": "testing",
      "rationale": "Service handles payment processing; performance degradation unacceptable",
      "historical_precedent": null
    },
    {
      "recommendation": "Document detailed DB rollback procedure with time estimates",
      "category": "rollback",
      "rationale": "DB migrations are point of no return; must have clear rollback path",
      "historical_precedent": "CHG0045231"
    },
    {
      "recommendation": "Reschedule to low-traffic window (02:00-04:00 UTC)",
      "category": "scheduling",
      "rationale": "Reduces blast radius if issues occur; more time to recover",
      "historical_precedent": "CHG0038172"
    },
    {
      "recommendation": "Add CloudWatch alarms for payment success rate and API latency",
      "category": "monitoring",
      "rationale": "Early detection of payment gateway integration issues",
      "historical_precedent": null
    }
  ],
  "similar_changes": [
    {
      "change_id": "CHG0045231",
      "outcome": "rollback",
      "summary": "OMS DB schema migration - rolled back due to data inconsistency",
      "similarity_score": 0.87,
      "days_ago": 45
    },
    {
      "change_id": "CHG0038172",
      "outcome": "post_deploy_incident",
      "summary": "Order API deployment during peak - caused SEV2 incident",
      "similarity_score": 0.76,
      "days_ago": 120
    },
    {
      "change_id": "CHG0042018",
      "outcome": "degraded",
      "summary": "Payment service update - performance issues, required hotfix",
      "similarity_score": 0.71,
      "days_ago": 89
    }
  ],
  "audit_trace": {
    "model_version": "v1.2.3",
    "llm_model": "gpt-4-turbo-2024-03-01",
    "retrieved_change_ids": ["CHG0045231", "CHG0038172", "CHG0042018", "CHG0039841", "CHG0051203"],
    "feature_vector_hash": "a3f5e8d9c2b1",
    "prompt_hash": "7f9e2a1b4c8d",
    "graph_query_time_ms": 145,
    "vector_search_time_ms": 89,
    "ml_inference_time_ms": 23,
    "llm_inference_time_ms": 3421,
    "total_evaluation_time_ms": 4892,
    "timestamp": "2024-03-10T18:32:15Z"
  },
  "metadata": {
    "evaluator": "system",
    "evaluation_trigger": "api_request",
    "feature_extraction_version": "v2.1.0"
  }
}
```

### 9.2 Risk Band Mapping

| Risk Score | Risk Band | CAB Action | Description |
|------------|-----------|-----------|-------------|
| 0-30 | Low | Auto-approve | Routine change, minimal risk |
| 31-55 | Medium | Standard review | Normal CAB review process |
| 56-75 | High | Enhanced review | Requires thorough CAB scrutiny |
| 76-100 | Critical | Executive approval | Major risk, requires senior leadership approval |

---

## 10. Risk Scoring Logic

### 10.1 Risk Score Formula

```
RiskScore =
    (P(failure) × 60) +              // ML probability of any failure
    (BlastRadiusScore × 15) +        // Impact magnitude
    (EvidencePenalty × 10) +         // Testing/planning gaps
    (HistoricalFailureRate × 10) +   // Past failures on same CI/service
    (EmergencyModifier × 5)          // Emergency change penalty

Where:
- P(failure) = P(deploy_fail) + P(rollback) + P(post_deploy_incident) + P(degraded)
- BlastRadiusScore = normalized 0-1
- EvidencePenalty = 1 - min(test_evidence_score, rollback_feasibility_score)
- HistoricalFailureRate = normalized 0-1
- EmergencyModifier = 1 if emergency change, else 0
```

### 10.2 Component Calculations

#### Blast Radius Score

```python
def calculate_blast_radius_score(impacted_services, graph_db):
    """
    Calculate blast radius considering:
    - Number of impacted services
    - Criticality of each service
    - Depth of downstream dependencies
    """
    total_blast = 0

    for service in impacted_services:
        # Direct impact
        criticality = get_service_criticality(service)
        total_blast += criticality * 0.5

        # Downstream impact
        downstream = get_downstream_services(service, max_depth=3, graph_db)
        for dep_service, depth in downstream:
            dep_criticality = get_service_criticality(dep_service)
            # Decay factor: 0.8^depth
            total_blast += dep_criticality * (0.8 ** depth) * 0.5

    # Normalize to 0-1 scale (assume max blast radius is 10)
    normalized = min(total_blast / 10, 1.0)
    return normalized
```

#### Evidence Penalty

```python
def calculate_evidence_penalty(change):
    """
    Penalize missing evidence:
    - Test results
    - Rollback plan quality
    - Validation steps
    - Pre-prod deployment
    """
    test_score = calculate_test_evidence_score(change)
    rollback_score = calculate_rollback_quality_score(change)

    # Take the minimum (weakest link)
    evidence_quality = min(test_score, rollback_score)

    # Penalty is inverse (1 - quality)
    penalty = 1 - evidence_quality
    return penalty
```

#### Historical Failure Rate

```python
def calculate_historical_failure_rate(impacted_cis, lookback_days=180):
    """
    Calculate failure rate for impacted CIs in recent history
    """
    total_changes = 0
    failed_changes = 0

    for ci_id in impacted_cis:
        changes = query_changes_by_ci(ci_id, lookback_days)
        total_changes += len(changes)
        failed_changes += len([c for c in changes if c.final_outcome != 'success'])

    if total_changes == 0:
        return 0.5  # Unknown, assume medium risk

    failure_rate = failed_changes / total_changes
    return failure_rate
```

### 10.3 Example Calculation

```
Given:
- P(success) = 0.32, P(deploy_fail) = 0.15, P(rollback) = 0.28,
  P(post_deploy_incident) = 0.18, P(degraded) = 0.07
- BlastRadiusScore = 0.72
- test_evidence_score = 0.4, rollback_feasibility_score = 0.3
- HistoricalFailureRate = 0.28 (28% of past changes to this CI failed)
- Emergency change = false

Calculation:
P(failure) = 0.15 + 0.28 + 0.18 + 0.07 = 0.68
EvidencePenalty = 1 - min(0.4, 0.3) = 1 - 0.3 = 0.7

RiskScore = (0.68 × 60) + (0.72 × 15) + (0.7 × 10) + (0.28 × 10) + (0 × 5)
          = 40.8 + 10.8 + 7.0 + 2.8 + 0
          = 61.4

Risk Band: High (56-75)
```

---

## 11. Explainability Rules

### 11.1 LLM Output Requirements

The LLM must adhere to the following rules:

1. **Historical Citations**
   - Every driver that references past failures MUST cite a specific `change_id`
   - Change IDs must be from the provided `similar_changes` list
   - Format: `"historical_reference": "CHG0012345: brief context"`

2. **Evidence Mapping**
   - Each driver must reference at least one computed feature or data point
   - Format: `"evidence": "feature_name: value, additional_context"`

3. **No Hallucination**
   - Do not invent change IDs, incidents, or data
   - If no similar historical change exists, set `"historical_reference": null`
   - Mark recommendations without precedent as `"historical_precedent": null`

4. **Recommendation Categories**
   - Must use one of: `testing`, `planning`, `scheduling`, `rollback`, `monitoring`
   - Include specific, actionable steps (not vague suggestions)

5. **Confidence Indicators**
   - If uncertainty is high due to missing data, state this in `missing_evidence`
   - Do not overstate confidence

### 11.2 Validation Rules

**Post-LLM Validation:**

```python
def validate_llm_output(llm_response, retrieved_change_ids):
    """
    Validate LLM output for hallucinations and compliance
    """
    errors = []

    # Check that all cited change_ids are valid
    cited_ids = extract_change_ids_from_response(llm_response)
    for cited_id in cited_ids:
        if cited_id not in retrieved_change_ids:
            errors.append(f"Hallucinated change_id: {cited_id}")

    # Check that drivers have evidence
    for driver in llm_response['drivers']:
        if not driver.get('evidence'):
            errors.append(f"Driver missing evidence: {driver['driver']}")

    # Check recommendation categories
    valid_categories = ['testing', 'planning', 'scheduling', 'rollback', 'monitoring']
    for rec in llm_response['recommendations']:
        if rec['category'] not in valid_categories:
            errors.append(f"Invalid recommendation category: {rec['category']}")

    if errors:
        raise ValidationError(errors)

    return True
```

### 11.3 Explainability Depth Levels

Different user personas require different explanation depth:

| Persona | Explanation Depth | Details Provided |
|---------|------------------|------------------|
| Developer | Technical | Feature values, similar changes, code-level details |
| CAB Member | Strategic | Risk drivers, business impact, recommendations |
| Executive | Summary | Risk score, risk band, top 3 drivers |
| Auditor | Full | Complete audit trail, model version, all features |

---

## 12. Front-End Specification

### 12.1 Technology Stack

**Framework & Libraries:**
- **React 18+** with TypeScript
- **UI Library:** Material-UI (MUI) or Ant Design
- **State Management:** Redux Toolkit or Zustand
- **Routing:** React Router v6
- **Data Fetching:** React Query / TanStack Query
- **Charts:** Recharts or Chart.js
- **Forms:** React Hook Form + Yup validation
- **Date Handling:** date-fns or Day.js
- **HTTP Client:** Axios

**Build & Tooling:**
- **Build Tool:** Vite
- **Linting:** ESLint + Prettier
- **Testing:** Jest + React Testing Library
- **E2E Testing:** Playwright or Cypress

---

### 12.2 Page Specifications

#### 12.2.1 Change Submission Page

**Route:** `/submit-change`

**Purpose:** Allow users to submit new change requests for risk evaluation.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Header: Submit Change Request                    [Help] [X] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Basic Information                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Short Description*                                    │    │
│  │ ┌──────────────────────────────────────────────────┐ │    │
│  │ │ Deploy OMS Order API v2.3.5 with...             │ │    │
│  │ └──────────────────────────────────────────────────┘ │    │
│  │                                                        │    │
│  │ Long Description*                                     │    │
│  │ ┌──────────────────────────────────────────────────┐ │    │
│  │ │ This change implements integration...            │ │    │
│  │ │                                                   │ │    │
│  │ │                                                   │ │    │
│  │ └──────────────────────────────────────────────────┘ │    │
│  │                                                        │    │
│  │ Change Type*          Change Category*                │    │
│  │ [Normal     ▼]        [Deployment     ▼]             │    │
│  │                                                        │    │
│  │ Implementation Window*                                 │    │
│  │ [2024-03-20  📅]  [02:00 UTC  🕐]                    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Impacted Components                                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Services*                                             │    │
│  │ [+ Add Service]                                       │    │
│  │ ☑ svc-oms-order-api        [Remove]                 │    │
│  │ ☑ svc-payment-processor    [Remove]                 │    │
│  │                                                        │    │
│  │ AWS Resources                                          │    │
│  │ [+ Add Resource]                                       │    │
│  │ ☑ ECS: oms-order-api       [Remove]                 │    │
│  │ ☑ RDS: oms-prod-db         [Remove]                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Implementation Plan                                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Implementation Steps*                                 │    │
│  │ 1. [Deploy new ECS task definition                  ] │    │
│  │ 2. [Update API Gateway routing                      ] │    │
│  │ 3. [Run smoke tests                                 ] │    │
│  │ [+ Add Step]                                          │    │
│  │                                                        │    │
│  │ Validation Steps*                                     │    │
│  │ ☑ Unit tests passed (98% coverage)                   │    │
│  │ ☑ Integration tests passed                           │    │
│  │ ☐ Load testing completed                             │    │
│  │ [+ Add Validation]                                    │    │
│  │                                                        │    │
│  │ Rollback Plan*                                        │    │
│  │ ┌──────────────────────────────────────────────────┐ │    │
│  │ │ Revert ECS task definition to v2.3.4...         │ │    │
│  │ └──────────────────────────────────────────────────┘ │    │
│  │                                                        │    │
│  │ Estimated Rollback Time: [5] minutes                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Attachments                                                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [Upload Files] or drag and drop                       │    │
│  │ 📄 test_results.pdf (2.3 MB)    [Remove]            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  💾 Draft saved at 10:32 AM                          │    │
│  │                                                        │    │
│  │     [Save Draft]  [Preview]  [Submit for Review] ✓   │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- **Smart Validation:** Real-time field validation with helpful error messages
- **Auto-save:** Automatically saves draft every 30 seconds
- **Service Autocomplete:** Type-ahead search from CMDB catalog
- **AWS Resource Detection:** Parse descriptions to suggest AWS resources
- **Rollback Quality Score:** Visual indicator (progress bar) showing rollback plan completeness
- **Test Evidence Score:** Visual indicator showing testing completeness

**Form Validation Rules:**

```typescript
interface ChangeSubmissionForm {
  short_description: string; // Required, 10-255 chars
  long_description: string; // Required, 50+ chars
  change_type: 'standard' | 'normal' | 'emergency'; // Required
  change_category: 'deployment' | 'config' | 'infra' | 'data'; // Required
  implementation_window: Date; // Required
  impacted_services: string[]; // Required, min 1
  impacted_aws_resources?: AWSResource[];
  implementation_steps: string[]; // Required, min 2
  validation_steps: string[]; // Required, min 1
  rollback_plan: string; // Required, 50+ chars
  rollback_time_estimate?: number; // Optional, in minutes
  attachments?: File[];
}

// Validation schema (Yup)
const validationSchema = yup.object({
  short_description: yup.string()
    .required('Short description is required')
    .min(10, 'Must be at least 10 characters')
    .max(255, 'Must be less than 255 characters'),
  long_description: yup.string()
    .required('Detailed description is required')
    .min(50, 'Please provide at least 50 characters of detail'),
  impacted_services: yup.array()
    .min(1, 'Must specify at least one impacted service'),
  rollback_plan: yup.string()
    .required('Rollback plan is required')
    .min(50, 'Rollback plan must be detailed (50+ characters)')
});
```

---

#### 12.2.2 Risk Assessment Results Page

**Route:** `/assessment/:evaluation_id`

**Purpose:** Display risk evaluation results with full explainability.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard        Change: CHG0012345                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ⚠️  HIGH RISK                                Risk: 67.5 │  │
│  │                                                          │  │
│  │ This change has significant risk factors requiring     │  │
│  │ enhanced CAB review and additional validation.         │  │
│  │                                                          │  │
│  │ Risk Breakdown:                                         │  │
│  │ ████████████████░░░░  Failure Probability: 68%         │  │
│  │ ███████████████░░░░░  Blast Radius: 72/100             │  │
│  │ ███████████░░░░░░░░░  Evidence Gap: 70/100             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  [Overview] [Risk Drivers] [Recommendations] [Similar] [Audit]│
│  ──────────────────────────────────────────────────────────  │
│                                                                │
│  Overview Tab                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Change Summary                                          │  │
│  │ Deploy OMS Order API v2.3.5 with new payment gateway   │  │
│  │ integration                                             │  │
│  │                                                          │  │
│  │ Key Details                                             │  │
│  │ • Type: Normal                                          │  │
│  │ • Category: Deployment                                  │  │
│  │ • Window: 2024-03-20 02:00 UTC                         │  │
│  │ • Services: svc-oms-order-api, svc-payment-processor   │  │
│  │                                                          │  │
│  │ Outcome Probabilities                                   │  │
│  │ ┌──────────────────────────────────────────────────┐   │  │
│  │ │    Pie Chart                                      │   │  │
│  │ │    Success: 32%                                   │   │  │
│  │ │    Rollback: 28%                                  │   │  │
│  │ │    Incident: 18%                                  │   │  │
│  │ │    Deploy Fail: 15%                               │   │  │
│  │ │    Degraded: 7%                                   │   │  │
│  │ └──────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  Positive Signals                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✓ Comprehensive unit and integration test coverage     │  │
│  │   Evidence: 98% test coverage, all tests passed        │  │
│  │                                                          │  │
│  │ ✓ Blue-green deployment strategy reduces risk          │  │
│  │   Evidence: Allows instant rollback                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Risk Drivers Tab:**

```
┌──────────────────────────────────────────────────────────────┐
│  Risk Drivers (3)                                              │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔴 High Severity                                        │  │
│  │                                                          │  │
│  │ DB migration without adequate rollback plan             │  │
│  │                                                          │  │
│  │ Evidence:                                               │  │
│  │ • rollback_quality_score: 0.3 (Low)                    │  │
│  │ • db_migration_flag: true                              │  │
│  │                                                          │  │
│  │ Historical Reference:                                   │  │
│  │ 📋 CHG0045231: Similar DB migration required rollback  │  │
│  │    after 2 hours due to data inconsistency             │  │
│  │    [View Change]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🟠 Medium Severity                                      │  │
│  │                                                          │  │
│  │ High-criticality service impacted during peak hours     │  │
│  │                                                          │  │
│  │ Evidence:                                               │  │
│  │ • criticality_score: 0.95                              │  │
│  │ • implementation_window: 14:00 UTC (peak traffic)      │  │
│  │                                                          │  │
│  │ Historical Reference:                                   │  │
│  │ 📋 CHG0038172: Peak hour deployment caused SEV2        │  │
│  │    incident, 45min downtime                            │  │
│  │    [View Change]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🟡 Medium Severity                                      │  │
│  │                                                          │  │
│  │ Insufficient load testing evidence                      │  │
│  │                                                          │  │
│  │ Evidence:                                               │  │
│  │ • test_evidence_score: 0.4                             │  │
│  │ • No performance test results provided                 │  │
│  │                                                          │  │
│  │ Historical Reference:                                   │  │
│  │ 📋 CHG0042018: Deployment without load testing caused  │  │
│  │    capacity issues                                      │  │
│  │    [View Change]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  Missing Evidence (2)                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ⚠️ No performance/load testing results                  │  │
│  │    Impact: Cannot assess system behavior under load     │  │
│  │                                                          │  │
│  │ ⚠️ Rollback plan lacks database-specific steps          │  │
│  │    Impact: DB rollback may be complex or time-consuming│  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Recommendations Tab:**

```
┌──────────────────────────────────────────────────────────────┐
│  De-Risk Recommendations (4)                                   │
│                                                                │
│  Filter by: [All Categories ▼]                                │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🧪 TESTING                                              │  │
│  │                                                          │  │
│  │ Conduct load testing with 150% of peak traffic          │  │
│  │                                                          │  │
│  │ Rationale:                                              │  │
│  │ Service handles payment processing; performance         │  │
│  │ degradation is unacceptable                            │  │
│  │                                                          │  │
│  │ Historical Precedent: None                              │  │
│  │                                                          │  │
│  │ [Mark as Completed] [Dismiss]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔄 ROLLBACK                                             │  │
│  │                                                          │  │
│  │ Document detailed DB rollback procedure with estimates  │  │
│  │                                                          │  │
│  │ Rationale:                                              │  │
│  │ DB migrations are point of no return; must have clear   │  │
│  │ rollback path                                           │  │
│  │                                                          │  │
│  │ Historical Precedent:                                   │  │
│  │ 📋 CHG0045231 [View Change]                            │  │
│  │                                                          │  │
│  │ [Mark as Completed] [Dismiss]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 SCHEDULING                                           │  │
│  │                                                          │  │
│  │ Reschedule to low-traffic window (02:00-04:00 UTC)     │  │
│  │                                                          │  │
│  │ Rationale:                                              │  │
│  │ Reduces blast radius if issues occur; more time to      │  │
│  │ recover                                                 │  │
│  │                                                          │  │
│  │ Historical Precedent:                                   │  │
│  │ 📋 CHG0038172 [View Change]                            │  │
│  │                                                          │  │
│  │ [Mark as Completed] [Dismiss]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 MONITORING                                           │  │
│  │                                                          │  │
│  │ Add CloudWatch alarms for payment success rate and      │  │
│  │ API latency                                             │  │
│  │                                                          │  │
│  │ Rationale:                                              │  │
│  │ Early detection of payment gateway integration issues   │  │
│  │                                                          │  │
│  │ Historical Precedent: None                              │  │
│  │                                                          │  │
│  │ [Mark as Completed] [Dismiss]                           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Similar Changes Tab:**

```
┌──────────────────────────────────────────────────────────────┐
│  Similar Historical Changes (3)                                │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Change ID │ Outcome    │ Similarity │ Days Ago │      │    │
│  ├───────────┼────────────┼────────────┼──────────┤      │    │
│  │ CHG0045231│ 🔴 Rollback│ 87%        │ 45       │[View]│    │
│  │ OMS DB schema migration - rolled back due to data   │    │
│  │ inconsistency                                        │    │
│  │                                                       │    │
│  │ CHG0038172│ 🔴 Incident│ 76%        │ 120      │[View]│    │
│  │ Order API deployment during peak - caused SEV2       │    │
│  │ incident                                             │    │
│  │                                                       │    │
│  │ CHG0042018│ 🟡 Degraded│ 71%        │ 89       │[View]│    │
│  │ Payment service update - performance issues,         │    │
│  │ required hotfix                                      │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Audit Trail Tab:**

```
┌──────────────────────────────────────────────────────────────┐
│  Audit Trail                                                   │
│                                                                │
│  Evaluation Details                                            │
│  • Evaluation ID: eval-a3f5-e8d9-c2b1                         │
│  • Timestamp: 2024-03-10 18:32:15 UTC                         │
│  • Evaluated by: system                                        │
│  • Duration: 4.89 seconds                                      │
│                                                                │
│  Model Information                                             │
│  • ML Model: v1.2.3 (XGBoost)                                 │
│  • LLM Model: gpt-4-turbo-2024-03-01                          │
│  • Prompt Hash: 7f9e2a1b4c8d                                  │
│                                                                │
│  Retrieval Statistics                                          │
│  • Graph query: 145ms                                          │
│  • Vector search: 89ms                                         │
│  • Retrieved changes: CHG0045231, CHG0038172, CHG0042018...   │
│                                                                │
│  Inference Timings                                             │
│  • ML inference: 23ms                                          │
│  • LLM inference: 3421ms                                       │
│                                                                │
│  Feature Vector                                                │
│  [Expand to view all 15 computed features]                    │
│                                                                │
│  [Download Audit Report] [Replay Evaluation]                  │
└──────────────────────────────────────────────────────────────┘
```

---

#### 12.2.3 CAB Dashboard

**Route:** `/cab`

**Purpose:** CAB members review newly submitted change requests that are pending review. These changes have not been implemented yet — the dashboard shows their risk band categorization (Low/Medium/High/Critical) based on risk scores derived from 500+ historical records.

**Key Behavior:**
- Only shows **pending changes** (changes without a `final_outcome`, submitted within the last 24 hours)
- No "Status" column — all displayed changes are pending by definition
- After **24 hours**, pending changes auto-transition to historical data with `final_outcome = 'success'`
- Clicking the **eye icon** navigates to `/assessment/{change_id}` for full risk reasoning

**Summary Cards:**
| Card | Description |
|------|-------------|
| Total Pending | Count of all pending changes |
| High Risk | Count of changes with risk_score > 55 |
| Critical Risk | Count of changes with risk_score > 75 |
| Avg Risk Score | Average risk score across all pending changes |

**Table Columns:**
| Column | Description |
|--------|-------------|
| Change ID | Unique identifier (e.g., CHG123456) |
| Description | Short description of the change |
| Risk Score | Numeric risk score (0-100) with color coding |
| Risk Band | Low / Medium / High / Critical chip |
| Submitter | Person who submitted the change |
| Submitted | Time since submission (e.g., "2h ago") |
| Actions | Eye icon to view full risk assessment |

**Filters:**
- Risk Band dropdown (All / Low / Medium / High / Critical)
- Search by Change ID, description, or submitter
- Refresh button

---

#### 12.2.4 Historical Changes Browser

**Route:** `/history`

**Purpose:** Search and analyze historical changes. Shows only completed/historical changes (those with a `final_outcome` set). Newly submitted changes auto-transition to historical after 24 hours.

**Pagination:** Server-side pagination with **50 records per page** (configurable: 25, 50, 100). Uses MUI `TablePagination` component showing "1-50 of 500" style indicator with Previous/Next navigation.

**Key Behavior:**
- Fetches from `/api/v1/changes/history?status=historical&limit=50&offset=0`
- Server returns paginated data with total count
- Client-side filters (Risk Band, Status, Search) apply to current page

**Table Columns:**
| Column | Description |
|--------|-------------|
| Change ID | Unique identifier |
| Description | Short description |
| Risk Score | Numeric risk score with color coding |
| Risk Band | Low / Medium / High / Critical chip |
| Status | Completed / Rejected chip |
| Submitter | Person who submitted |
| Submitted | Time since submission |
| Completed | Time since completion |

**Filters:**
- Risk Band dropdown (All / Low / Medium / High / Critical)
- Status dropdown (All / Pending / Rejected / Completed)
- Search by Change ID, description, or submitter
- Export to CSV button

---

#### 12.2.5 Analytics Dashboard

**Route:** `/analytics`

**Purpose:** Visualize trends, patterns, and system performance.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics Dashboard                  Period: [Last 30 Days ▼]│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Risk Distribution                     Incident Reduction      │
│  ┌──────────────────────────┐         ┌────────────────────┐ │
│  │  Donut Chart             │         │  Line Chart         │ │
│  │                           │         │  Before AI: 45     │ │
│  │  🟢 Low: 42%             │         │  After AI: 18      │ │
│  │  🟡 Medium: 35%          │         │  Reduction: 60%    │ │
│  │  🟠 High: 18%            │         │                     │ │
│  │  🔴 Critical: 5%         │         │  [Monthly Trend]    │ │
│  └──────────────────────────┘         └────────────────────┘ │
│                                                                │
│  Approval Cycle Time                   CAB Performance        │
│  ┌──────────────────────────┐         ┌────────────────────┐ │
│  │  Bar Chart               │         │  Metrics            │ │
│  │                           │         │  • Avg Review Time │ │
│  │  Low Risk: 2 hrs         │         │    3.2 hours       │ │
│  │  Medium: 8 hrs           │         │  • Override Rate   │ │
│  │  High: 24 hrs            │         │    12%             │ │
│  │  Critical: 48 hrs        │         │  • Feedback Score  │ │
│  │                           │         │    78% useful      │ │
│  └──────────────────────────┘         └────────────────────┘ │
│                                                                │
│  Domain Risk Heatmap                                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           │ Low │ Medium │ High │ Critical │ Total   │    │
│  ├───────────┼─────┼────────┼──────┼──────────┼─────────┤    │
│  │ OMS       │ 🟢15│ 🟡 8   │ 🟠 3 │ 🔴 1     │ 27      │    │
│  │ Carrier   │ 🟢22│ 🟡12   │ 🟠 2 │ 🔴 0     │ 36      │    │
│  │ Fulfillmnt│ 🟢18│ 🟡 6   │ 🟠 1 │ 🔴 0     │ 25      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Model Performance Metrics                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ • Prediction Accuracy: 83%                            │    │
│  │ • False Positive Rate: 22%                            │    │
│  │ • False Negative Rate: 9%                             │    │
│  │ • Model Version: v1.2.3                               │    │
│  │ • Calibration Error: 0.08                             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  [Export Dashboard] [Schedule Report]                         │
└──────────────────────────────────────────────────────────────┘
```

---

### 12.3 User Workflows

#### Workflow 1: Submit and Evaluate Change

```
1. User navigates to /submit-change
2. User fills out form with auto-save
3. User clicks "Submit for Review"
4. System validates form
5. System calls POST /api/v1/evaluate-change
6. Loading spinner: "Evaluating change request..."
7. System redirects to /assessment/:evaluation_id
8. User reviews risk score, drivers, recommendations
9. User can:
   a. Edit change based on recommendations
   b. Submit to CAB
   c. Download assessment report
```

#### Workflow 2: CAB Review and Approval

```
1. CAB member logs in and navigates to /dashboard
2. System displays pending changes sorted by risk
3. CAB member filters to "High Risk" changes
4. CAB member clicks CHG0012345
5. Side panel opens with summary
6. CAB member clicks "View Full Assessment"
7. System navigates to /assessment/:evaluation_id
8. CAB member reviews all tabs
9. CAB member returns to dashboard
10. CAB member selects "Approve with Conditions"
11. CAB member adds conditions and comments
12. CAB member clicks "Submit Decision"
13. System updates change status
14. Developer receives notification
```

#### Workflow 3: Historical Analysis

```
1. User navigates to /history
2. User filters: Outcome = "Incident", Domain = "OMS"
3. System displays matching changes
4. User clicks CHG0045231 "Details"
5. System displays full change details and PIR
6. User clicks "Timeline"
7. System shows change timeline with incidents
8. User exports results for offline analysis
```

---

### 12.4 Color Coding and Visual Language

**Risk Level Colors:**

| Risk Band | Color | Background | Text | Border |
|-----------|-------|------------|------|--------|
| Low (0-30) | Green | `#e8f5e9` | `#2e7d32` | `#4caf50` |
| Medium (31-55) | Yellow | `#fff9c4` | `#f57f17` | `#ffeb3b` |
| High (56-75) | Orange | `#ffe0b2` | `#e65100` | `#ff9800` |
| Critical (76-100) | Red | `#ffebee` | `#c62828` | `#f44336` |

**Outcome Icons:**

- 🔴 Incident / Rollback / Deploy Fail
- 🟡 Degraded
- 🟢 Success

**Category Icons:**

- 🧪 Testing
- 🔄 Rollback
- 📅 Scheduling
- 📊 Monitoring
- 📋 Planning

---

### 12.5 Responsive Design

**Breakpoints:**

- **Desktop:** ≥ 1200px (default layout)
- **Tablet:** 768px - 1199px (2-column layout, smaller charts)
- **Mobile:** < 768px (single column, stacked cards)

**Mobile Adaptations:**

- Navigation: Hamburger menu
- Tables: Horizontal scroll or card view
- Charts: Simplified, responsive sizing
- Side panels: Full-screen modals
- Form: Single-column layout

---

### 12.6 Accessibility (WCAG 2.1 AA)

**Requirements:**

1. **Keyboard Navigation:** All interactive elements accessible via keyboard
2. **Screen Reader Support:** Proper ARIA labels, semantic HTML
3. **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components
4. **Focus Indicators:** Visible focus states on all interactive elements
5. **Alt Text:** Descriptive alt text for images and icons
6. **Form Labels:** Explicit labels for all form fields
7. **Error Messages:** Clear, specific error messages with suggestions
8. **Responsive Text:** Supports 200% zoom without horizontal scroll

**Implementation:**

```tsx
// Example: Accessible risk badge component
interface RiskBadgeProps {
  score: number;
  band: 'low' | 'medium' | 'high' | 'critical';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ score, band }) => {
  const config = {
    low: { color: 'success', icon: '🟢', label: 'Low Risk' },
    medium: { color: 'warning', icon: '🟡', label: 'Medium Risk' },
    high: { color: 'orange', icon: '🟠', label: 'High Risk' },
    critical: { color: 'error', icon: '🔴', label: 'Critical Risk' }
  };

  const { color, icon, label } = config[band];

  return (
    <Chip
      icon={<span role="img" aria-label={label}>{icon}</span>}
      label={`${label}: ${score}`}
      color={color}
      aria-label={`Risk assessment: ${label} with score ${score} out of 100`}
      tabIndex={0}
    />
  );
};
```

---

### 12.7 Wireframe Summary

**Key Pages:**

1. **Change Submission:** Multi-section form with smart validation and auto-save
2. **Risk Assessment:** Tabbed interface with overview, drivers, recommendations, similar changes, audit trail
3. **CAB Dashboard:** Filterable table with side panel for quick review
4. **Historical Browser:** Search and filter interface for historical analysis
5. **Analytics Dashboard:** Charts and metrics showing system performance

**Navigation Structure:**

```
┌─ Submit Change
├─ Dashboard
│  ├─ Pending Changes
│  ├─ Approved Changes
│  └─ Rejected Changes
├─ History
│  └─ Search & Filter
├─ Analytics
│  ├─ Risk Distribution
│  ├─ Performance Metrics
│  └─ Trend Analysis
└─ Settings
   ├─ User Profile
   ├─ Team Management
   └─ System Configuration
```

---

## 13. Governance & Audit

### 12.1 Audit Trail Requirements

Every prediction must be fully reproducible. The `predictions` table captures:

| Field | Purpose |
|-------|---------|
| `change_id` | Link to evaluated change |
| `risk_score` | Final risk score |
| `probabilities` | All outcome probabilities |
| `drivers` | Risk drivers with evidence |
| `recommendations` | Generated recommendations |
| `retrieved_change_ids` | Similar changes used in evaluation |
| `model_version` | ML model version (e.g., v1.2.3) |
| `llm_model` | LLM model identifier |
| `prompt_hash` | SHA-256 hash of prompt template |
| `feature_vector` | Snapshot of all computed features |
| `created_at` | Evaluation timestamp |

### 12.2 Replay Capability

```python
def replay_evaluation(prediction_id):
    """
    Replay a historical evaluation using the same:
    - Model version
    - Feature values
    - Retrieved similar changes
    - Prompt template
    """
    prediction = db.get_prediction(prediction_id)

    # Load historical model version
    model = load_model_version(prediction['model_version'])

    # Reconstruct feature vector
    features = prediction['feature_vector']

    # Re-run ML inference
    ml_probabilities = model.predict_proba(features)

    # Retrieve same similar changes
    similar_changes = db.get_changes(prediction['retrieved_change_ids'])

    # Re-run LLM with same prompt
    prompt_template = get_prompt_by_hash(prediction['prompt_hash'])
    llm_response = llm_client.generate(prompt_template, context={
        'features': features,
        'similar_changes': similar_changes,
        'ml_probabilities': ml_probabilities
    })

    # Compare results
    return {
        'original': prediction,
        'replayed': llm_response,
        'match': compare_predictions(prediction, llm_response)
    }
```

### 12.3 Model Comparison

Compare performance of different model versions:

```sql
-- Compare risk scores across model versions
SELECT
    c.change_id,
    c.final_outcome,
    p1.risk_score AS v1_risk_score,
    p2.risk_score AS v2_risk_score,
    ABS(p1.risk_score - p2.risk_score) AS score_delta
FROM changes c
JOIN predictions p1 ON c.change_id = p1.change_id AND p1.model_version = 'v1.0.0'
JOIN predictions p2 ON c.change_id = p2.change_id AND p2.model_version = 'v2.0.0'
WHERE c.final_outcome IS NOT NULL
ORDER BY score_delta DESC
LIMIT 50;
```

### 12.4 Drift Detection

Monitor for concept drift and model degradation:

```python
def detect_drift(lookback_days=30):
    """
    Detect model drift by comparing predictions vs actual outcomes
    """
    recent_predictions = db.query(f"""
        SELECT p.risk_score, p.probabilities, c.final_outcome
        FROM predictions p
        JOIN changes c ON p.change_id = c.change_id
        WHERE c.final_outcome IS NOT NULL
          AND p.created_at > NOW() - INTERVAL '{lookback_days} days'
    """)

    # Calculate calibration error
    predicted_success_rates = []
    actual_success_rates = []

    # Bin by risk score
    for bin_start in range(0, 100, 10):
        bin_end = bin_start + 10
        bin_predictions = [
            p for p in recent_predictions
            if bin_start <= p['risk_score'] < bin_end
        ]

        if bin_predictions:
            avg_predicted_success = np.mean([
                p['probabilities']['success'] for p in bin_predictions
            ])
            actual_success_rate = np.mean([
                1 if p['final_outcome'] == 'success' else 0
                for p in bin_predictions
            ])

            predicted_success_rates.append(avg_predicted_success)
            actual_success_rates.append(actual_success_rate)

    # Calculate mean absolute calibration error
    calibration_error = np.mean(np.abs(
        np.array(predicted_success_rates) - np.array(actual_success_rates)
    ))

    if calibration_error > 0.15:  # Threshold
        alert_model_drift(calibration_error)

    return calibration_error
```

---

## 14. Security Requirements

### 13.1 Data Protection

| Requirement | Implementation |
|-------------|----------------|
| **Encryption at Rest** | RDS encryption enabled, S3 bucket encryption with KMS |
| **Encryption in Transit** | TLS 1.2+ for all API calls, HTTPS only |
| **PII Redaction** | Automatic redaction of emails, phone numbers, SSNs in descriptions |
| **Secrets Management** | AWS Secrets Manager for DB credentials, API keys |
| **Access Control** | IAM roles with least privilege, no hardcoded credentials |

### 13.2 Authentication & Authorization

**Authentication:**
- API authentication via JWT tokens
- Token expiry: 1 hour
- Refresh token rotation

**Authorization (RBAC):**

| Role | Permissions |
|------|------------|
| **Developer** | Submit changes for evaluation, view own change predictions |
| **CAB Member** | View all predictions, access historical data, generate reports |
| **Admin** | Manage system configuration, retrain models, access audit logs |
| **Auditor** | Read-only access to all data including audit trails |

**Implementation:**

```javascript
// Express.js middleware example
const authorize = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const roleHierarchy = ['developer', 'cab_member', 'admin', 'auditor'];

    if (!roleHierarchy.includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (roleHierarchy.indexOf(userRole) < roleHierarchy.indexOf(requiredRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Protected route
app.get('/api/v1/predictions',
  authenticateJWT,
  authorize('cab_member'),
  getPredictions
);
```

### 13.3 Multi-Tenant Separation

For enterprise deployment:

- **Database:** Tenant ID column on all tables
- **Row-Level Security:** PostgreSQL RLS policies
- **API:** Tenant ID in JWT, enforced on all queries
- **Data Isolation:** No cross-tenant data access

```sql
-- Row-level security example
CREATE POLICY tenant_isolation_policy ON changes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

ALTER TABLE changes ENABLE ROW LEVEL SECURITY;
```

### 13.4 PII Redaction

```python
import re

def redact_pii(text):
    """
    Redact PII from change descriptions before storage
    """
    # Email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)

    # Phone numbers
    text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)

    # SSNs
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', text)

    # IP addresses (be cautious, may be needed for debugging)
    # text = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '[IP]', text)

    return text
```

---

## 15. Observability

### 14.1 Key Metrics

**System Health Metrics:**

| Metric | Type | Alert Threshold | Description |
|--------|------|----------------|-------------|
| `evaluation_latency_ms` | Histogram | P95 > 20s | Time to complete evaluation |
| `retrieval_count` | Counter | < 3 similar changes | Number of similar changes retrieved |
| `prediction_accuracy` | Gauge | < 70% | Accuracy of risk predictions |
| `false_positive_rate` | Gauge | > 30% | Rate of low-risk predictions that failed |
| `false_negative_rate` | Gauge | > 15% | Rate of high-risk predictions that succeeded |
| `user_override_rate` | Gauge | > 40% | Rate of CAB overriding recommendations |
| `llm_timeout_rate` | Gauge | > 5% | Rate of LLM timeouts |
| `api_error_rate` | Gauge | > 1% | Rate of API errors |
| `model_drift_score` | Gauge | > 0.15 | Calibration error |

**Business Metrics:**

| Metric | Description |
|--------|-------------|
| `changes_evaluated_per_day` | Volume of evaluations |
| `high_risk_changes_prevented` | Changes rejected due to high risk |
| `incident_reduction_rate` | % reduction in change-related incidents |
| `cab_approval_cycle_time` | Time from submission to approval |

### 14.2 Logging Strategy

**Structured Logging (JSON format):**

```json
{
  "timestamp": "2024-03-10T18:32:15Z",
  "level": "INFO",
  "service": "risk-evaluation-service",
  "event": "evaluation_completed",
  "evaluation_id": "eval-uuid-1234",
  "change_id": "CHG0012345",
  "risk_score": 67.5,
  "risk_band": "high",
  "latency_ms": 4892,
  "retrieved_change_count": 12,
  "model_version": "v1.2.3",
  "llm_model": "gpt-4-turbo",
  "user_id": "user-5678",
  "trace_id": "a3f5e8d9c2b1"
}
```

**Log Levels:**
- `DEBUG`: Feature extraction details, query results
- `INFO`: Evaluation started/completed, API requests
- `WARN`: Retrieval returned < 5 similar changes, LLM slow response
- `ERROR`: LLM timeout, database connection failed, validation errors
- `CRITICAL`: Service outage, data corruption

### 14.3 CloudWatch Alarms

```yaml
alarms:
  - name: HighEvaluationLatency
    metric: evaluation_latency_ms
    statistic: p95
    threshold: 20000
    comparison: GreaterThanThreshold
    evaluation_periods: 2
    datapoints_to_alarm: 2

  - name: LowPredictionAccuracy
    metric: prediction_accuracy
    statistic: Average
    threshold: 0.70
    comparison: LessThanThreshold
    evaluation_periods: 7  # 7 days
    datapoints_to_alarm: 5

  - name: HighFalsePositiveRate
    metric: false_positive_rate
    statistic: Average
    threshold: 0.30
    comparison: GreaterThanThreshold
    evaluation_periods: 7
    datapoints_to_alarm: 5

  - name: LLMTimeoutRate
    metric: llm_timeout_rate
    statistic: Average
    threshold: 0.05
    comparison: GreaterThanThreshold
    evaluation_periods: 1
    datapoints_to_alarm: 1
```

### 14.4 Distributed Tracing

Use AWS X-Ray to trace requests across services:

```javascript
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

app.use(AWSXRay.express.openSegment('RiskEvaluationAPI'));

// Custom subsegment for retrieval
const segment = AWSXRay.getSegment();
const subsegment = segment.addNewSubsegment('hybrid_retrieval');
subsegment.addAnnotation('change_id', changeId);

try {
  const similarChanges = await retrieveSimilarChanges(changeId);
  subsegment.addMetadata('retrieved_count', similarChanges.length);
  subsegment.close();
} catch (error) {
  subsegment.addError(error);
  subsegment.close();
}

app.use(AWSXRay.express.closeSegment());
```

---

## 16. Performance Targets

### 15.1 MVP Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Evaluation Latency** | < 15 seconds (P95) | Time from API request to response |
| **Throughput** | 500 evaluations/day | Sustained load |
| **Concurrent Users** | 20 simultaneous evaluations | Peak load |
| **Data Ingestion** | 10,000 changes/hour | Batch processing |
| **Database Query Time** | < 500ms (P95) | PostgreSQL queries |
| **Graph Query Time** | < 200ms (P95) | Neo4j/Neptune queries |
| **Vector Search Time** | < 300ms (P95) | OpenSearch queries |
| **ML Inference Time** | < 50ms (P95) | Model prediction |
| **LLM Inference Time** | < 5 seconds (P95) | LLM explanation generation |

### 15.2 Phase 2 Targets (Scale-up)

| Metric | Target |
|--------|--------|
| **Throughput** | 5,000 evaluations/day |
| **Concurrent Users** | 100 simultaneous evaluations |
| **Evaluation Latency** | < 10 seconds (P95) |

### 15.3 Optimization Strategies

**Caching:**
- Cache feature computations for frequently accessed CIs
- Cache embeddings for historical changes
- Use Redis for session data and intermediate results

**Query Optimization:**
- Index all foreign keys
- Use materialized views for common aggregations
- Partition large tables by timestamp

**Parallel Processing:**
- Run graph query, postgres query, and vector search in parallel
- Use async/await for non-blocking I/O

**Model Optimization:**
- Use quantized models for faster inference
- Batch predictions when possible

---

## 17. Phase-wise Delivery Plan

### Phase 0: Synthetic Prototype (4 weeks)

**Goal:** Validate technical approach with synthetic data

**Deliverables:**
- [ ] Generate synthetic change dataset (1,000 changes)
- [ ] Implement basic feature extraction
- [ ] Build retrieval pipeline (graph + semantic)
- [ ] Integrate LLM for explanation generation
- [ ] Validate end-to-end workflow
- [ ] Demo to stakeholders

**Success Criteria:**
- System can evaluate a synthetic change in < 20 seconds
- LLM generates coherent explanations with citations
- Retrieval returns relevant similar changes

---

### Phase 1: Real Data Integration (8 weeks)

**Goal:** Ingest real ServiceNow data and validate predictions

**Deliverables:**
- [ ] ServiceNow API integration (read-only)
- [ ] Data pipeline for change records, incidents, CMDB
- [ ] Graph database setup and population
- [ ] Train ML model on historical data (6-12 months)
- [ ] Calibrate risk scoring against historical outcomes
- [ ] API development (REST endpoints)
- [ ] Basic web UI for evaluation
- [ ] Observability setup (CloudWatch, logs)

**Success Criteria:**
- ≥80% of historical major incidents assigned High/Critical risk
- ≥70% of successful low-risk changes score Low/Medium
- Model calibration error < 0.15
- API available with < 15s latency

**Key Milestones:**
1. Data ingestion complete (Week 2)
2. Graph model populated (Week 4)
3. ML model trained (Week 6)
4. API + UI ready (Week 8)

---

### Phase 2: Closed Loop Learning (6 weeks)

**Goal:** Continuously improve model with real outcomes

**Deliverables:**
- [ ] Automated outcome ingestion (changes → incidents)
- [ ] Model retraining pipeline (weekly)
- [ ] A/B testing framework for new models
- [ ] Drift detection and alerting
- [ ] CAB feedback integration
- [ ] Enhanced UI with feedback mechanism
- [ ] Historical replay capability

**Success Criteria:**
- Model retrains automatically every week
- Prediction accuracy improves by 10% over Phase 1
- CAB feedback indicates ≥70% recommendation usefulness

**Key Milestones:**
1. Outcome pipeline live (Week 2)
2. Retraining pipeline operational (Week 4)
3. A/B testing enabled (Week 6)

---

### Phase 3: Enterprise Rollout (12 weeks)

**Goal:** Scale to multiple domains and tenants

**Deliverables:**
- [ ] Multi-domain expansion (add 3-5 new domains)
- [ ] Multi-tenant support with data isolation
- [ ] Role-based access control (RBAC)
- [ ] Governance dashboards (for auditors, executives)
- [ ] Advanced analytics (trend reports, team scorecards)
- [ ] Integration with approval workflows
- [ ] Mobile-responsive UI
- [ ] SLA monitoring and reporting
- [ ] Documentation and training materials

**Success Criteria:**
- Support 5,000 evaluations/day
- < 10s evaluation latency
- 95% system uptime
- Expand to 5 business domains
- CAB adoption rate ≥ 80%

**Key Milestones:**
1. Multi-tenant architecture deployed (Week 4)
2. Domain 2 & 3 onboarded (Week 8)
3. Governance dashboards live (Week 10)
4. Full enterprise rollout (Week 12)

---

## 18. Acceptance Criteria

### 17.1 MVP Acceptance Criteria

The system is considered **MVP-ready** when:

1. **Prediction Accuracy**
   - [ ] ≥80% of historical major incidents (SEV1/SEV2) are assigned High or Critical risk
   - [ ] ≥70% of successful low-risk changes score Low or Medium risk
   - [ ] False positive rate < 30%
   - [ ] False negative rate < 15%

2. **Explainability**
   - [ ] Risk drivers correctly reference historical examples (no hallucinated change IDs)
   - [ ] All drivers include evidence (feature values or data references)
   - [ ] Recommendations are actionable and specific

3. **Performance**
   - [ ] Evaluation latency < 15 seconds (P95)
   - [ ] System handles 500 evaluations/day
   - [ ] API uptime ≥ 99%

4. **User Feedback**
   - [ ] CAB feedback indicates ≥70% recommendation usefulness
   - [ ] < 40% user override rate (CAB agreeing with system)

5. **Audit & Governance**
   - [ ] All predictions logged in audit trail
   - [ ] Historical evaluations can be replayed
   - [ ] Model version tracking functional

6. **Security**
   - [ ] Data encrypted at rest and in transit
   - [ ] PII redaction working
   - [ ] RBAC enforced

### 17.2 Validation Tests

**Test Case 1: High-Risk Change Detection**
- **Input:** Historical change that caused SEV1 incident
- **Expected:** Risk score ≥ 75, risk band = Critical, incident cited in drivers

**Test Case 2: Low-Risk Change**
- **Input:** Routine config change with no incident history
- **Expected:** Risk score ≤ 35, risk band = Low

**Test Case 3: Missing Evidence Penalty**
- **Input:** Change with no test results or rollback plan
- **Expected:** Higher risk score, missing evidence flagged in response

**Test Case 4: Retrieval Quality**
- **Input:** Change impacting known high-volatility service
- **Expected:** Retrieve ≥ 5 similar changes, cite relevant failures

**Test Case 5: Explanation Quality**
- **Input:** Any change evaluation
- **Expected:** Drivers reference specific features, recommendations are actionable

---

## 19. Future Enhancements

### 18.1 Planned Enhancements (Post-MVP)

| Enhancement | Description | Value |
|-------------|-------------|-------|
| **Auto-suggest Test Cases** | LLM generates test scenarios based on change | Improve test coverage |
| **Automatic Categorization** | AI categorizes change type/category | Reduce manual effort |
| **Approval Workflow Integration** | Auto-route low-risk changes, escalate high-risk | Accelerate approvals |
| **Optimal Window Prediction** | Recommend best deployment time based on traffic patterns | Minimize impact |
| **Preventive Alerting** | Alert before change if similar pattern caused recent incident | Proactive risk management |
| **Change Simulator** | Simulate "what-if" scenarios (e.g., "what if we deploy at 2pm?") | Decision support |
| **Natural Language Queries** | "Show me all changes to Order API last month" | Easier data access |
| **Auto-Rollback Triggers** | Define conditions for automatic rollback | Reduce MTTR |
| **Integration with CI/CD** | Evaluate changes directly in deployment pipeline | Shift-left risk assessment |
| **Slack/Teams Notifications** | Alert stakeholders of high-risk changes | Proactive communication |

### 18.2 Advanced Analytics

- **Team Performance Scorecards:** Track change success rates by team
- **Domain Risk Heatmaps:** Visualize risk across services and domains
- **Trend Analysis:** Identify increasing/decreasing risk over time
- **Predictive Maintenance:** Predict which services need proactive work

### 18.3 Research Opportunities

- **Reinforcement Learning:** Learn from CAB decisions to improve recommendations
- **Causal Inference:** Identify true causal factors vs correlations
- **Graph Neural Networks:** Better leverage graph structure for predictions
- **Multi-Modal LLMs:** Analyze diagrams, architecture docs, code diffs

---

## 20. Summary

### 19.1 System Capabilities

This LLM-Driven Change Management Optimization System combines:

1. **Structured ML Risk Modeling**
   - XGBoost/Logistic Regression for probability prediction
   - Feature engineering from change metadata
   - Calibrated risk scoring (0-100)

2. **Graph-Based Contextual Intelligence**
   - Neo4j/Neptune for relationship mapping
   - Blast radius calculation via dependency traversal
   - Structural similarity search

3. **RAG-Based Historical Retrieval**
   - Hybrid retrieval (graph + semantic + categorical)
   - Re-ranking for relevance
   - Citation of historical precedents

4. **LLM Explainability Layer**
   - GPT-4/Claude for natural language explanations
   - Actionable recommendations
   - Evidence-backed drivers

5. **Strong Audit and Governance Controls**
   - Full audit trail with replay capability
   - Model versioning and comparison
   - Drift detection

### 19.2 Key Differentiators

- **Enterprise-Safe:** No hallucinated data, full audit trail, RBAC
- **Explainable:** Every prediction backed by evidence and historical citations
- **AWS-Native:** Leverages AWS services for scalability and reliability
- **Scalable:** Designed to handle thousands of evaluations per day
- **Adaptive:** Continuous learning from real outcomes

### 19.3 Expected Business Impact

- **Reduce Incidents:** 30-50% reduction in change-related incidents
- **Accelerate Approvals:** Low-risk changes approved 3x faster
- **Improve Quality:** Actionable recommendations improve change plans
- **Build Knowledge:** Organizational memory of what works and what doesn't
- **Data-Driven Decisions:** CAB decisions backed by evidence, not intuition

---

## 21. Bulk Upload Feature

### 21.1 Overview

Enterprise change management systems often need to process multiple changes simultaneously, especially when importing from external systems like ServiceNow, Jira, or other ITSM platforms. The bulk upload feature allows users to submit 1-1000 changes at once via CSV or Excel files.

### 21.2 Supported File Formats

| Format | Extension | Max Size | Notes |
|--------|-----------|----------|-------|
| CSV | `.csv` | 10 MB | UTF-8 encoding required |
| Excel | `.xlsx`, `.xls` | 10 MB | Modern Excel format preferred |

### 21.3 File Schema

#### Required Columns

| Column Name | Type | Description | Example |
|-------------|------|-------------|---------|
| `short_description` | String | Brief change title (max 200 chars) | "Deploy checkout service v2.1.0" |
| `long_description` | String | Detailed description (max 5000 chars) | "Update checkout microservice with new payment gateway integration..." |
| `change_type` | Enum | Type of change | `standard`, `normal`, `emergency` |
| `change_category` | Enum | Category of change | `deployment`, `database`, `infrastructure`, `configuration` |
| `implementation_steps` | Text | Steps to implement (pipe-separated) | "1. Deploy to staging | 2. Run smoke tests | 3. Deploy to prod" |
| `validation_steps` | Text | Validation steps (pipe-separated) | "Unit tests passed | Integration tests passed" |
| `rollback_plan` | String | Rollback procedure | "Revert to previous Docker image via kubectl rollback" |
| `planned_window` | DateTime | Deployment window | `2024-03-20T14:00:00Z` or `2024-03-20 14:00:00` |
| `impacted_services` | String | Comma-separated service names | "svc-checkout,svc-payment,svc-inventory" |

#### Optional Columns

| Column Name | Type | Description | Default |
|-------------|------|-------------|---------|
| `complexity` | Enum | Change complexity | `medium` (options: `low`, `medium`, `high`) |
| `change_id` | String | External change ID (e.g., ServiceNow CHG number) | Auto-generated |
| `assignee` | String | Assigned engineer | `Unassigned` |
| `priority` | Enum | Change priority | `medium` (options: `low`, `medium`, `high`, `critical`) |

### 21.4 API Endpoint

#### Request

```http
POST /api/v1/evaluate-change/bulk
Content-Type: multipart/form-data

file: <binary-file-data>
```

#### Response

```json
{
  "batch_id": "batch_abc123",
  "uploaded_at": "2024-03-20T10:30:00Z",
  "total_count": 25,
  "processed_count": 25,
  "success_count": 23,
  "error_count": 2,
  "processing_time_ms": 12450,
  "results": [
    {
      "row_number": 1,
      "status": "success",
      "change_id": "CHG001234",
      "short_description": "Deploy checkout service v2.1.0",
      "risk_score": 42.5,
      "risk_band": "Medium",
      "prediction_id": "pred_xyz789"
    },
    {
      "row_number": 2,
      "status": "error",
      "short_description": "Update database schema",
      "error": "Missing required field: rollback_plan",
      "error_code": "VALIDATION_ERROR"
    }
  ],
  "summary": {
    "risk_distribution": {
      "Low": 10,
      "Medium": 8,
      "High": 4,
      "Critical": 1
    },
    "avg_risk_score": 38.7
  }
}
```

### 21.5 Validation Rules

Each row in the uploaded file must pass validation:

1. **Required Field Check**: All required columns must be present and non-empty
2. **Data Type Validation**: Enums must match allowed values
3. **Length Limits**: Fields must not exceed maximum lengths
4. **Date Format**: `planned_window` must be valid ISO 8601 or common datetime format
5. **Service Format**: `impacted_services` must be comma-separated without spaces
6. **Step Format**: Steps can be pipe-separated (`|`) or newline-separated

#### Error Handling

- **Row-Level Errors**: Invalid rows are skipped, but other rows continue processing
- **File-Level Errors**: Malformed files (corrupt, wrong format) reject entire upload
- **Partial Success**: Response includes both successful and failed rows

### 21.6 Processing Logic

```
┌─────────────────┐
│  Upload File    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse & Validate│ ← Check schema, data types
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process Batch  │ ← Evaluate each change
│  (Parallel)     │    Risk scoring
└────────┬────────┘    LLM analysis
         │
         ▼
┌─────────────────┐
│  Store Results  │ ← Save to database
└────────┬────────┘    with batch_id
         │
         ▼
┌─────────────────┐
│  Return Summary │ ← Success/error counts
└─────────────────┘    Risk distribution
```

### 21.7 Performance Considerations

- **Parallel Processing**: Changes processed in parallel (up to 10 concurrent)
- **Rate Limiting**: OpenAI API calls batched to avoid rate limits
- **Timeout**: 5 minutes maximum processing time per batch
- **Chunking**: Large files (>100 rows) processed in chunks of 50

### 21.8 Frontend UI Components

#### Bulk Upload Page Features

1. **File Upload Zone**
   - Drag-and-drop interface
   - File type validation (CSV/Excel only)
   - File size check (max 10 MB)

2. **Progress Indicator**
   - Upload progress bar
   - Processing percentage

3. **Summary Cards (Risk Band Distribution)**
   - **Total Evaluated**: Count of all processed changes
   - **Low Risk**: Count of changes with risk_score 0-30
   - **Medium Risk**: Count of changes with risk_score 31-55
   - **High / Critical Risk**: Combined count of changes with risk_score > 55
   - **Avg Risk Score**: Average risk score with color coding
   - Note: Summary shows risk band distribution, NOT success/failure counts, because these changes have not been implemented yet

4. **Results Table**
   - Columns: Row, Change ID, Description, Risk Score, Risk Band, Actions
   - No "Status" column (success/failure) — changes are pending review, not implemented
   - Color-coded risk band chips
   - Eye icon to view full risk assessment at `/assessment/{change_id}`
   - Parse errors shown inline with error tooltip

5. **Download Options**
   - Export results as CSV
   - Download blank CSV template

### 21.9 Sample CSV Template

```csv
short_description,long_description,change_type,change_category,implementation_steps,validation_steps,rollback_plan,planned_window,impacted_services,complexity
"Deploy checkout service v2.1.0","Update checkout microservice with new payment integration","standard","deployment","1. Deploy to staging | 2. Run smoke tests | 3. Deploy to production","Unit tests passed | Integration tests passed","Revert to previous Docker image via kubectl rollback","2024-03-20T14:00:00Z","svc-checkout,svc-payment","medium"
```

### 21.10 Use Cases

1. **ServiceNow Integration**: Export changes from ServiceNow, upload to get risk scores, import scores back
2. **Weekly Planning**: CAB uploads next week's planned changes for batch evaluation
3. **Historical Analysis**: Upload past 6 months of changes to train the system
4. **Migration**: Import existing change data when onboarding to the system

### 21.11 Security Considerations

- **File Scanning**: Uploaded files scanned for malware
- **Input Sanitization**: All text fields sanitized to prevent injection attacks
- **Access Control**: Bulk upload restricted to authorized users (CAB members, change managers)
- **Audit Trail**: All bulk uploads logged with user, timestamp, and results

### 21.12 Error Codes

| Code | Description | User Action |
|------|-------------|-------------|
| `FILE_TOO_LARGE` | File exceeds 10 MB limit | Split into smaller files |
| `INVALID_FORMAT` | File is not CSV/Excel | Check file extension |
| `MISSING_COLUMNS` | Required columns missing | Add required columns |
| `VALIDATION_ERROR` | Row data invalid | Check error details for specific row |
| `PROCESSING_TIMEOUT` | Batch processing exceeded 5 min | Reduce batch size |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Wait and retry |

---

## 22. Data Lifecycle: Pending to Historical

### 22.1 Overview

Changes follow a lifecycle from submission to historical record:

1. **Submission**: User submits a change via single form (`/`) or bulk upload (`/bulk-upload`). The `submitted_at` timestamp is recorded.
2. **Pending Review**: Change appears on the CAB Dashboard (`/cab`) for risk review. It has `final_outcome = NULL`.
3. **Auto-Transition (24 hours)**: After 24 hours from `submitted_at`, the system automatically sets `final_outcome = 'success'` and the change moves to historical data.
4. **Historical**: Change appears on the History page (`/history`) with full outcome data.

### 22.2 Auto-Transition Logic

The backend runs the following auto-transition on every `/changes/history` API call:

```sql
UPDATE changes
SET final_outcome = 'success', updated_at = CURRENT_TIMESTAMP
WHERE final_outcome IS NULL
  AND submitted_at <= datetime('now', '-1 day')
```

This ensures that pending changes older than 24 hours are automatically promoted to historical records.

### 22.3 API Filter: `status` Parameter

The `/api/v1/changes/history` endpoint accepts a `status` query parameter:

| Value | Behavior |
|-------|----------|
| `pending` | Returns only changes with `final_outcome IS NULL` |
| `historical` | Returns only changes with `final_outcome IS NOT NULL` |
| *(omitted)* | Returns all changes (default) |

### 22.4 Submission Date

All changes record a `submitted_at` timestamp:
- **Single form submission**: Set server-side when `POST /api/v1/evaluate-change` is called
- **Bulk upload**: Set for each row when `POST /api/v1/evaluate-change/bulk` processes the file
- **Displayed**: The submission form shows the current date near the submit button

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **CAB** | Change Advisory Board - group that reviews and approves changes |
| **CI** | Configuration Item - any component that needs to be managed to deliver IT services |
| **CMDB** | Configuration Management Database - repository of CIs and relationships |
| **PIR** | Post-Incident Review - analysis conducted after an incident |
| **RCA** | Root Cause Analysis - process to identify underlying cause of incidents |
| **SEV1/SEV2** | Severity 1 (critical) / Severity 2 (high) incidents |
| **Blast Radius** | Scope of impact if a change fails |
| **Cycle Time** | Time from change request to deployment (see note*) |

*Note: This specification is stored in the Jira Cycle Time Dashboard project folder but describes a separate system for change management risk assessment.

---

## Appendix B: API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/evaluate-change` | POST | Submit change for risk evaluation |
| `/api/v1/evaluate-change/bulk` | POST | Bulk upload changes via CSV/Excel |
| `/api/v1/predictions/{id}` | GET | Retrieve prediction details |
| `/api/v1/predictions` | GET | List predictions (paginated) |
| `/api/v1/similar-changes/{change_id}` | GET | Get similar historical changes |
| `/api/v1/replay/{prediction_id}` | POST | Replay historical evaluation |
| `/api/v1/feedback` | POST | Submit CAB feedback on prediction |
| `/api/v1/metrics` | GET | System health metrics |

---

## Appendix C: Next Steps

If you'd like, I can produce:

1. **Detailed Graph Schema** with sample Cypher queries
2. **API Contract Definitions** (OpenAPI 3.0 specification)
3. **Database DDL** (complete PostgreSQL schema)
4. **LLM Prompt Engineering Specification** (detailed prompt templates)
5. **Deployment Architecture Diagram** (textual representation)
6. **Data Flow Sequence Diagrams** (textual representation)
7. **Developer Task Breakdown** (Jira-ready epics & stories)

---

**Document Control:**
- **Version:** 1.1
- **Last Updated:** 2026-02-16
- **Author:** AI-Assisted Technical Specification
- **Status:** Draft - Updated with data lifecycle, pagination, and CAB dashboard changes
