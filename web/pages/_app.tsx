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
import { GroupDescription } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { INVALID_USER_ID } from "@/lib/controllers/auth/loginControllers";
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import {SessionProvider} from "next-auth/react";

import Head from 'next/head';

export default function App({ Component, pageProps : {session, ...pageProps} }: AppProps) {
  const [userID, setUserID] = useState(INVALID_USER_ID);
  const [groupDescription, setGroupDescription] = useState<GroupDescription>(new GroupDescription(INVALID_GROUP_CODE, "", "", ""));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [triedToLogIn, setTriedToLogIn] = useState<boolean>(false);
  const queryClient = new QueryClient();


  return (
    <>
      <Head>
          <title>Tent Shift Schedule</title>
          <link rel="icon" href="/tent.ico" />
          {/* Other head elements */}
      </Head>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <UserContext.Provider value={{userID, isLoggedIn, triedToLogIn, setUserID, setIsLoggedIn, setTriedToLogIn}}>
            <GroupContext.Provider value={{groupDescription, setGroupDescription}}>
              <ThemeProvider theme={theme}>
                <Component {...pageProps} />
              </ThemeProvider>
            </GroupContext.Provider>
          </UserContext.Provider>
          <ReactQueryDevtools/>
        </QueryClientProvider>
        
      </SessionProvider>
    </>
  );
}
