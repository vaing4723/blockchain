import { createTheme } from '@mui/material/styles';

// 定义所有主题
export const themes = {
  darkTheme: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#bb86fc' },
      secondary: { main: '#03dac6' },
      background: { default: '#121212', paper: '#1e1e1e' },
    },
  }),
  techBlueTheme: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#2196F3' },
      secondary: { main: '#E91E63' },
      background: { default: '#1a1a2e', paper: '#162447' },
      text: { primary: '#EDEDED', secondary: '#A9A9A9' },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
    },
  }),
  mintFreshTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#4CAF50' },
      secondary: { main: '#FFC107' },
      background: { default: '#F5F5F5', paper: '#FFFFFF' },
      text: { primary: '#333333', secondary: '#666666' },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { textTransform: 'none' },
    },
  }),
  luxuryMetalTheme: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#FFD700' },
      secondary: { main: '#C0C0C0' },
      background: { default: '#2C2C2C', paper: '#3A3A3A' },
      text: { primary: '#FFFFFF', secondary: '#B3B3B3' },
    },
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: 'uppercase' },
    },
  }),
  vibrantGradientTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#FF5F6D' },
      secondary: { main: '#FFC371' },
      background: { default: '#FFFFFF', paper: '#FFF7E6' },
      text: { primary: '#333333', secondary: '#666666' },
    },
    typography: {
      fontFamily: 'Quicksand, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: {
        textTransform: 'uppercase',
        background: 'linear-gradient(45deg, #FF5F6D 30%, #FFC371 90%)',
        color: '#FFFFFF',
      },
    },
  }),
  elegantDarkTheme: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#9C27B0' },
      secondary: { main: '#673AB7' },
      background: { default: '#121212', paper: '#1E1E1E' },
      text: { primary: '#EDEDED', secondary: '#B3B3B3' },
    },
    typography: {
      fontFamily: 'Merriweather, serif',
      h1: { fontWeight: 900 },
      h2: { fontWeight: 700 },
      button: { textTransform: 'none' },
    },
  }),
  notionTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#000000' },
      secondary: { main: '#586e75' },
      background: { default: '#FFFFFF', paper: '#F7F7F7' },
      text: { primary: '#333333', secondary: '#666666' },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
    },
  }),
  slackTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#4A154B' },
      secondary: { main: '#36C5F0' },
      background: { default: '#F4F4F6', paper: '#FFFFFF' },
      text: { primary: '#1A1D21', secondary: '#616061' },
    },
    typography: {
      fontFamily: 'Lato, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
  }),
  airbnbTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#FF5A5F' },
      secondary: { main: '#00A699' },
      background: { default: '#FFFFFF', paper: '#F7F7F7' },
      text: { primary: '#484848', secondary: '#767676' },
    },
    typography: {
      fontFamily: 'Circular, sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 500 },
      button: { fontWeight: 700, textTransform: 'none' },
    },
  }),
  dribbbleTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#EA4C89' },
      secondary: { main: '#181818' },
      background: { default: '#F5F5F5', paper: '#FFFFFF' },
      text: { primary: '#333333', secondary: '#666666' },
    },
    typography: {
      fontFamily: 'Gotham, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
    },
  }),
  githubTheme: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#24292E' },
      secondary: { main: '#0366D6' },
      background: { default: '#0D1117', paper: '#161B22' },
      text: { primary: '#C9D1D9', secondary: '#8B949E' },
    },
    typography: {
      fontFamily: 'Source Code Pro, monospace',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: 'none' },
    },
  }),
  robinhoodTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#00C805' },
      secondary: { main: '#202020' },
      background: { default: '#F4F4F6', paper: '#FFFFFF' },
      text: { primary: '#202020', secondary: '#737373' },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
  }),
  coinbaseTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#1652F0' },
      secondary: { main: '#0052FF' },
      background: { default: '#FFFFFF', paper: '#F5F6FA' },
      text: { primary: '#1A1A1A', secondary: '#555555' },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: 'none' },
    },
  }),
  bloombergTheme: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#0A0A0A' },
      secondary: { main: '#4E70D8' },
      background: { default: '#121212', paper: '#1C1C1E' },
      text: { primary: '#EAEAEA', secondary: '#A8A8A8' },
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: 'uppercase' },
    },
  }),
  wealthsimpleTheme: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#FFD700' },
      secondary: { main: '#333333' },
      background: { default: '#F8F8F8', paper: '#FFFFFF' },
      text: { primary: '#333333', secondary: '#666666' },
    },
    typography: {
      fontFamily: 'Georgia, serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: 'uppercase' },
    },
  }),
};

const createCustomTheme = (mode:any) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1976d2' : '#90caf9',
    },
    secondary: {
      main: mode === 'light' ? '#dc004e' : '#f48fb1',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#303030',
      paper: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
});

export const lightTheme = createCustomTheme('light');
export const darkTheme = createCustomTheme('dark');
