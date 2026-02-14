import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  GetApp as TemplateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getRiskColor } from '../utils/riskColors';

export default function BulkUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      const isValid = validTypes.includes(selectedFile.type) ||
                     selectedFile.name.endsWith('.csv') ||
                     selectedFile.name.endsWith('.xlsx') ||
                     selectedFile.name.endsWith('.xls');

      if (!isValid) {
        setError('Invalid file type. Please upload CSV or Excel (.xlsx, .xls) files only.');
        return;
      }

      // Validate file size (10 MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10 MB limit. Please upload a smaller file.');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResults(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      // Create a synthetic event to reuse validation logic
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('http://localhost:3001/api/v1/evaluate-change/bulk', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setResults(data);
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('http://localhost:3001/api/v1/evaluate-change/bulk/template', '_blank');
  };

  const handleDownloadResults = () => {
    if (!results) return;

    // Convert results to CSV
    const headers = ['Row', 'Status', 'Change ID', 'Description', 'Risk Score', 'Risk Band', 'Error'];
    const rows = results.results.map(r => [
      r.row_number,
      r.status,
      r.change_id || 'N/A',
      r.short_description,
      r.risk_score || 'N/A',
      r.risk_band || 'N/A',
      r.error || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_upload_results_${results.batch_id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewChange = (predictionId) => {
    navigate(`/assessment/${predictionId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bulk Change Upload
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload a CSV or Excel file with multiple changes for batch risk assessment
      </Typography>

      {/* Summary Cards */}
      {results && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Changes
                </Typography>
                <Typography variant="h4">
                  {results.total_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#d1fae5' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Successful
                </Typography>
                <Typography variant="h4" color="#059669">
                  {results.success_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fee2e2' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Errors
                </Typography>
                <Typography variant="h4" color="#dc2626">
                  {results.error_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Risk Score
                </Typography>
                <Typography variant="h4" sx={{ color: getRiskColor(results.summary.avg_risk_score) }}>
                  {results.summary.avg_risk_score}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Upload Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Stack spacing={3}>
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed #cbd5e1',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              bgcolor: file ? '#f0f9ff' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#f0f9ff',
                borderColor: '#3b82f6'
              }
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <UploadIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />

            {file ? (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Drag and drop your file here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Supports CSV and Excel files (.csv, .xlsx, .xls) up to 10 MB
                </Typography>
              </>
            )}
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {uploading && (
            <Box>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Processing... {uploadProgress}%
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<UploadIcon />}
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              Upload and Evaluate
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<TemplateIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>

            {results && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadResults}
              >
                Export Results
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Results Table */}
      {results && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Results
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Batch ID: {results.batch_id} | Processing Time: {(results.processing_time_ms / 1000).toFixed(2)}s
          </Typography>

          {/* Risk Distribution */}
          {results.summary && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Risk Distribution
              </Typography>
              <Stack direction="row" spacing={2}>
                {Object.entries(results.summary.risk_distribution).map(([band, count]) => (
                  <Chip
                    key={band}
                    label={`${band}: ${count}`}
                    sx={{
                      bgcolor: getRiskColor(band === 'Low' ? 15 : band === 'Medium' ? 45 : band === 'High' ? 65 : 85),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Change ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Risk Band</TableCell>
                  <TableCell>Error/Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.results.map((result) => (
                  <TableRow key={result.row_number} hover>
                    <TableCell>{result.row_number}</TableCell>
                    <TableCell>
                      {result.status === 'success' ? (
                        <Chip
                          icon={<SuccessIcon />}
                          label="Success"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<ErrorIcon />}
                          label="Error"
                          color="error"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>{result.change_id || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {result.short_description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {result.risk_score !== undefined ? (
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ color: getRiskColor(result.risk_score) }}
                        >
                          {result.risk_score}
                        </Typography>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {result.risk_band ? (
                        <Chip
                          label={result.risk_band}
                          size="small"
                          sx={{
                            bgcolor: getRiskColor(result.risk_score),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {result.status === 'success' ? (
                        <Tooltip title="View full assessment">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewChange(result.prediction_id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={result.error}>
                          <Typography variant="caption" color="error" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {result.error}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
