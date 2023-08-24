import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@material-ui/core'
import  theme  from '@/styles/theme';
import { useState, useContext } from 'react';
import { UserContext } from '@/context/userContext';
import { GroupContext } from '@/context/groupContext';
import { QueryClient } from 'react-query';
import { QueryClientProvider } from 'react-query';
import { GroupDescription } from '../../common/src/db/groupExistenceAndMembership/groupMembership';

 
import {
  initializeAuth,
  indexedDBLocalPersistence,
  connectAuthEmulator,
  inMemoryPersistence,
  setPersistence,
  getAuth
} from 'firebase/auth';
 
 
import { firebase_app, auth } from '../../common/src/db/firebase_config';
import { isBrowser } from "../lib/generic/isBrowser";

export const LOGGED_OUT_ID = "";
export const INVALID_GROUP_CODE = "";
export default function App({ Component, pageProps }: AppProps) {
  const [userID, setUserID] = useState(LOGGED_OUT_ID);
  const [groupDescription, setGroupDescription] = useState<GroupDescription>(new GroupDescription(INVALID_GROUP_CODE, "", ""));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const queryClient = new QueryClient();

  // make sure we're not using IndexedDB when SSR
  // as it is only supported on browser environments
  const persistence = isBrowser()
    ? indexedDBLocalPersistence
    : inMemoryPersistence;
 
  //const auth = initializeAuth(firebase_app, { persistence });
  auth.setPersistence(persistence);


  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{userID, isLoggedIn, setUserID, setIsLoggedIn}}>
        <GroupContext.Provider value={{groupDescription, setGroupDescription}}>
          <ThemeProvider theme={theme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </GroupContext.Provider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}
