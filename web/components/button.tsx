import React, { useState, ReactNode, ComponentType } from 'react';

import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
  Input,
} from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));



interface ButtonInputInterface {
    onClick: ()=>void;
    children: ReactNode;
}

export const KvilleButton: React.FC<ButtonInputInterface> = (props:ButtonInputInterface) => {
  const classes = useStyles();

  return (

    

    <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={props.onClick}
    >
        {props.children? props.children : <></>}
    </Button>
  );
};


