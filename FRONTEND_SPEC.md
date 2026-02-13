# Front-End Specification for Change Management System

## Overview

This document details the front-end/UI specifications that were missing from the original technical specification. The front-end provides web-based interfaces for submitting changes, reviewing risk assessments, and CAB (Change Advisory Board) decision-making.

---

## User Roles & Interfaces

### 1. Change Submitters (Developers/Engineers)
**Primary Interface:** Change Submission Form
- Submit new changes for AI risk evaluation
- Upload test evidence and documentation
- View risk assessment results
- Address recommendations and re-submit

### 2. CAB Members (Reviewers/Approvers)
**Primary Interface:** CAB Dashboard
- Review pending changes sorted by risk
- Approve/reject changes
- Bulk operations for low-risk changes
- Add comments and conditions

### 3. Administrators
**Primary Interface:** Admin Panel
- Monitor system health
- Configure risk thresholds
- Manage users and permissions
- View audit logs

### 4. Executives
**Primary Interface:** Analytics Dashboard
- High-level metrics and KPIs
- Trend analysis
- ROI and business impact reports

---

## Technology Stack (Recommended)

| Component | Technology |
|-----------|-----------|
| **Framework** | React 18+ with TypeScript |
| **UI Library** | Material-UI (MUI) or Ant Design |
| **State Management** | Redux Toolkit or Zustand |
| **Charts** | Recharts or D3.js |
| **Forms** | React Hook Form + Zod validation |
| **API Client** | Axios with React Query (caching) |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS or Styled Components |
| **Build Tool** | Vite |

---

## Core Screens/Pages

### 1. Change Submission Page (`/submit-change`)

**Purpose:** Submit a new change request for risk evaluation

**Form Sections:**

#### A. Basic Information
- **Short Description** (text input, max 255 chars, required)
- **Long Description** (rich text editor, required)
- **Change Type** (dropdown: Standard/Normal/Emergency)
- **Change Category** (dropdown: Deployment/Configuration/Infrastructure/Database)

#### B. Impact Assessment
- **Impacted Services** (multi-select autocomplete with search)
  - Example: svc-oms-order-api, svc-payment-processor
- **Impacted CIs** (Configuration Items multi-select)
- **AWS Resources** (tag input with suggestions)
  - Example: ECS services, Lambda functions, RDS instances
- **Planned Implementation Window** (datetime picker)

#### C. Implementation Details
- **Implementation Steps** (ordered list editor)
  - User can add/remove/reorder steps
- **Validation Steps** (checklist builder)
  - Unit tests, integration tests, load tests
- **Rollback Plan** (text area)
  - Real-time quality indicator: Poor/Fair/Good/Excellent
  - Based on: time estimates, steps clarity, success criteria

#### D. Evidence Upload
- **Test Results** (file upload: PDF, Excel, screenshots)
- **Architecture Diagrams** (file upload)
- **Approval Emails** (file upload)
- **Evidence Completeness Meter** (0-100% score shown in real-time)

**Smart Features:**
- ✅ Auto-save draft every 30 seconds (local storage)
- ✅ Entity extraction preview (shows detected services/AWS resources as user types)
- ✅ Rollback plan quality scoring (real-time feedback)
- ✅ Test evidence completeness indicator

**Submission Flow:**
```
Fill Form → Click "Evaluate Risk" →
Loading (15s with progress: "Extracting entities... Querying database... Running ML model...") →
Redirect to Risk Assessment Results page
```

**Wireframe Example:**
```
┌────────────────────────────────────────────────────┐
│ Submit Change for Risk Evaluation                 │
├────────────────────────────────────────────────────┤
│ Basic Information                                  │
│ ┌────────────────────────────────────────────────┐│
│ │ Short Description: *                          ││
│ │ [Deploy OMS Order API v2.3.5...]             ││
│ └────────────────────────────────────────────────┘│
│                                                    │
│ ┌────────────────────────────────────────────────┐│
│ │ Long Description: *                           ││
│ │ [Rich text editor with formatting toolbar]   ││
│ │                                               ││
│ └────────────────────────────────────────────────┘│
│                                                    │
│ [Change Type: ▼ Normal] [Category: ▼ Deployment]  │
│                                                    │
│ Impact Assessment                                  │
│ Impacted Services: *                              │
│ [🔍 Search...] ✓ svc-oms-order-api               │
│                                                    │
│ Implementation Steps: [+ Add Step]                │
│ 1. Deploy new ECS task definition                 │
│ 2. Update API Gateway routing                     │
│                                                    │
│ Rollback Plan:                                    │
│ ┌────────────────────────────────────────────────┐│
│ │ Revert ECS task to v2.3.4, takes ~5 min...   ││
│ └────────────────────────────────────────────────┘│
│ Quality: ⚠️ Fair (Add success criteria)           │
│                                                    │
│ [ Cancel ] [ Save Draft ] [ Evaluate Risk ]       │
└────────────────────────────────────────────────────┘
```

