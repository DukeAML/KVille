// RegisterForm.tsx

import React, {useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginValidationSchema } from '../../../common/src/db/auth/login';
import { TextField, Typography } from '@mui/material';
import {Button} from '@material-ui/core';
import { BasePageContainerWithNavBarAndTitle } from '@/components/shared/basePageContainer';
import { Container } from '@material-ui/core';
import { KvilleButton } from '@/components/shared/utils/button';
import { useContext } from 'react';
import { UserContext } from '@/lib/shared/context/userContext';
import {useRouter} from 'next/router';
import { tryToRegister } from '../../../common/src/db/auth/register';
import { KvilleForm } from '@/components/shared/utils/form';
import { auth } from '../../../common/src/db/firebase_config';

interface RegisterFormValues {
  email: string;
  username : string;
  password: string;
}

const initialValues: RegisterFormValues = {
  email: '',
  username : '',
  password: '',
};




const RegisterForm: React.FC = () => {

  const {setIsLoggedIn, setUserID, userID}= useContext(UserContext);
  console.log("user context : user id is " + userID);
  console.log("auth current id is " + auth.currentUser);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const handleSubmit = (values: RegisterFormValues) => {
    // Handle login logic here (e.g., API call to authenticate the user)
    tryToRegister(values.email, values.username, values.password)
      .then((id) => {
        setIsLoggedIn(true);
        router.push("/groups");
        setUserID(id);
      })
      .catch((error) => {
        setErrorMessage(error.message);
      })
  };


  return (
    <BasePageContainerWithNavBarAndTitle title="Register" >
        <KvilleForm 
            handleSubmit={handleSubmit} 
            initialValues={initialValues} 
            validationSchema={loginValidationSchema} 
            textFields={[{name : "email", type : "email"}, {name : "username", type : "username" }, {name : "password", type : "password"}]}
            errorMessage={errorMessage}/>

        
    </BasePageContainerWithNavBarAndTitle>
  );
};

export default RegisterForm;
