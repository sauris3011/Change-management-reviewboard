import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import { md3 } from '../theme';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Submit Change', path: '/', icon: <AddCircleIcon /> },
    { label: 'Bulk Upload', path: '/bulk-upload', icon: <CloudUploadIcon /> },
    { label: 'CAB Dashboard', path: '/cab', icon: <DashboardIcon /> },
    { label: 'History', path: '/history', icon: <HistoryIcon /> },
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mr: 4,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${md3.primary}, ${md3.tertiary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AssessmentIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 500,
                color: md3.onSurface,
                letterSpacing: '-0.01em',
              }}
            >
              Change Management AI
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: isActive ? md3.primary : md3.onSurfaceVariant,
                    backgroundColor: isActive ? md3.secondaryContainer : 'transparent',
                    borderRadius: 9999,
                    px: 2.5,
                    py: 1,
                    fontWeight: isActive ? 500 : 400,
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: isActive
                        ? md3.secondaryContainer
                        : `${md3.primary}0A`,
                    },
                    '&:active': { transform: 'scale(0.95)' },
                    transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
