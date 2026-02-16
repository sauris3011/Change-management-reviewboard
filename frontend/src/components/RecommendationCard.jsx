import { Card, CardContent, Typography, Box, Chip, Checkbox, FormControlLabel } from '@mui/material';
import { getCategoryColor, getCategoryContainerColor, getCategoryIcon } from '../utils/riskColors';
import { md3 } from '../theme';

const RecommendationCard = ({ recommendation }) => {
  const categoryColor = getCategoryColor(recommendation.category);
  const categoryContainer = getCategoryContainerColor(recommendation.category);
  const categoryIcon = getCategoryIcon(recommendation.category);

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${md3.outlineVariant}`,
        backgroundColor: md3.surfaceContainer,
        borderRadius: '24px',
        transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={`${categoryIcon} ${recommendation.category}`}
            sx={{
              backgroundColor: categoryContainer,
              color: categoryColor,
              fontWeight: 500,
            }}
          />
          {recommendation.priority && (
            <Chip
              label={`Priority: ${recommendation.priority}`}
              size="small"
              sx={{
                backgroundColor: recommendation.priority === 'HIGH' ? md3.errorContainer : md3.warningContainer,
                color: recommendation.priority === 'HIGH' ? md3.error : md3.warning,
                fontWeight: 500,
              }}
            />
          )}
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
          {recommendation.recommendation}
        </Typography>

        {recommendation.rationale && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: md3.surface,
              borderRadius: '16px',
              border: `1px solid ${md3.outlineVariant}`,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurfaceVariant, mb: 0.5 }}>
              Rationale:
            </Typography>
            <Typography variant="body2" sx={{ color: md3.onSurface }}>{recommendation.rationale}</Typography>
          </Box>
        )}

        {recommendation.based_on && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: md3.onSurfaceVariant, fontStyle: 'italic' }}>
              Based on: {recommendation.based_on}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                disabled
                sx={{
                  color: md3.outline,
                  '&.Mui-checked': { color: md3.primary },
                }}
              />
            }
            label="Mark as Complete"
            sx={{ color: md3.onSurfaceVariant }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
