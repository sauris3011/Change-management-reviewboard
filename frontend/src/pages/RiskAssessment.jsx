import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getPrediction } from '../api/client';
import RiskScoreCard from '../components/RiskScoreCard';
import RiskDriverCard from '../components/RiskDriverCard';
import RecommendationCard from '../components/RecommendationCard';
import { formatRiskScore, getRiskColor, getRiskBand } from '../utils/riskColors';

const RiskAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    fetchPrediction();
  }, [id]);

  const fetchPrediction = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPrediction(id);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load risk assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-assessment-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Risk Assessment...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Submission
        </Button>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  const riskScore = data.risk_score || 0;
  const probabilities = data.probabilities || [];
  const riskDrivers = data.risk_drivers || [];
  const recommendations = data.recommendations || [];
  const similarChanges = data.similar_changes || [];
  const auditTrail = data.audit_trail || {};
  const changeDetails = data.change_details || {};

  // Prepare chart data
  const pieData = probabilities.map(prob => ({
    name: prob.outcome,
    value: prob.probability * 100,
  }));

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#F97316', '#6B7280'];

  // Mock similar changes if empty
  const mockSimilarChanges = similarChanges.length > 0 ? similarChanges : [
    { change_id: 'CHG0045231', description: 'OMS DB schema migration', outcome: 'Rollback', similarity: 87, date: '45 days ago' },
    { change_id: 'CHG0038172', description: 'Order API peak deploy', outcome: 'Incident (SEV2)', similarity: 76, date: '120 days ago' },
    { change_id: 'CHG0042018', description: 'Payment service update', outcome: 'Degraded', similarity: 71, date: '89 days ago' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Risk Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Change ID: {data.change_id || id} | {new Date(data.timestamp || Date.now()).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ShareIcon />} variant="outlined" onClick={handleShare}>
            Share
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportPDF}>
            Export
          </Button>
          <Button startIcon={<CheckCircleIcon />} variant="contained" color="success">
            Submit to CAB
          </Button>
        </Box>
      </Box>

      {/* Risk Score Card */}
      <RiskScoreCard riskScore={riskScore} probabilities={probabilities} />

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable">
          <Tab label="Overview" />
          <Tab label="Risk Drivers" />
          <Tab label="Recommendations" />
          <Tab label="Similar Changes" />
          <Tab label="Audit Trail" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Overview */}
          {currentTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Probability Distribution
                  </Typography>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography>No probability data available</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Key Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Blast Radius Score
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {data.blast_radius_score || 72} / 100
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Test Evidence Score
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {data.test_evidence_score || 40} / 100
                          </Typography>
                          <Chip label="Low" color="warning" size="small" sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Rollback Feasibility
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {data.rollback_feasibility || 30} / 100
                          </Typography>
                          <Chip label="Low" color="warning" size="small" sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Change Details
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Short Description
                      </Typography>
                      <Typography variant="body1">{changeDetails.short_description || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Change Type
                      </Typography>
                      <Typography variant="body1">{changeDetails.change_type || 'Normal'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1">{changeDetails.change_category || 'Deployment'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Impacted Services
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {(changeDetails.impacted_services || []).map((service, idx) => (
                          <Chip key={idx} label={service} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Tab 1: Risk Drivers */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Risk Drivers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                These factors contribute to the overall risk score. Review each driver and consider the historical evidence.
              </Typography>
              {riskDrivers.length > 0 ? (
                riskDrivers.map((driver, index) => (
                  <RiskDriverCard key={index} driver={driver} />
                ))
              ) : (
                <Alert severity="info">No specific risk drivers identified</Alert>
              )}
            </Box>
          )}

          {/* Tab 2: Recommendations */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Action items to reduce risk before deployment. Complete these recommendations and re-evaluate.
              </Typography>
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))
              ) : (
                <Alert severity="success">No specific recommendations. Change appears well-planned!</Alert>
              )}
            </Box>
          )}

          {/* Tab 3: Similar Changes */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Similar Historical Changes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Past changes with similar characteristics. Learn from historical outcomes.
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Change ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Outcome</TableCell>
                      <TableCell>Similarity</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockSimilarChanges.map((change, index) => (
                      <TableRow key={index} hover sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {change.change_id}
                          </Typography>
                        </TableCell>
                        <TableCell>{change.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={change.outcome}
                            size="small"
                            color={
                              change.outcome.includes('Rollback') || change.outcome.includes('Incident')
                                ? 'error'
                                : change.outcome.includes('Degraded')
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </TableCell>
                        <TableCell>{change.similarity}%</TableCell>
                        <TableCell>{change.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Tab 4: Audit Trail */}
          {currentTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Audit Trail
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Technical details for compliance and reproducibility.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Model Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Model Version:</strong> {auditTrail.model_version || 'v1.2.3'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>LLM Model:</strong> {auditTrail.llm_model || 'gpt-4-turbo-2024-03-01'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Trace ID:</strong> {auditTrail.trace_id || id}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Performance Metrics
                      </Typography>
                      <Typography variant="body2">
                        <strong>Graph Query:</strong> {auditTrail.graph_query_ms || '145'} ms
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vector Search:</strong> {auditTrail.vector_search_ms || '89'} ms
                      </Typography>
                      <Typography variant="body2">
                        <strong>ML Inference:</strong> {auditTrail.ml_inference_ms || '23'} ms
                      </Typography>
                      <Typography variant="body2">
                        <strong>LLM Inference:</strong> {auditTrail.llm_inference_ms || '3421'} ms
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Total:</strong> {auditTrail.total_ms || '4800'} ms
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/cab')}>
          View in CAB Dashboard
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => navigate('/')}>
          Submit New Change
        </Button>
      </Box>
    </Container>
  );
};

export default RiskAssessment;