---

### 2. Risk Assessment Results Page (`/assessment/:evaluation_id`)

**Purpose:** Display AI-generated risk evaluation with explanations

**Layout:**

#### Header Section
- Change ID badge (e.g., "CHG0012345")
- Risk Score: Large number (0-100) color-coded
  - 0-30: Green (Low)
  - 31-55: Yellow (Medium)
  - 56-75: Orange (High)
  - 76-100: Red (Critical)
- Risk Band label
- Timestamp and model version

#### Risk Score Card (Hero)
```
┌─────────────────────────────────────────────┐
│     RISK SCORE: 67.5 / 100                 │
│     Risk Band: HIGH 🔴                      │
│                                             │
│ Outcome Probabilities:                      │
│ ████████░░ 32%  Success                     │
│ ███░░░░░░░ 15%  Deploy Failure              │
│ █████░░░░░ 28%  Rollback Required           │
│ ███░░░░░░░ 18%  Post-Deploy Incident        │
│ █░░░░░░░░░  7%  Performance Degradation     │
└─────────────────────────────────────────────┘
```

#### Tabs Interface

**Tab 1: Overview**
- Donut chart showing probability distribution
- Key metrics cards:
  - Blast Radius Score: 72/100
  - Test Evidence Score: 40/100 (⚠️ Low)
  - Rollback Feasibility: 30/100 (⚠️ Low)
- Change details (read-only)

**Tab 2: Risk Drivers** ⚠️ **Most Important Tab**

Shows **why** the change is risky with evidence and historical examples:

```
┌──────────────────────────────────────────────────┐
│ ⚠️ DB migration without adequate rollback plan  │
│                                                  │
│ Evidence:                                        │
│ • rollback_quality_score: 0.3 (Poor)            │
│ • db_migration_flag: true                       │
│ • Missing: time estimates, data backup plan     │
│                                                  │
│ Historical Reference:                            │
│ → CHG0045231: Similar OMS DB migration          │
│   required emergency rollback after 2 hours     │
│   due to data inconsistency                     │
│   [View Full Change →]                          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⚠️ High-criticality service during peak hours   │
│                                                  │
│ Evidence:                                        │
│ • Service criticality: 0.95 (Critical)          │
│ • Scheduled: 2024-03-15 14:00 UTC (peak hours)  │
│ • Blast radius: 72 (High - 5 dependent services)│
│                                                  │
│ Historical Reference:                            │
│ → CHG0038172: Peak hour deployment caused       │
│   SEV2 incident, 45min downtime, revenue impact │
│   [View Full Change →]                          │
└──────────────────────────────────────────────────┘
```

**Tab 3: Recommendations** 🎯 **Actionable Items**

Categorized action items to reduce risk:

```
┌──────────────────────────────────────────────────┐
│ 🔬 TESTING                       Priority: HIGH  │
│                                                  │
│ Conduct load testing with 150% of peak traffic  │
│ before deployment                                │
│                                                  │
│ Rationale: Service handles payment processing;  │
│ performance degradation unacceptable             │
│                                                  │
│ Based on: CHG0042018 (performance issues after  │
│ deploying without load tests)                    │
│                                                  │
│ [ ] Mark as Complete  [Upload Evidence]         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⏰ SCHEDULING                   Priority: HIGH  │
│                                                  │
│ Reschedule to low-traffic window (02:00-04:00   │
│ UTC) to minimize blast radius                    │
│                                                  │
│ Rationale: More time to detect and recover from  │
│ issues if they occur                             │
│                                                  │
│ [ ] Mark as Complete                             │
└──────────────────────────────────────────────────┘
```

Categories: 🔬 Testing | 📋 Planning | ⏰ Scheduling | ↩️ Rollback | 📊 Monitoring

**Tab 4: Similar Changes** 📚

Table of 5-15 historical changes with similar characteristics:

| Change ID | Description | Outcome | Similarity | Date |
|-----------|-------------|---------|------------|------|
| CHG0045231 | OMS DB schema migration | 🔴 Rollback | 87% | 45 days ago |
| CHG0038172 | Order API peak deploy | 🟠 Incident (SEV2) | 76% | 120 days ago |
| CHG0042018 | Payment service update | 🟡 Degraded | 71% | 89 days ago |

Click any row → Opens modal with full details

**Tab 5: Audit Trail** 🔍

