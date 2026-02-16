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
  TablePagination,
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
import { getRiskBand, getRiskColor, getRiskSurfaceColor, formatRiskScore } from '../utils/riskColors';
import { md3 } from '../theme';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const History = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChanges();
  }, [page, rowsPerPage]);

  useEffect(() => {
    applyFilters();
  }, [changes, riskFilter, statusFilter, searchQuery]);

  const normalizeChange = (c) => ({
    id: c.change_id || c.id,
    short_description: c.short_description,
    risk_score: c.risk_score || 0,
    status: c.final_outcome === 'success' ? 'Completed'
          : c.final_outcome === 'rollback' || c.final_outcome === 'deploy_fail' ? 'Rejected'
          : c.final_outcome ? 'Completed'
          : 'Pending',
    submitter: c.assignee || c.submitter || 'System',
    submitted_at: c.submitted_at || c.created_at || new Date().toISOString(),
    completed_at: c.final_outcome ? (c.updated_at || c.created_at) : null,
    prediction_id: c.prediction_id,
  });

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const response = await getHistory({
        status: 'historical',
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      });
      const data = response.data.changes || response.data || [];
      setChanges(data.map(normalizeChange));
      setTotalCount(response.data.pagination?.total || data.length);
    } catch (err) {
      setChanges([]);
      setTotalCount(0);
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
    if (statusFilter !== 'All') {
      filtered = filtered.filter((change) => change.status === statusFilter);
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
    filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    setFilteredChanges(filtered);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      change.id, change.short_description, formatRiskScore(change.risk_score),
      getRiskBand(change.risk_score), change.status, change.submitter,
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
      <Container maxWidth="xl" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={56} thickness={3} />
        <Typography variant="h6" sx={{ mt: 2, color: md3.onSurfaceVariant }}>
          Loading History...
        </Typography>
      </Container>
    );
  }

  return (
    <Box className="md3-page">
      <Box
        className="md3-blur-shape md3-blur-secondary md3-float"
        sx={{ width: 280, height: 280, top: -60, left: '50%' }}
      />

      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 500, color: md3.onSurface }}>
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
                  startAdornment: <SearchIcon sx={{ mr: 1, color: md3.onSurfaceVariant }} />,
                }}
              />
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
                <TableCell>Status</TableCell>
                <TableCell>Submitter</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Completed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChanges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" sx={{ color: md3.onSurfaceVariant, py: 4 }}>
                      No changes found matching the filters
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
                      <TableCell>
                        <Chip
                          label={change.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              change.status === 'Completed' ? md3.successContainer
                              : change.status === 'Rejected' ? md3.errorContainer
                              : md3.surfaceContainerLow,
                            color:
                              change.status === 'Completed' ? md3.success
                              : change.status === 'Rejected' ? md3.error
                              : md3.onSurfaceVariant,
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
                        <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
                          {getTimeAgo(change.completed_at)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            sx={{
              borderTop: `1px solid ${md3.outlineVariant}`,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: md3.onSurfaceVariant,
              },
            }}
          />
        </TableContainer>
      </Container>
    </Box>
  );
};

export default History;
