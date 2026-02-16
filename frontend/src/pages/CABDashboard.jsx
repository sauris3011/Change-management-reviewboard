import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getHistory } from '../api/client';
import { getRiskBand, getRiskColor, getRiskSurfaceColor, formatRiskScore } from '../utils/riskColors';
import { md3 } from '../theme';

const CABDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState([]);
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChanges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [changes, riskFilter, searchQuery]);

  const normalizeChange = (c) => ({
    id: c.change_id || c.id,
    short_description: c.short_description,
    risk_score: c.risk_score || 0,
    submitter: c.assignee || c.submitter || 'System',
    submitted_at: c.submitted_at || c.created_at || new Date().toISOString(),
    prediction_id: c.prediction_id,
  });

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const response = await getHistory({ status: 'pending' });
      const data = response.data.changes || response.data || [];
      setChanges(data.map(normalizeChange));
    } catch (err) {
      setChanges([]);
      console.log('Failed to fetch changes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...changes];
    if (riskFilter !== 'All') {
      filtered = filtered.filter((change) => getRiskBand(change.risk_score) === riskFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (change) =>
          (change.id || '').toLowerCase().includes(query) ||
          (change.short_description || '').toLowerCase().includes(query) ||
          (change.submitter || '').toLowerCase().includes(query)
      );
    }
    setFilteredChanges(filtered);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const avgRiskScore = changes.length > 0
    ? Math.round(changes.reduce((sum, c) => sum + c.risk_score, 0) / changes.length * 10) / 10
    : 0;

  const stats = {
    total: changes.length,
    highRisk: changes.filter((c) => c.risk_score > 55).length,
    critical: changes.filter((c) => c.risk_score > 75).length,
    avgRisk: avgRiskScore,
  };

  const statCards = [
    { label: 'Total Pending', value: stats.total, color: md3.primary, icon: <AssignmentIcon /> },
    { label: 'High Risk', value: stats.highRisk, color: md3.error, icon: <WarningIcon /> },
    { label: 'Critical Risk', value: stats.critical, color: '#B3261E', icon: <ErrorOutlineIcon /> },
    { label: 'Avg Risk Score', value: stats.avgRisk, color: md3.tertiary, icon: <TrendingUpIcon /> },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={56} thickness={3} />
        <Typography variant="h6" sx={{ mt: 2, color: md3.onSurfaceVariant }}>
          Loading CAB Dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Box className="md3-page">
      <Box
        className="md3-blur-shape md3-blur-primary md3-float"
        sx={{ width: 320, height: 320, top: -80, right: -60 }}
      />
      <Box
        className="md3-blur-shape md3-blur-secondary md3-float-delayed"
        sx={{ width: 250, height: 250, bottom: 100, left: -80 }}
      />

      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface, mb: 4 }}>
          CAB Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card sx={{ borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: stat.color,
                    opacity: 0.08,
                    filter: 'blur(20px)',
                  }}
                />
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                    <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 500, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: '24px' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Risk Band</InputLabel>
                <Select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  label="Risk Band"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by Change ID, description, or submitter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: md3.onSurfaceVariant }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Button fullWidth variant="outlined" onClick={fetchChanges}>
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Changes Table */}
        <TableContainer component={Paper} sx={{ borderRadius: '24px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Change ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Risk Band</TableCell>
                <TableCell>Submitter</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChanges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, py: 4 }}>
                      {changes.length === 0
                        ? 'No pending changes for review. Submit a change or upload a batch to get started.'
                        : 'No changes found matching the filters'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredChanges.map((change) => {
                  const riskBand = getRiskBand(change.risk_score);
                  const riskColor = getRiskColor(change.risk_score);
                  const riskSurface = getRiskSurfaceColor(change.risk_score);

                  return (
                    <TableRow
                      key={change.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/assessment/${change.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: md3.primary }}>
                          {change.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{change.short_description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: riskColor }}>
                          {formatRiskScore(change.risk_score)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={riskBand}
                          size="small"
                          sx={{
                            backgroundColor: riskSurface,
                            color: riskColor,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>{change.submitter}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
                          {getTimeAgo(change.submitted_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/assessment/${change.id}`); }}
                          sx={{ color: md3.primary }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredChanges.length > 0 && (
          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
              Showing {filteredChanges.length} of {changes.length} pending changes
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CABDashboard;
