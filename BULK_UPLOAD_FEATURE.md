# Bulk Upload Feature Documentation

## Overview

The bulk upload feature allows you to submit multiple changes simultaneously via CSV or Excel files. This is particularly useful for:
- Importing changes from ServiceNow or other ITSM systems
- Weekly planning sessions where CAB needs to evaluate 20-50 changes
- Historical data migration when onboarding to the system
- Batch risk assessment for compliance reporting

## How to Use

### 1. Access the Bulk Upload Page

Navigate to **Bulk Upload** in the top navigation bar, or visit: `http://localhost:3000/bulk-upload`

### 2. Prepare Your File

You can use the provided sample file or create your own:

**Sample File Location:**
```
/mnt/c/Users/Sauris/Projects/change-management-reviewboard/Sample_Changes_Import.xlsx
```

This file contains **25 realistic changes** across different risk levels:
- 8 Low-risk changes (configuration updates, feature flags)
- 8 Medium-risk changes (service deployments, database indexes)
- 6 High-risk changes (major migrations, infrastructure changes)
- 3 Critical-risk changes (emergency patches, database failovers)

### 3. Download Template (Optional)

Click **"Download Template"** in the UI to get a blank CSV template with proper column headers and one example row.

### 4. Upload Your File

Either:
- **Drag and drop** the file into the upload zone
- **Click the upload zone** to browse and select the file

Supported formats: `.csv`, `.xlsx`, `.xls`
Maximum file size: 10 MB
Maximum rows: 1,000 changes per upload

### 5. Review Results

After processing, you'll see:
- **Summary cards**: Total changes, successful, errors, average risk score
- **Risk distribution**: Breakdown by Low/Medium/High/Critical bands
- **Detailed table**: Status, change ID, description, risk score for each row
- **Actions**:
  - View full assessment for successful changes
  - See error details for failed validations
  - Export results to CSV

## File Format

### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `short_description` | String (max 200 chars) | Brief change title | "Deploy checkout service v2.1.0" |
| `long_description` | String (max 5000 chars) | Detailed description | "Update checkout microservice with new payment integration..." |
| `change_type` | Enum | Type of change | `standard`, `normal`, `emergency` |
| `change_category` | Enum | Category of change | `deployment`, `database`, `infrastructure`, `configuration` |
| `implementation_steps` | Text | Implementation steps (pipe-separated) | "1. Deploy to staging \| 2. Run smoke tests \| 3. Deploy to prod" |
| `validation_steps` | Text | Validation steps (pipe-separated) | "Unit tests passed \| Integration tests passed" |
| `rollback_plan` | String | Rollback procedure | "Revert to previous Docker image via kubectl rollback" |
| `planned_window` | DateTime | Deployment window | `2024-03-20T14:00:00Z` or `2024-03-20 14:00:00` |
| `impacted_services` | String | Comma-separated service names | "svc-checkout,svc-payment,svc-inventory" |

### Optional Columns

| Column | Type | Default | Options |
|--------|------|---------|---------|
| `complexity` | Enum | `medium` | `low`, `medium`, `high` |
| `change_id` | String | Auto-generated | Any unique identifier |
| `assignee` | String | `Unassigned` | Engineer name |
| `priority` | Enum | `medium` | `low`, `medium`, `high`, `critical` |

### Example CSV Row

```csv
short_description,long_description,change_type,change_category,implementation_steps,validation_steps,rollback_plan,planned_window,impacted_services,complexity
"Deploy checkout service v2.1.0","Update checkout microservice with new payment gateway integration","standard","deployment","1. Deploy to staging | 2. Run smoke tests | 3. Deploy to production","Unit tests passed | Integration tests passed","Revert to previous Docker image via kubectl rollback","2024-03-20T14:00:00Z","svc-checkout,svc-payment","medium"
```

## API Endpoint

### Upload Changes

**Endpoint:** `POST /api/v1/evaluate-change/bulk`
**Content-Type:** `multipart/form-data`
**Body:** Form data with `file` field containing CSV/Excel file

**Example using curl:**
```bash
curl -X POST http://localhost:3001/api/v1/evaluate-change/bulk \
  -F "file=@Sample_Changes_Import.xlsx"
```

### Download Template

**Endpoint:** `GET /api/v1/evaluate-change/bulk/template`
**Response:** CSV file download

**Example:**
```bash
curl -O http://localhost:3001/api/v1/evaluate-change/bulk/template
```

