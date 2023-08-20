// LoginForm.tsx

import React, {useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginValidationSchema } from '../../../common/db/login';
import { TextField, Typography } from '@mui/material';
import {Button} from '@material-ui/core';
import { BasePageContainerWithNavBarAndTitle } from '@/components/basePageContainer';
import { Container } from '@material-ui/core';
import { KvilleButton } from '@/components/utils/button';
import { useContext } from 'react';
import { UserContext } from '@/context/userContext';
import {useRouter} from 'next/router';
import { tryToLogin } from '../../../common/db/login';
import { KvilleForm } from '@/components/utils/form';

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};




const LoginPage: React.FC = () => {

  const {setIsLoggedIn, setUserID}= useContext(UserContext)
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const handleSubmit = (values: LoginFormValues) => {
    // Handle login logic here (e.g., API call to authenticate the user)
    tryToLogin(values.email, values.password, onSuccessfulLogin, onFailedLogin)
  };

  const onSuccessfulLogin = (id: string) => {
   
    localStorage.setItem("userID", id);
    localStorage.setItem("isLoggedIn", "true");
    setUserID(id);
    setIsLoggedIn(true);
    router.push("/groups/");
  }

  const onFailedLogin = (message : string ) => {
    console.log("in the error handler");
    setErrorMessage(message);
  }

  return (
    <BasePageContainerWithNavBarAndTitle title='Login'>
        <KvilleForm 
            handleSubmit={handleSubmit} 
            initialValues={initialValues} 
            validationSchema={loginValidationSchema} 
            textFields={[{name : "email", type : "email"}, {name : "password", type : "password"}]}
            errorMessage={errorMessage}
            />

        
    </BasePageContainerWithNavBarAndTitle>
  );
};

export default LoginPage;
