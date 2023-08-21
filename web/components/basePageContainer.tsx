import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/userContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
} from '@material-ui/core';


import { KvilleLoggedInNavBar } from './navBars/loggedInNavBar';
import { KvilleLoggedOutNavBar } from './navBars/loggedOutNavBar';
import { GroupContext } from '@/context/groupContext';
import { KvilleGroupsNavBar } from './navBars/groupsNavBar';
import { LOGGED_OUT_ID } from '@/pages/_app';


const DEFAULT_TITLE = '';
interface BasePageContainerProps {
    children: ReactNode;
};


const BasePageContainer: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
  const {userID, setUserID, isLoggedIn, setIsLoggedIn} = useContext(UserContext);
  const [numRenders, setNumRenders] = useState(0);




  useEffect(() => {
    const storedID = localStorage.getItem("userID");
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    if (storedIsLoggedIn === "true" && storedID !== userID){
      console.log("setting userID to " + storedID);
      //setUserID(storedID ? storedID : LOGGED_OUT_ID );
      //setIsLoggedIn(true);
    } else {
      //setUserID(LOGGED_OUT_ID);
      //setIsLoggedIn(false);
    }
    
  }, [])
  return (
    <Container component="main" maxWidth={false} >
      {props.children? props.children : <></>}
    </Container>
  );
};




interface BasePageContainerWithNavBarAndTitleProps {
  children: ReactNode;
  title: string;
}

export const BasePageContainerWithNavBarAndTitle: React.FC<BasePageContainerWithNavBarAndTitleProps> = (props:BasePageContainerWithNavBarAndTitleProps) => {
  const {isLoggedIn} = useContext(UserContext);
  return (
      <BasePageContainer>
        
          {isLoggedIn ? <KvilleLoggedInNavBar/> : <KvilleLoggedOutNavBar/>}
          <Typography style={{marginBottom : 12, marginTop : 6}} variant="h4" align="center">{props.title}</Typography>
          {props.children}
  
      </BasePageContainer>
  );
}

interface BasePageContainerForGroupsPageProps {
  children : ReactNode;
  title : string;
}

export const BasePageContainerForGroupsPage: React.FC<BasePageContainerForGroupsPageProps> = (props:BasePageContainerForGroupsPageProps) => {
  const {isLoggedIn} = useContext(UserContext);
  const {groupDescription} = useContext(GroupContext);
  return (
      <BasePageContainer>
            
            <KvilleLoggedInNavBar/>
            <KvilleGroupsNavBar/>
            <Typography style={{marginBottom : 8, marginTop : 4}} variant="h4" align="center">{props.title}</Typography>
            {props.children}

          
      </BasePageContainer>
  );
}

