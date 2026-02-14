import { Card, CardContent, Typography, Box, Chip, Checkbox, FormControlLabel } from '@mui/material';
import { getCategoryColor, getCategoryIcon } from '../utils/riskColors';

const RecommendationCard = ({ recommendation }) => {
  const categoryColor = getCategoryColor(recommendation.category);
  const categoryIcon = getCategoryIcon(recommendation.category);

  return (
    <Card sx={{ mb: 2, border: `1px solid ${categoryColor}30` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={`${categoryIcon} ${recommendation.category}`}
            sx={{
              backgroundColor: categoryColor,
              color: 'white',
              fontWeight: 600,
            }}
          />
          {recommendation.priority && (
            <Chip
              label={`Priority: ${recommendation.priority}`}
              size="small"
              sx={{
                backgroundColor: recommendation.priority === 'HIGH' ? '#EF4444' : '#F59E0B',
                color: 'white',
              }}
            />
          )}
        </Box>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {recommendation.recommendation}
        </Typography>

        {recommendation.rationale && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#F9FAFB', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Rationale:
            </Typography>
            <Typography variant="body2">{recommendation.rationale}</Typography>
          </Box>
        )}

        {recommendation.based_on && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
              Based on: {recommendation.based_on}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Checkbox disabled />}
            label="Mark as Complete"
            sx={{ color: '#6B7280' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