For compliance and reproducibility:
- Model version used: v1.2.3
- LLM model: gpt-4-turbo-2024-03-01
- Retrieved change IDs (used for similarity)
- Feature vector snapshot (collapsible JSON)
- Performance metrics:
  - Graph query: 145ms
  - Vector search: 89ms
  - ML inference: 23ms
  - LLM inference: 3,421ms
  - **Total: 4.8 seconds**
- Trace ID for debugging

#### Action Buttons
- **📄 Export PDF** (generate report for CAB meeting)
- **🔗 Share Link** (copy URL)
- **✅ Submit to CAB** (move to CAB review queue)
- **🔄 Re-evaluate** (after addressing recommendations)

---

### 3. CAB Dashboard (`/cab/dashboard`)

**Purpose:** Central interface for CAB members to review and approve/reject changes

**Layout:**

#### Top: Filter Bar
```
[Risk: ▼ All] [Domain: ▼ All] [Date: Last 30 days ▼]
[Search: 🔍 Change ID or description...]
```

#### Statistics Cards
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Pending     │ High Risk   │ Avg Review  │ Approval    │
│ Review: 12  │ Changes: 3  │ Time: 4.2h  │ Rate: 87%   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### Changes Table

| Select | Change ID | Description | Risk | Risk Band | Submitter | Submitted | Status | Actions |
|--------|-----------|-------------|------|-----------|-----------|-----------|--------|---------|
| ☑ | CHG0012345 | Deploy OMS Order API v2.3.5 | 67.5 | 🔴 High | John Doe | 2h ago | Pending | [Review] [Approve] [Reject] |
| ☐ | CHG0012344 | Update Kafka retention | 28.3 | 🟢 Low | Jane Smith | 5h ago | Pending | [Review] [Approve] [Reject] |
| ☐ | CHG0012343 | DB schema migration | 82.1 | 🔴 Critical | Bob Wilson | 1d ago | Pending | [Review] [Approve] [Reject] |

**Bulk Actions:**
- Select 5 low-risk changes → [Bulk Approve]
- Select changes → [Export to Excel]

**Click "Review" → Side Panel Opens:**

```
┌─────────────────────────────────────────────┐
│ CHG0012345                    Risk: 67.5 🔴│
│ Deploy OMS Order API v2.3.5                │
├─────────────────────────────────────────────┤
│                                             │
│ Top Risk Drivers:                           │
│ • DB migration without rollback plan        │
│ • Deployment during peak hours              │
│ • Insufficient load testing                 │
│                                             │
│ Top Recommendations:                        │
│ • Conduct load testing                      │
│ • Reschedule to off-peak                    │
│ • Document DB rollback procedure            │
│                                             │
│ [View Full Assessment →]                    │
│                                             │
│ CAB Decision:                               │
│ ┌─────────────────────────────────────────┐│
│ │ Add comment...                          ││
│ │                                         ││
│ └─────────────────────────────────────────┘│
│                                             │
│ [ Approve ] [ Conditionally Approve ]       │
│ [ Reject  ] [ Request More Info      ]      │
└─────────────────────────────────────────────┘
```

---

### 4. Historical Changes Browser (`/changes/history`)

**Purpose:** Search and analyze past changes

**Features:**
- Advanced filters (outcome, service, date range, risk score)
- Results table with sorting
- Export to CSV
- Click to view full risk assessment

---

### 5. Analytics Dashboard (`/analytics`)

**Purpose:** Executive-level metrics and trends

**Charts/Widgets:**

1. **Risk Score Distribution** (Bar chart)
   - Shows how many changes fall into Low/Medium/High/Critical

2. **Incident Reduction Trend** (Line chart)
   - Before/after system implementation
   - Shows decline in change-related incidents

3. **Approval Cycle Time** (Line chart)
   - Tracks time from submission to approval
   - Goal: reduce from ~24h to ~4h for low-risk changes

4. **CAB Performance Scorecard**
   - Approval rate: 87%
   - Avg review time: 4.2 hours
   - Override rate: 15% (CAB disagrees with system)

5. **Domain Risk Heatmap**
   - Color-coded grid showing risk by domain/month

6. **Model Performance**
   - Prediction accuracy: 82%
   - False positive rate: 12%
   - False negative rate: 8%
   - Calibration chart

---

## Key User Workflows

### Workflow 1: Developer Submits Change

```
1. Developer navigates to /submit-change
2. Fills form (auto-saves every 30s)
3. System shows real-time feedback:
   - Rollback plan quality: Fair → Good (as they improve it)
   - Evidence completeness: 45% → 78% (as they upload files)
4. Clicks "Evaluate Risk"
5. Loading screen: 15 seconds
   - "Extracting entities..."
   - "Querying similar changes..."
   - "Running ML model..."
   - "Generating AI explanation..."
6. Redirected to /assessment/:id
7. Sees Risk Score: 67.5 (High)
8. Reviews risk drivers and recommendations
9. Decides to address recommendations first
10. Completes load testing (external process)
11. Returns to UI, uploads test results
12. Clicks "Re-evaluate"
13. New risk score: 42.5 (Medium) ✅
14. Clicks "Submit to CAB"
15. Receives notification: "Submitted for CAB review"
```

