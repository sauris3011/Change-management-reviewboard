import { createTheme } from '@mui/material';

// Material You (MD3) Design Tokens — Purple seed #6750A4
const md3 = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  surface: '#FFFBFE',
  surfaceContainer: '#F3EDF7',
  surfaceContainerLow: '#E7E0EC',
  surfaceContainerHigh: '#ECE6F0',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  success: '#1B6B3A',
  successContainer: '#A7F5BA',
  warning: '#7C5800',
  warningContainer: '#FFDEA6',
};

const theme = createTheme({
  palette: {
    primary: { main: md3.primary, contrastText: md3.onPrimary },
    secondary: { main: md3.secondary, contrastText: md3.onSecondary },
    success: { main: md3.success, contrastText: '#FFFFFF' },
    warning: { main: md3.warning, contrastText: '#FFFFFF' },
    error: { main: md3.error, contrastText: md3.onError },
    background: { default: md3.surface, paper: md3.surfaceContainer },
    text: { primary: md3.onSurface, secondary: md3.onSurfaceVariant },
    divider: md3.outlineVariant,
    md3,
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 500, letterSpacing: 0 },
    h4: { fontWeight: 500, letterSpacing: 0 },
    h5: { fontWeight: 500, letterSpacing: 0 },
    h6: { fontWeight: 500, letterSpacing: 0 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 500, letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: md3.surface,
          color: md3.onSurface,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
          '&:active': { transform: 'scale(0.95)' },
        },
        contained: {
          '&:hover': { opacity: 0.9, boxShadow: '0 2px 8px rgba(103,80,164,0.3)' },
        },
        outlined: {
          borderColor: md3.outline,
          color: md3.primary,
          '&:hover': { backgroundColor: `${md3.primary}0A`, borderColor: md3.primary },
        },
        text: {
          '&:hover': { backgroundColor: `${md3.primary}14` },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: md3.surfaceContainer,
          backgroundImage: 'none',
          transition: 'box-shadow 300ms cubic-bezier(0.2, 0, 0, 1), transform 300ms cubic-bezier(0.2, 0, 0, 1)',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: md3.surfaceContainer,
          backgroundImage: 'none',
          transition: 'box-shadow 300ms cubic-bezier(0.2, 0, 0, 1), transform 300ms cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 500,
          transition: 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
        },
        filled: {
          '&:hover': { opacity: 0.9 },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'filled' },
      styleOverrides: {
        root: {
          '& .MuiFilledInput-root': {
            borderRadius: '12px 12px 0 0',
            backgroundColor: md3.surfaceContainerLow,
            '&:hover': { backgroundColor: `${md3.surfaceContainerLow}CC` },
            '&.Mui-focused': { backgroundColor: md3.surfaceContainerLow },
            '&::before': { borderColor: md3.outline },
            '&::after': { borderColor: md3.primary },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { variant: 'filled' },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px 12px 0 0',
          backgroundColor: md3.surfaceContainerLow,
          '&:hover': { backgroundColor: `${md3.surfaceContainerLow}CC` },
          '&.Mui-focused': { backgroundColor: md3.surfaceContainerLow },
          '&::before': { borderColor: md3.outline },
          '&::after': { borderColor: md3.primary },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: md3.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          color: md3.onSurfaceVariant,
          transition: 'color 200ms, background-color 200ms',
          borderRadius: '12px 12px 0 0',
          '&:hover': { backgroundColor: `${md3.primary}0A` },
          '&.Mui-selected': { color: md3.primary },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { borderRadius: 24, overflow: 'hidden' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: md3.surfaceContainerHigh,
            color: md3.onSurfaceVariant,
            fontWeight: 500,
            fontSize: '0.8125rem',
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 200ms cubic-bezier(0.2, 0, 0, 1)',
          '&.MuiTableRow-hover:hover': { backgroundColor: `${md3.primary}08` },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: md3.outlineVariant,
          color: md3.onSurface,
          padding: '14px 16px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 16 },
        standardError: { backgroundColor: md3.errorContainer, color: md3.error },
        standardSuccess: { backgroundColor: md3.successContainer, color: md3.success },
        standardWarning: { backgroundColor: md3.warningContainer, color: md3.warning },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          height: 6,
          backgroundColor: md3.surfaceContainerLow,
        },
        bar: { borderRadius: 9999 },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: md3.primary },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,251,254,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${md3.outlineVariant}`,
          color: md3.onSurface,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': { backgroundColor: `${md3.primary}14` },
          '&:active': { transform: 'scale(0.9)' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: md3.outlineVariant },
      },
    },
    MuiFormControl: {
      defaultProps: { variant: 'filled' },
    },
  },
});

export default theme;
export { md3 };
