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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getPrediction } from '../api/client';
import RiskScoreCard from '../components/RiskScoreCard';
import RiskDriverCard from '../components/RiskDriverCard';
import RecommendationCard from '../components/RecommendationCard';
import { formatRiskScore, getRiskColor, getRiskBand, getRiskSurfaceColor } from '../utils/riskColors';
import { md3 } from '../theme';

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
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={56} thickness={3} />
        <Typography variant="h6" sx={{ mt: 2, color: md3.onSurfaceVariant }}>
          Loading Risk Assessment...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Submission
        </Button>
      </Container>
    );
  }

  if (!data) return null;

  const riskScore = data.risk_score || 0;
  const probabilities = data.probabilities || [];
  const riskDrivers = data.risk_drivers || [];
  const recommendations = data.recommendations || [];
  const similarChanges = data.similar_changes || [];
  const auditTrail = data.audit_trail || {};
  const changeDetails = data.change_details || {};

  const pieData = probabilities.map(prob => ({
    name: prob.outcome,
    value: prob.probability * 100,
  }));

  const COLORS = [md3.success, md3.error, md3.warning, '#BA1A1A', md3.outline];

  const mockSimilarChanges = similarChanges.length > 0 ? similarChanges : [
    { change_id: 'CHG0045231', description: 'OMS DB schema migration', outcome: 'Rollback', similarity: 87, date: '45 days ago' },
    { change_id: 'CHG0038172', description: 'Order API peak deploy', outcome: 'Incident (SEV2)', similarity: 76, date: '120 days ago' },
    { change_id: 'CHG0042018', description: 'Payment service update', outcome: 'Degraded', similarity: 71, date: '89 days ago' },
  ];

  return (
    <Box className="md3-page">
      <Box
        className="md3-blur-shape md3-blur-primary md3-float"
        sx={{ width: 350, height: 350, top: -100, left: -80 }}
      />
      <Box
        className="md3-blur-shape md3-blur-tertiary md3-float-delayed"
        sx={{ width: 280, height: 280, top: 200, right: -60 }}
      />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 500, color: md3.onSurface }}>
              Risk Assessment
            </Typography>
            <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mt: 0.5 }}>
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
            <Button
              startIcon={<CheckCircleIcon />}
              variant="contained"
              sx={{
                backgroundColor: md3.success,
                '&:hover': { backgroundColor: md3.success, opacity: 0.9 },
              }}
            >
              Submit to CAB
            </Button>
          </Box>
        </Box>

        {/* Risk Score Card */}
        <RiskScoreCard riskScore={riskScore} probabilities={probabilities} />

        {/* Tabs */}
        <Paper sx={{ mb: 4, borderRadius: '24px', overflow: 'hidden' }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable">
            <Tab label="Overview" />
            <Tab label="Risk Drivers" />
            <Tab label="Recommendations" />
            <Tab label="Similar Changes" />
            <Tab label="Audit Trail" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            {/* Tab 0: Overview */}
            {currentTab === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
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
                      <Typography sx={{ color: md3.onSurfaceVariant }}>No probability data available</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
                      Key Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Blast Radius Score', value: data.blast_radius_score || 72 },
                        { label: 'Test Evidence Score', value: data.test_evidence_score || 40, chip: 'Low', chipColor: 'warning' },
                        { label: 'Rollback Feasibility', value: data.rollback_feasibility || 30, chip: 'Low', chipColor: 'warning' },
                      ].map((metric) => (
                        <Grid item xs={12} key={metric.label}>
                          <Card
                            sx={{
                              backgroundColor: md3.surface,
                              border: `1px solid ${md3.outlineVariant}`,
                              '&:hover': { transform: 'none' },
                            }}
                          >
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                              <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 0.5 }}>
                                {metric.label}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant="h5" sx={{ fontWeight: 500, color: md3.onSurface }}>
                                  {metric.value} / 100
                                </Typography>
                                {metric.chip && (
                                  <Chip
                                    label={metric.chip}
                                    size="small"
                                    sx={{
                                      backgroundColor: md3.warningContainer,
                                      color: md3.warning,
                                      fontWeight: 500,
                                    }}
                                  />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
                  Change Details
                </Typography>
                <Card
                  sx={{
                    backgroundColor: md3.surface,
                    border: `1px solid ${md3.outlineVariant}`,
                    '&:hover': { transform: 'none' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 0.5 }}>
                          Short Description
                        </Typography>
                        <Typography variant="body1" sx={{ color: md3.onSurface }}>{changeDetails.short_description || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 0.5 }}>
                          Change Type
                        </Typography>
                        <Typography variant="body1" sx={{ color: md3.onSurface }}>{changeDetails.change_type || 'Normal'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 0.5 }}>
                          Category
                        </Typography>
                        <Typography variant="body1" sx={{ color: md3.onSurface }}>{changeDetails.change_category || 'Deployment'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 0.5 }}>
                          Impacted Services
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {(changeDetails.impacted_services || []).map((service, idx) => (
                            <Chip
                              key={idx}
                              label={service}
                              size="small"
                              sx={{
                                backgroundColor: md3.secondaryContainer,
                                color: md3.onSecondaryContainer,
                              }}
                            />
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
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
                  Risk Drivers
                </Typography>
                <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 3 }}>
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
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
                  Recommendations
                </Typography>
                <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 3 }}>
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
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
                  Similar Historical Changes
                </Typography>
                <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 3 }}>
                  Past changes with similar characteristics. Learn from historical outcomes.
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ backgroundColor: md3.surface, border: `1px solid ${md3.outlineVariant}` }}
                >
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
                            <Typography variant="body2" sx={{ fontWeight: 500, color: md3.primary }}>
                              {change.change_id}
                            </Typography>
                          </TableCell>
                          <TableCell>{change.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={change.outcome}
                              size="small"
                              sx={{
                                backgroundColor:
                                  change.outcome.includes('Rollback') || change.outcome.includes('Incident')
                                    ? md3.errorContainer
                                    : change.outcome.includes('Degraded')
                                    ? md3.warningContainer
                                    : md3.successContainer,
                                color:
                                  change.outcome.includes('Rollback') || change.outcome.includes('Incident')
                                    ? md3.error
                                    : change.outcome.includes('Degraded')
                                    ? md3.warning
                                    : md3.success,
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{change.similarity}%</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>{change.date}</Typography>
                          </TableCell>
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
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
                  Audit Trail
                </Typography>
                <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, mb: 3 }}>
                  Technical details for compliance and reproducibility.
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      title: 'Model Information',
                      items: [
                        { label: 'Model Version', value: auditTrail.model_version || 'v1.2.3' },
                        { label: 'LLM Model', value: auditTrail.llm_model || 'gpt-4-turbo-2024-03-01' },
                        { label: 'Trace ID', value: auditTrail.trace_id || id },
                      ],
                    },
                    {
                      title: 'Performance Metrics',
                      items: [
                        { label: 'Graph Query', value: `${auditTrail.graph_query_ms || '145'} ms` },
                        { label: 'Vector Search', value: `${auditTrail.vector_search_ms || '89'} ms` },
                        { label: 'ML Inference', value: `${auditTrail.ml_inference_ms || '23'} ms` },
                        { label: 'LLM Inference', value: `${auditTrail.llm_inference_ms || '3421'} ms` },
                        { label: 'Total', value: `${auditTrail.total_ms || '4800'} ms` },
                      ],
                    },
                  ].map((section) => (
                    <Grid item xs={12} md={6} key={section.title}>
                      <Card
                        sx={{
                          backgroundColor: md3.surface,
                          border: `1px solid ${md3.outlineVariant}`,
                          '&:hover': { transform: 'none' },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, color: md3.primary, mb: 2 }}>
                            {section.title}
                          </Typography>
                          {section.items.map((item) => (
                            <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>{item.label}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurface }}>{item.value}</Typography>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
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
    </Box>
  );
};

export default RiskAssessment;
