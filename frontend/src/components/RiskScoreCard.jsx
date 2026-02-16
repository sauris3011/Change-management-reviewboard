import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { getRiskBand, getRiskColor, getRiskSurfaceColor, getRiskIcon, formatRiskScore } from '../utils/riskColors';
import { md3 } from '../theme';

const RiskScoreCard = ({ riskScore, probabilities }) => {
  const riskBand = getRiskBand(riskScore);
  const riskColor = getRiskColor(riskScore);
  const riskSurface = getRiskSurfaceColor(riskScore);
  const riskIcon = getRiskIcon(riskScore);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${riskSurface}60 0%, ${md3.surfaceContainer} 100%)`,
        border: `1px solid ${riskColor}30`,
        borderRadius: '32px',
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { transform: 'none' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: riskColor,
          opacity: 0.06,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 500, color: riskColor, fontSize: '3rem' }}
          >
            {formatRiskScore(riskScore)} / 100
          </Typography>
          <Chip
            label={`${riskBand} Risk ${riskIcon}`}
            sx={{
              backgroundColor: riskColor,
              color: '#FFFFFF',
              fontWeight: 500,
              fontSize: '1rem',
              px: 3,
              py: 3,
              height: 'auto',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Box>

        {probabilities && probabilities.length > 0 && (
          <Box sx={{ mt: 4, maxWidth: 480, mx: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
              Outcome Probabilities
            </Typography>
            {probabilities.map((prob, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurfaceVariant }}>
                    {prob.outcome}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurface }}>
                    {(prob.probability * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={prob.probability * 100}
                  sx={{
                    height: 8,
                    borderRadius: 9999,
                    backgroundColor: md3.surfaceContainerLow,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: riskColor,
                      borderRadius: 9999,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;
