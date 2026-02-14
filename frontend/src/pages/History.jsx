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
  CircularProgress,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { getHistory } from '../api/client';
import { getRiskBand, getRiskColor, formatRiskScore } from '../utils/riskColors';

const History = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changes, setChanges] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState([]);
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChanges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [changes, riskFilter, statusFilter, searchQuery]);

  const fetchChanges = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getHistory();
      const data = response.data.changes || response.data || [];
      setChanges(data);
    } catch (err) {
      // If API fails, use mock data with more historical changes
      const mockData = [
        {
          id: 'CHG0012345',
          short_description: 'Deploy OMS Order API v2.3.5',
          risk_score: 67.5,
          status: 'Pending',
          submitter: 'John Doe',
          submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
        {
          id: 'CHG0012344',
          short_description: 'Update Kafka retention policy',
          risk_score: 28.3,
          status: 'Completed',
          submitter: 'Jane Smith',
          submitted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'CHG0012343',
          short_description: 'Database schema migration for user profiles',
          risk_score: 82.1,
          status: 'Approved',
          submitter: 'Bob Wilson',
          submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
        {
          id: 'CHG0012342',
          short_description: 'Update SSL certificate for payment gateway',
          risk_score: 15.2,
          status: 'Completed',
          submitter: 'Alice Johnson',
          submitted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'CHG0012341',
          short_description: 'Scale ECS service capacity',
          risk_score: 42.8,
          status: 'Completed',
          submitter: 'Charlie Brown',
          submitted_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'CHG0012340',
          short_description: 'Update Lambda function timeout settings',
          risk_score: 22.5,
          status: 'Completed',
          submitter: 'David Lee',
          submitted_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'CHG0012339',
          short_description: 'Migrate RDS instance to multi-AZ',
          risk_score: 71.3,
          status: 'Rejected',
          submitter: 'Eve Martinez',
          submitted_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
        {
          id: 'CHG0012338',
          short_description: 'Deploy authentication service v3.0',
          risk_score: 55.8,
          status: 'Completed',
          submitter: 'Frank White',
          submitted_at: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 132 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setChanges(mockData);
      console.log('Using mock data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...changes];

    // Apply risk filter
    if (riskFilter !== 'All') {
      filtered = filtered.filter((change) => getRiskBand(change.risk_score) === riskFilter);
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((change) => change.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (change) =>
          change.id.toLowerCase().includes(query) ||
          change.short_description.toLowerCase().includes(query) ||
          change.submitter.toLowerCase().includes(query)
      );
    }

    // Sort by submitted date (newest first)
    filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

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

  const exportToCSV = () => {
    const headers = ['Change ID', 'Description', 'Risk Score', 'Risk Band', 'Status', 'Submitter', 'Submitted', 'Completed'];
    const rows = filteredChanges.map(change => [
      change.id,
      change.short_description,
      formatRiskScore(change.risk_score),
      getRiskBand(change.risk_score),
      change.status,
      change.submitter,
      new Date(change.submitted_at).toLocaleString(),
      change.completed_at ? new Date(change.completed_at).toLocaleString() : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `change-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading History...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Change History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          disabled={filteredChanges.length === 0}
        >
          Export to CSV
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Change ID, description, or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Changes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Change ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Risk Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Risk Band</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitter</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChanges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No changes found matching the filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredChanges.map((change) => {
                const riskBand = getRiskBand(change.risk_score);
                const riskColor = getRiskColor(change.risk_score);

                return (
                  <TableRow
                    key={change.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/assessment/${change.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {change.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{change.short_description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: riskColor }}>
                        {formatRiskScore(change.risk_score)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={riskBand}
                        size="small"
                        sx={{
                          backgroundColor: riskColor,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={change.status}
                        size="small"
                        color={
                          change.status === 'Completed' || change.status === 'Approved'
                            ? 'success'
                            : change.status === 'Rejected'
                            ? 'error'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{change.submitter}</TableCell>
                    <TableCell>{getTimeAgo(change.submitted_at)}</TableCell>
                    <TableCell>{getTimeAgo(change.completed_at)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredChanges.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredChanges.length} of {changes.length} changes
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default History;
