import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@material-ui/core'
import  theme  from '@/styles/theme';
import { useState, } from 'react';
import { UserContext } from '@/lib/context/userContext';
import { GroupContext } from '@/lib/context/groupContext';
import { QueryClient } from 'react-query';
import { QueryClientProvider } from 'react-query';
import {ReactQueryDevtools} from 'react-query/devtools';
import { GroupDescription } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_USER_ID } from '@/lib/db/auth/login';
import { INVALID_GROUP_CODE } from '@/lib/db/groupExistenceAndMembership/GroupCode';

import {
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
 
 
import {  auth } from '@/lib/db/firebase_config';
import { isBrowser } from "@/lib/hooks/windowProperties";
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  const [userID, setUserID] = useState(INVALID_USER_ID);
  const [groupDescription, setGroupDescription] = useState<GroupDescription>(new GroupDescription(INVALID_GROUP_CODE, "", "", ""));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [triedToLogIn, setTriedToLogIn] = useState<boolean>(false);
  const queryClient = new QueryClient();

  // make sure we're not using IndexedDB when SSR
  // as it is only supported on browser environments
  const persistence = isBrowser()
    ? indexedDBLocalPersistence
    : inMemoryPersistence;
 
  //const auth = initializeAuth(firebase_app, { persistence });
  auth.setPersistence(persistence);


  return (
    <>
      <Head>
          <title>Tent Shift Schedule</title>
          <link rel="icon" href="/tent.ico" />
          {/* Other head elements */}
      </Head>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={{userID, isLoggedIn, triedToLogIn, setUserID, setIsLoggedIn, setTriedToLogIn}}>
          <GroupContext.Provider value={{groupDescription, setGroupDescription}}>
            <ThemeProvider theme={theme}>
              <Component {...pageProps} />
            </ThemeProvider>
          </GroupContext.Provider>
        </UserContext.Provider>
      </QueryClientProvider>
    </>
  );
}
