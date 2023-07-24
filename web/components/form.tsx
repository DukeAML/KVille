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



interface FormInputProps {
    title: String;
    submitText: String
    inputs: ReactNode[];
    handleSubmit:(event:React.FormEvent<HTMLFormElement>)=>void;
}

const KvilleForm: React.FC<FormInputProps> = (props:FormInputProps) => {
  const classes = useStyles();

  return (
    
      <div className={classes.container}>
        <Typography component="h1" variant="h5">
          {props.title}
        </Typography>
        <form className={classes.form} onSubmit={props.handleSubmit}>
          {props.inputs}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {props.submitText}
          </Button>
        </form>
      </div>
  
  );
};

export default KvilleForm;
