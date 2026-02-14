import { Card, CardContent, Typography, Box, Chip, Link } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const RiskDriverCard = ({ driver }) => {
  return (
    <Card sx={{ mb: 2, border: '1px solid #F59E0B', backgroundColor: '#FFFBEB' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <WarningIcon sx={{ color: '#F59E0B', fontSize: 32, mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#92400E' }}>
              {driver.driver}
            </Typography>

            {driver.evidence && driver.evidence.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Evidence:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {driver.evidence.map((item, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {driver.historical_reference && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Historical Reference:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {driver.historical_reference.description}
                </Typography>
                {driver.historical_reference.change_id && (
                  <Link
                    href="#"
                    variant="body2"
                    sx={{ fontWeight: 600, textDecoration: 'none' }}
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
