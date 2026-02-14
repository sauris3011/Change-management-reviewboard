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
import { useNavigate } from 'react-router-dom';
import { evaluateChange } from '../api/client';

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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Submit Change for Risk Evaluation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Typography variant="body2" align="center" color="primary">
              {progressMessage}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <Grid container spacing={2} sx={{ mb: 3 }}>
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
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
            Impact Assessment
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label="Impacted Services *"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                placeholder="e.g., svc-oms-order-api"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                disabled={loading}
              />
              <Button variant="outlined" onClick={handleAddService} disabled={loading}>
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.impacted_services.map((service, index) => (
                <Chip
                  key={index}
                  label={service}
                  onDelete={() => handleRemoveService(index)}
                  color="primary"
                  disabled={loading}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label="AWS Components"
                value={awsInput}
                onChange={(e) => setAwsInput(e.target.value)}
                placeholder="e.g., ECS, Lambda, RDS"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAWS())}
                disabled={loading}
              />
              <Button variant="outlined" onClick={handleAddAWS} disabled={loading}>
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.aws_components.map((component, index) => (
                <Chip
                  key={index}
                  label={component}
                  onDelete={() => handleRemoveAWS(index)}
                  color="secondary"
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
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
            Implementation Details
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Implementation Steps *
            </Typography>
            {formData.implementation_steps.map((step, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  disabled={loading}
                />
                {formData.implementation_steps.length > 1 && (
                  <IconButton onClick={() => handleRemoveStep(index)} color="error" disabled={loading}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddStep} variant="outlined" size="small" disabled={loading}>
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 3 }}
            disabled={loading}
          />

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="outlined" disabled={loading} onClick={() => navigate('/cab')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !isFormValid()}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Evaluating...' : 'Evaluate Risk'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangeSubmission;