## Response Format

```json
{
  "success": true,
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

## Common Error Codes

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `MISSING_FILE` | No file uploaded | Select a file before clicking upload |
| `INVALID_FORMAT` | File is not CSV/Excel | Check file extension (.csv, .xlsx, .xls) |
| `FILE_TOO_LARGE` | File exceeds 10 MB | Split into smaller batches |
| `VALIDATION_ERROR` | Row data invalid | Check error message for specific field |
| `PROCESSING_ERROR` | Internal processing failure | Check server logs, retry upload |

## Validation Rules

Each row is validated before processing:

1. **Required Fields**: All required columns must be present and non-empty
2. **Enums**: `change_type`, `change_category`, `complexity` must match allowed values
3. **Date Format**: `planned_window` must be valid ISO 8601 or common datetime format
4. **Length Limits**: `short_description` ≤ 200 chars, `long_description` ≤ 5000 chars
5. **Service Format**: `impacted_services` must be comma-separated without spaces

## Processing Details

- **Parallel Processing**: Changes are processed in batches of 10 concurrently
- **Rate Limiting**: OpenAI API calls are batched to avoid rate limits
- **Mock Mode**: Uses intelligent mock responses when OpenAI API key not configured
- **Timeout**: Maximum 5 minutes processing time per batch
- **Partial Success**: Individual row failures don't stop processing of other rows

## Use Cases

### 1. ServiceNow Integration

Export changes from ServiceNow to CSV, upload to get risk scores, then import scores back to ServiceNow.

### 2. Weekly CAB Planning

Upload next week's planned changes on Friday, review risk assessments over the weekend, approve/reject on Monday.

### 3. Historical Analysis

Upload past 6 months of changes with outcomes to improve the AI's pattern recognition and recommendations.

### 4. Compliance Reporting

Generate monthly reports showing risk distribution and approval rates by uploading completed changes.

## Tips for Best Results

1. **Detailed Descriptions**: More detailed change descriptions lead to better risk assessments
2. **Complete Rollback Plans**: Specify exact steps and estimated time for rollbacks
3. **List All Services**: Include all downstream services that might be affected
4. **Validation Evidence**: List all testing performed (unit, integration, load, security)
5. **Avoid Peak Hours**: System flags changes scheduled during business hours as higher risk

## Performance

- **Small files** (1-10 changes): ~2-5 seconds
- **Medium files** (11-50 changes): ~10-30 seconds
- **Large files** (51-100 changes): ~30-60 seconds
- **Maximum batch** (1000 changes): ~5 minutes

Processing time depends on:
- File size and format (Excel slower than CSV)
- Number of rows
- Complexity of changes (more impacted services = more analysis time)
- OpenAI API response time (if using real LLM)

## Troubleshooting

### File Upload Fails

- Check file format (.csv, .xlsx, .xls only)
- Verify file size < 10 MB
- Ensure columns match required schema
- Check for special characters in CSV (use UTF-8 encoding)

### Some Rows Have Errors

- Review error message in results table
- Check column values against validation rules
- Verify date format is ISO 8601 or `YYYY-MM-DD HH:mm:ss`
- Ensure no extra spaces in enum values

### Processing Takes Too Long

- Split large files into smaller batches (50-100 rows recommended)
- Check server logs for API rate limiting
- Verify backend server has sufficient resources

## Next Steps

After bulk upload:

1. **Review Results**: Check summary statistics and risk distribution
2. **Investigate Errors**: Fix validation errors in source file and re-upload
3. **View Details**: Click on successful changes to see full risk assessment
4. **Export Results**: Download results CSV for sharing with stakeholders
5. **CAB Review**: Navigate to CAB Dashboard to approve/reject high-risk changes

## Technical Implementation

- **Backend**: Node.js service with `multer` (file upload), `xlsx` (Excel parsing), `csv-parser` (CSV parsing)
- **Frontend**: React component with drag-and-drop using Material-UI
- **Storage**: Files temporarily stored in `backend/uploads/` then deleted after processing
- **Database**: All changes and predictions stored in SQLite for history tracking

## Security

- **File Scanning**: Uploaded files validated for type and size
- **Input Sanitization**: All text fields sanitized to prevent injection attacks
- **Access Control**: Bulk upload restricted to authorized users (future enhancement)
- **Audit Trail**: All uploads logged with user, timestamp, and results
