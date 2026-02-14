import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { getRiskBand, getRiskColor, getRiskIcon, formatRiskScore } from '../utils/riskColors';

const RiskScoreCard = ({ riskScore, probabilities }) => {
  const riskBand = getRiskBand(riskScore);
  const riskColor = getRiskColor(riskScore);
  const riskIcon = getRiskIcon(riskScore);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${riskColor}15 0%, ${riskColor}05 100%)`,
        border: `2px solid ${riskColor}`,
        mb: 3,
      }}
    >
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: riskColor }}>
            {formatRiskScore(riskScore)} / 100
          </Typography>
          <Chip
            label={`${riskBand} Risk ${riskIcon}`}
            sx={{
              backgroundColor: riskColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              px: 2,
              py: 3,
            }}
          />
        </Box>

        {probabilities && probabilities.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Outcome Probabilities
            </Typography>
            {probabilities.map((prob, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {prob.outcome}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(prob.probability * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={prob.probability * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    backgroundColor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: riskColor,
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
