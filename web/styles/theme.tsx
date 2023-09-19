import { createTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00539B', // Replace with your desired primary color
    },
  },
  typography : {
    h4: {
      fontFamily: '"Larsseit", Helvetica, Arial, "Lucida Grande", sans-serif',
      fontWeight: 800,
      fontSize: '2rem',      // Adjust as needed
      color: '#222',         // Dark gray text color (adjust as needed)
      letterSpacing: '-0.028em', // Negative letter spacing
      lineHeight: 1.2,       // Line height for better readability
    },
    /*
    button: {
      fontFamily : '"TT Norms", Helvetica, Arial, "Lucida Grande", sans-serif',
      fontWeight : 'bold',
    }*/
  },
  
});

export default responsiveFontSizes(theme);