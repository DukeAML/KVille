import React, { ReactNode, useContext } from 'react';
import { UserContext } from '@/context/userContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
} from '@material-ui/core';


import { LoggedInKvilleNavBar } from './navBars/loggedInNavBar';
import { LoggedOutKvilleNavBar } from './navBars/loggedOutNavBar';

const DEFAULT_TITLE = '';
interface BasePageContainerProps {
    children: ReactNode;
};


const BasePageContainer: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
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
        
            {isLoggedIn ? <LoggedInKvilleNavBar/> : <LoggedOutKvilleNavBar/>}
            <Typography style={{marginBottom : 8, marginTop : 4}} variant="h4" align="center">{props.title}</Typography>
            {props.children}

          
      </BasePageContainer>
  );
}