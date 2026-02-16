import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';
import { evaluateChange } from '../api/client';
import { md3 } from '../theme';

const ChangeSubmission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    short_description: '',
    long_description: '',
    change_type: 'Normal',
    change_category: 'Deployment',
    impacted_services: [],
    aws_components: [],
    planned_window: '',
    implementation_steps: [''],
    rollback_plan: '',
    validation_steps: '',
    test_results_summary: '',
  });

  const [serviceInput, setServiceInput] = useState('');
  const [awsInput, setAwsInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddService = () => {
    if (serviceInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        impacted_services: [...prev.impacted_services, serviceInput.trim()],
      }));
      setServiceInput('');
    }
  };

  const handleRemoveService = (index) => {
    setFormData((prev) => ({
      ...prev,
      impacted_services: prev.impacted_services.filter((_, i) => i !== index),
    }));
  };

  const handleAddAWS = () => {
    if (awsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        aws_components: [...prev.aws_components, awsInput.trim()],
      }));
      setAwsInput('');
    }
  };

  const handleRemoveAWS = (index) => {
    setFormData((prev) => ({
      ...prev,
      aws_components: prev.aws_components.filter((_, i) => i !== index),
    }));
  };

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      implementation_steps: [...prev.implementation_steps, ''],
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      implementation_steps: prev.implementation_steps.filter((_, i) => i !== index),
    }));
  };

  const handleStepChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      implementation_steps: prev.implementation_steps.map((step, i) =>
        i === index ? value : step
      ),
    }));
  };

  const simulateProgress = () => {
    const messages = [
      'Extracting entities...',
      'Analyzing impact...',
      'Querying historical data...',
      'Running ML model...',
      'Generating AI explanation...',
      'Finalizing assessment...',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= messages.length) {
        setProgress((currentStep / messages.length) * 100);
        setProgressMessage(messages[currentStep - 1]);
      }
      if (currentStep > messages.length) {
        clearInterval(interval);
      }
    }, 2000);

    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const payload = {
        ...formData,
        implementation_steps: formData.implementation_steps.filter(step => step.trim() !== ''),
      };

      const response = await evaluateChange(payload);

      clearInterval(progressInterval);

      const predictionId = response.data.prediction_id || response.data.id;
      if (predictionId) {
        navigate(`/assessment/${predictionId}`);
      } else {
        setError('Failed to get prediction ID from server');
        setLoading(false);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.message || 'Failed to evaluate change. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.short_description.trim() !== '' &&
      formData.long_description.trim() !== '' &&
      formData.impacted_services.length > 0 &&
      formData.implementation_steps.some(step => step.trim() !== '') &&
      formData.rollback_plan.trim() !== ''
    );
  };

  const sectionTitleSx = {
    fontWeight: 500,
    color: md3.onSurface,
    mt: 4,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '&::before': {
      content: '""',
      width: 4,
      height: 24,
      borderRadius: 2,
      backgroundColor: md3.primary,
      display: 'inline-block',
    },
  };

  return (
    <Box className="md3-page">
      {/* Decorative blur shapes */}
      <Box
        className="md3-blur-shape md3-blur-primary md3-float"
        sx={{ width: 300, height: 300, top: -80, right: -60 }}
      />
      <Box
        className="md3-blur-shape md3-blur-tertiary md3-float-delayed"
        sx={{ width: 250, height: 250, bottom: -50, left: -80 }}
      />

      <Container maxWidth="md" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: '32px' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface, mb: 1 }}>
            Submit Change for Risk Evaluation
          </Typography>
          <Typography variant="body1" sx={{ color: md3.onSurfaceVariant, mb: 3 }}>
            Provide details about your change request to receive an AI-powered risk assessment.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ mb: 3, p: 3, backgroundColor: md3.surface, borderRadius: '16px', border: `1px solid ${md3.outlineVariant}` }}>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 1.5 }} />
              <Typography variant="body2" align="center" sx={{ color: md3.primary, fontWeight: 500 }}>
                {progressMessage}
              </Typography>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Typography variant="h6" sx={sectionTitleSx}>
              Basic Information
            </Typography>

            <TextField
              fullWidth
              required
              label="Short Description"
              value={formData.short_description}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
              placeholder="Deploy OMS Order API v2.3.5..."
              inputProps={{ maxLength: 255 }}
              sx={{ mb: 2.5 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Long Description"
              value={formData.long_description}
              onChange={(e) => handleInputChange('long_description', e.target.value)}
              placeholder="Detailed description of the change..."
              sx={{ mb: 2.5 }}
              disabled={loading}
            />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Change Type</InputLabel>
                  <Select
                    value={formData.change_type}
                    onChange={(e) => handleInputChange('change_type', e.target.value)}
                    label="Change Type"
                    disabled={loading}
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Change Category</InputLabel>
                  <Select
                    value={formData.change_category}
                    onChange={(e) => handleInputChange('change_category', e.target.value)}
                    label="Change Category"
                    disabled={loading}
                  >
                    <MenuItem value="Deployment">Deployment</MenuItem>
                    <MenuItem value="Configuration">Configuration</MenuItem>
                    <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                    <MenuItem value="Database">Database</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Impact Assessment */}
            <Typography variant="h6" sx={sectionTitleSx}>
              Impact Assessment
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  fullWidth
                  label="Impacted Services *"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  placeholder="e.g., svc-oms-order-api"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                  disabled={loading}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddService}
                  disabled={loading}
                  sx={{ minWidth: 48, px: 1 }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.impacted_services.map((service, index) => (
                  <Chip
                    key={index}
                    label={service}
                    onDelete={() => handleRemoveService(index)}
                    sx={{
                      backgroundColor: md3.primaryContainer,
                      color: md3.onPrimaryContainer,
                      '& .MuiChip-deleteIcon': { color: md3.onPrimaryContainer },
                    }}
                    disabled={loading}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  fullWidth
                  label="AWS Components"
                  value={awsInput}
                  onChange={(e) => setAwsInput(e.target.value)}
                  placeholder="e.g., ECS, Lambda, RDS"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAWS())}
                  disabled={loading}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAWS}
                  disabled={loading}
                  sx={{ minWidth: 48, px: 1 }}
                >
                  <AddIcon />
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.aws_components.map((component, index) => (
                  <Chip
                    key={index}
                    label={component}
                    onDelete={() => handleRemoveAWS(index)}
                    sx={{
                      backgroundColor: md3.secondaryContainer,
                      color: md3.onSecondaryContainer,
                      '& .MuiChip-deleteIcon': { color: md3.onSecondaryContainer },
                    }}
                    disabled={loading}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              type="datetime-local"
              label="Planned Implementation Window"
              value={formData.planned_window}
              onChange={(e) => handleInputChange('planned_window', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            {/* Implementation Details */}
            <Typography variant="h6" sx={sectionTitleSx}>
              Implementation Details
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurfaceVariant, mb: 1.5 }}>
                Implementation Steps *
              </Typography>
              {formData.implementation_steps.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    fullWidth
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    disabled={loading}
                  />
                  {formData.implementation_steps.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveStep(index)}
                      disabled={loading}
                      sx={{ color: md3.error }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddStep}
                variant="text"
                size="small"
                disabled={loading}
                sx={{ mt: 0.5 }}
              >
                Add Step
              </Button>
            </Box>

            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Rollback Plan"
              value={formData.rollback_plan}
              onChange={(e) => handleInputChange('rollback_plan', e.target.value)}
              placeholder="Describe how to rollback this change..."
              sx={{ mb: 2.5 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Validation Steps"
              value={formData.validation_steps}
              onChange={(e) => handleInputChange('validation_steps', e.target.value)}
              placeholder="How will you validate the change?"
              sx={{ mb: 2.5 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Test Results Summary"
              value={formData.test_results_summary}
              onChange={(e) => handleInputChange('test_results_summary', e.target.value)}
              placeholder="Summary of test results..."
              sx={{ mb: 4 }}
              disabled={loading}
            />

            {/* Submission Info & Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: md3.onSurfaceVariant }}>
                Submission date: {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" disabled={loading} onClick={() => navigate('/cab')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !isFormValid()}
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : <RocketLaunchIcon />}
                  sx={{ px: 4 }}
                >
                  {loading ? 'Evaluating...' : 'Evaluate Risk'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChangeSubmission;
