import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@material-ui/core'
import  theme  from '@/styles/theme';
import { useState, useContext } from 'react';
import { UserContext } from '@/context/userContext';
import { QueryClient } from 'react-query';
import { QueryClientProvider } from 'react-query';

export const LOGGED_OUT_ID = "";
export default function App({ Component, pageProps }: AppProps) {
  const [userID, setUserID] = useState(LOGGED_OUT_ID);
  const [groupCode, setGroupCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{userID, groupCode, isLoggedIn, setUserID, setGroupCode, setIsLoggedIn}}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}
