import { Card, CardContent, Typography, Box, Link } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { md3 } from '../theme';

const RiskDriverCard = ({ driver }) => {
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: md3.warningContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WarningAmberIcon sx={{ color: md3.warning, fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: md3.onSurface }}>
              {driver.driver}
            </Typography>

            {driver.evidence && driver.evidence.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurfaceVariant, mb: 1 }}>
                  Evidence:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {driver.evidence.map((item, index) => (
                    <Typography
                      component="li"
                      key={index}
                      variant="body2"
                      sx={{ mb: 0.5, color: md3.onSurfaceVariant }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {driver.historical_reference && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: md3.surface,
                  borderRadius: '16px',
                  border: `1px solid ${md3.outlineVariant}`,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: md3.onSurfaceVariant, mb: 1 }}>
                  Historical Reference:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: md3.onSurface }}>
                  {driver.historical_reference.description}
                </Typography>
                {driver.historical_reference.change_id && (
                  <Link
                    href="#"
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: md3.primary,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('View change:', driver.historical_reference.change_id);
                    }}
                  >
                    → {driver.historical_reference.change_id}: View Full Change
                  </Link>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RiskDriverCard;
