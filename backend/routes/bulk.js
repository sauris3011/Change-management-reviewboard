/**
 * Bulk Upload Routes
 * Handles CSV/Excel file uploads for batch change evaluation
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bulkUploadService = require('../services/bulkUploadSimple');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bulk-upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow CSV and Excel files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

/**
 * POST /api/v1/evaluate-change/bulk
 * Upload CSV or Excel file for bulk change evaluation
 */
router.post('/bulk', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        error_code: 'MISSING_FILE'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Determine file type
    let fileType;
    if (fileExt === '.csv') {
      fileType = 'csv';
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      fileType = 'excel';
    } else {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'Invalid file format',
        error_code: 'INVALID_FORMAT'
      });
    }

    console.log(`Processing bulk upload: ${req.file.originalname} (${fileType})`);

    // Process the upload
    const result = await bulkUploadService.processBulkUpload(filePath, fileType);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return success response
    res.json(result);

  } catch (error) {
    console.error('Bulk upload error:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Handle specific errors
    if (error.message.includes('File too large')) {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds 10 MB limit',
        error_code: 'FILE_TOO_LARGE'
      });
    }

    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        error_code: 'INVALID_FORMAT'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error during bulk upload',
      error_code: 'PROCESSING_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/evaluate-change/bulk/template
 * Download blank CSV template for bulk upload
 */
router.get('/bulk/template', (req, res) => {
  const csvHeader = [
    'short_description',
    'long_description',
    'change_type',
    'change_category',
    'implementation_steps',
    'validation_steps',
    'rollback_plan',
    'planned_window',
    'impacted_services',
    'complexity'
  ].join(',');

  const csvExample = [
    '"Deploy checkout service v2.1.0"',
    '"Update checkout microservice with new payment gateway integration. This includes API changes and database schema updates."',
    '"standard"',
    '"deployment"',
    '"1. Deploy to staging | 2. Run smoke tests | 3. Deploy to production"',
    '"Unit tests passed | Integration tests passed | Load tests completed"',
    '"Revert to previous Docker image via kubectl rollback. Takes 2 minutes."',
    '"2024-03-20T14:00:00Z"',
    '"svc-checkout,svc-payment,svc-inventory"',
    '"medium"'
  ].join(',');

  const csvContent = `${csvHeader}\n${csvExample}\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=change-upload-template.csv');
  res.send(csvContent);
});

/**
 * GET /api/v1/evaluate-change/bulk/batches
 * List recent bulk upload batches (future enhancement)
 */
router.get('/bulk/batches', async (req, res) => {
  // Placeholder for future enhancement to track batch uploads
  res.json({
    batches: [],
    message: 'Batch history tracking coming soon'
  });
});

module.exports = router;
