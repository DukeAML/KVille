import React, { ReactNode, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
} from '@material-ui/core';

import { KvilleNavBar } from './navBar';

const DEFAULT_TITLE = '';
interface BasePageContainerProps {
    children: ReactNode;
};


export const BasePageContainer: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
  return (
    <Container component="main" maxWidth={false} >
      {props.children? props.children : <></>}
    </Container>
  );
};




export const BasePageContainerWithNavBar: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
    return (
        <BasePageContainer>
            <>
                <KvilleNavBar/>
                {props.children}
            </>
        </BasePageContainer>
    );
}

interface BasePageContainerWithNavBarAndTitleProps {
  children: ReactNode;
  title: string;
}

export const BasePageContainerWithNavBarAndTitle: React.FC<BasePageContainerWithNavBarAndTitleProps> = (props:BasePageContainerWithNavBarAndTitleProps) => {
  return (
      <BasePageContainer>
          <>
              <KvilleNavBar/>
              <Typography variant="h4" align="center">{props.title}</Typography>
              {props.children}

          </>
      </BasePageContainer>
  );
}