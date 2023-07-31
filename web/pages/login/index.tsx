// LoginForm.tsx

import React, {useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginValidationSchema } from '../../../common/db/login';
import { TextField, Typography } from '@mui/material';
import {Button} from '@material-ui/core';
import { BasePageContainerWithNavBarAndTitle } from '@/components/basePageContainer';
import { Container } from '@material-ui/core';
import { KvilleButton } from '@/components/button';
import { useContext } from 'react';
import { UserContext } from '@/context/userContext';
import {useRouter} from 'next/router';
import { tryToLogin } from '../../../common/db/login';
import { KvilleForm } from '@/components/form';

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};




const LoginForm: React.FC = () => {

  const {setIsLoggedIn, setUserID}= useContext(UserContext)
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const handleSubmit = (values: LoginFormValues) => {
    // Handle login logic here (e.g., API call to authenticate the user)
    tryToLogin(values.email, values.password, onSuccessfulLogin, (message : string) => {setErrorMessage(message)});
  };

  const onSuccessfulLogin = (id: string) => {
    setIsLoggedIn(true);
    router.push("/groups");
    setUserID(id);
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

export default LoginForm;
