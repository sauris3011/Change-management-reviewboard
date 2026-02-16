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
  Visibility as ViewIcon,
  GetApp as TemplateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getRiskColor, getRiskSurfaceColor } from '../utils/riskColors';
import { md3 } from '../theme';

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

    const headers = ['Row', 'Status', 'Change ID', 'Description', 'Risk Score', 'Risk Band', 'Error'];
    const rows = results.results.map(r => [
      r.row_number, r.status, r.change_id || 'N/A', r.short_description,
      r.risk_score || 'N/A', r.risk_band || 'N/A', r.error || ''
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
    <Box className="md3-page">
      <Box
        className="md3-blur-shape md3-blur-tertiary md3-float"
        sx={{ width: 300, height: 300, top: -60, left: -80 }}
      />
      <Box
        className="md3-blur-shape md3-blur-primary md3-float-delayed"
        sx={{ width: 250, height: 250, bottom: -40, right: -60 }}
      />

      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
          Bulk Change Upload
        </Typography>
        <Typography variant="body1" sx={{ color: md3.onSurfaceVariant, mb: 4 }}>
          Upload a CSV or Excel file with multiple changes for batch risk assessment
        </Typography>

        {/* Summary Cards - Risk Band Distribution */}
        {results && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: '24px' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 1 }}>Total Evaluated</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: md3.onSurface }}>{results.total_count}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: '24px', backgroundColor: getRiskSurfaceColor(15) }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ color: getRiskColor(15), mb: 1 }}>Low Risk</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: getRiskColor(15) }}>
                    {results.summary?.risk_distribution?.Low || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: '24px', backgroundColor: getRiskSurfaceColor(45) }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ color: getRiskColor(45), mb: 1 }}>Medium Risk</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: getRiskColor(45) }}>
                    {results.summary?.risk_distribution?.Medium || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: '24px', backgroundColor: getRiskSurfaceColor(70) }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ color: getRiskColor(70), mb: 1 }}>High / Critical</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: getRiskColor(70) }}>
                    {(results.summary?.risk_distribution?.High || 0) + (results.summary?.risk_distribution?.Critical || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: '24px' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 1 }}>Avg Risk Score</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: getRiskColor(results.summary.avg_risk_score) }}>
                    {results.summary.avg_risk_score}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Upload Section */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: '32px' }}>
          <Stack spacing={3}>
            <Box
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${file ? md3.primary : md3.outlineVariant}`,
                borderRadius: '24px',
                p: 6,
                textAlign: 'center',
                bgcolor: file ? `${md3.primaryContainer}40` : md3.surface,
                cursor: 'pointer',
                transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
                '&:hover': {
                  bgcolor: `${md3.primaryContainer}30`,
                  borderColor: md3.primary,
                },
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

              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '20px',
                  backgroundColor: md3.secondaryContainer,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <UploadIcon sx={{ fontSize: 36, color: md3.primary }} />
              </Box>

              {file ? (
                <>
                  <Typography variant="h6" sx={{ color: md3.primary, fontWeight: 500 }} gutterBottom>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ color: md3.onSurface, fontWeight: 500 }} gutterBottom>
                    Drag and drop your file here
                  </Typography>
                  <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
                    or click to browse
                  </Typography>
                  <Typography variant="caption" sx={{ color: md3.outline, mt: 2, display: 'block' }}>
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
                <Typography variant="body2" align="center" sx={{ color: md3.onSurfaceVariant, mt: 1.5 }}>
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
          <Paper sx={{ p: 4, borderRadius: '24px' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
              Upload Results
            </Typography>
            <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 3 }}>
              Batch ID: {results.batch_id} | Processing Time: {(results.processing_time_ms / 1000).toFixed(2)}s
            </Typography>

            {results.summary && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurfaceVariant, mb: 1.5 }}>
                  Risk Distribution
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  {Object.entries(results.summary.risk_distribution).map(([band, count]) => {
                    const score = band === 'Low' ? 15 : band === 'Medium' ? 45 : band === 'High' ? 65 : 85;
                    return (
                      <Chip
                        key={band}
                        label={`${band}: ${count}`}
                        sx={{
                          bgcolor: getRiskSurfaceColor(score),
                          color: getRiskColor(score),
                          fontWeight: 500,
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}

            <TableContainer sx={{ borderRadius: '16px', border: `1px solid ${md3.outlineVariant}` }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Change ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Risk Band</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.results.map((result) => (
                    <TableRow key={result.row_number} hover>
                      <TableCell>{result.row_number}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: md3.primary }}>
                          {result.change_id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {result.short_description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {result.risk_score !== undefined ? (
                          <Typography variant="body2" sx={{ fontWeight: 500, color: getRiskColor(result.risk_score) }}>
                            {result.risk_score}
                          </Typography>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {result.risk_band ? (
                          <Chip
                            label={result.risk_band}
                            size="small"
                            sx={{
                              bgcolor: getRiskSurfaceColor(result.risk_score),
                              color: getRiskColor(result.risk_score),
                              fontWeight: 500,
                            }}
                          />
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {result.status === 'success' ? (
                          <Tooltip title="View risk assessment details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewChange(result.change_id)}
                              sx={{ color: md3.primary }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={result.error}>
                            <Typography variant="caption" noWrap sx={{ color: md3.error, maxWidth: 200, display: 'block' }}>
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
    </Box>
  );
}
