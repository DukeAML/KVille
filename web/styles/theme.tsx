import { createTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00539B', // Replace with your desired primary color
    },
  },
});

export default responsiveFontSizes(theme);