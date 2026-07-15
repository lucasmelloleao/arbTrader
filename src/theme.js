import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7df9c1', // Vibrant green from previous theme
      contrastText: '#0a0a0a',
    },
    secondary: {
      main: '#3498db', // Blue accent
      contrastText: '#ffffff',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
    },
    success: {
      main: '#7df9c1',
    },
    error: {
      main: '#ff6b7a',
    },
    warning: {
      main: '#f39c12',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 0 15px rgba(125, 249, 193, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backgroundImage: 'none',
          border: '1px solid #30363d',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#8b949e',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
});

export default theme;
