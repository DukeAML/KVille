import { createContext, useContext, useState } from 'react';
import { lightTheme, generalTheme } from '../helper/theme'

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  return (
    <ThemeContext.Provider value={{theme:theme, generalTheme: generalTheme}}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