### Workflow 2: CAB Member Reviews Change

```
1. CAB member logs in → Lands on /cab/dashboard
2. Sees 12 pending changes
3. Filters: Risk > 55 (High and Critical only)
4. 3 high-risk changes remain
5. Clicks "Review" on CHG0012345
6. Side panel shows summary
7. Clicks "View Full Assessment" → Opens in new tab
8. Spends 5 minutes reviewing:
   - Risk drivers (understands why it's risky)
   - Historical similar changes (sees precedent)
   - Recommendations (sees what's missing)
9. Returns to dashboard
10. Adds comment: "Approved pending load test completion"
11. Clicks "Conditionally Approve"
12. Status changes to "Conditionally Approved"
13. Notification sent to developer
```

### Workflow 3: Developer Addresses Feedback

```
1. Receives email: "CHG0012345 conditionally approved"
2. Navigates to /assessment/CHG0012345
3. Sees CAB comment: "Approved pending load test"
4. Clicks "Recommendations" tab
5. Finds "Conduct load testing" recommendation
6. Completes load test
7. Uploads test results PDF
8. Checks "Mark as Complete"
9. Clicks "Re-evaluate"
10. Risk score drops to 38.5 (Medium)
11. Clicks "Re-submit to CAB" with note: "Load tests completed"
12. CAB auto-approves (conditional requirement met)
```

---

## Design Guidelines

### Color Coding (Risk Bands)

| Risk Band | Score | Color | Hex |
|-----------|-------|-------|-----|
| Low | 0-30 | Green | #10B981 |
| Medium | 31-55 | Yellow | #F59E0B |
| High | 56-75 | Orange | #F97316 |
| Critical | 76-100 | Red | #EF4444 |

### Typography
- **Headings:** Inter/Roboto Bold
- **Body:** Inter/Roboto Regular
- **Code/Data:** Fira Mono

### Accessibility (WCAG 2.1 AA)
- ✅ Color contrast ≥ 4.5:1
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Screen reader compatible
- ✅ Focus indicators

### Responsive Design

**Breakpoints:**
- Mobile: 320-767px (single column, simplified)
- Tablet: 768-1023px (2 columns)
- Desktop: 1024px+ (full layout)

**Mobile Adaptations:**
- CAB Dashboard → Card view (not table)
- Risk Assessment → Vertical stack
- Change Submission → Multi-step wizard

---

## Real-Time Features

### WebSocket Updates
- CAB dashboard updates when new changes submitted
- Change status updates without refresh

### Optimistic UI
- Form auto-save shows "Saved ✓" immediately
- Mark recommendation complete → instant UI update

---

## Error Handling

| Error | User Experience |
|-------|----------------|
| **Evaluation timeout (>30s)** | "Taking longer than expected. You'll receive email when complete." Allow user to continue. |
| **LLM failure** | Show risk score only. "AI explanation unavailable." Provide retry button. |
| **No similar changes** | Show warning: "No historical data. Risk based on features only." |
| **Network error** | Toast: "Connection lost. Retrying..." Auto-retry with backoff. |

---

## Performance Targets

- Initial page load: < 2 seconds
- Risk evaluation: < 15 seconds
- CAB dashboard load: < 1 second
- Chart rendering: < 500ms

---

## Development Phases

**Phase 1 (MVP - 8 weeks):**
- ✅ Change Submission Page
- ✅ Risk Assessment Results (Overview + Drivers tabs)
- ✅ Basic CAB Dashboard
- ✅ Authentication

**Phase 2 (Enhanced - 6 weeks):**
- ✅ All assessment tabs
- ✅ Advanced CAB Dashboard (filters, bulk actions)
- ✅ Historical browser
- ✅ Real-time notifications

**Phase 3 (Enterprise - 12 weeks):**
- ✅ Analytics Dashboard
- ✅ Admin panel
- ✅ Audit log viewer
- ✅ Multi-tenant support

---

## Summary

The front-end is the **primary interface** for the LLM-driven change management system. It transforms complex AI predictions into **actionable insights** for:

1. **Developers:** Know risks before submitting, get concrete recommendations
2. **CAB Members:** Make data-driven decisions with evidence and historical context
3. **Executives:** Track system ROI and improvement trends

**Key Principle:** Every risk score must be **explainable** and **actionable** - users should always understand WHY something is risky and WHAT to do about it.
