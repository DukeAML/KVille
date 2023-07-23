import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
} from '@material-ui/core';


import {tryToLogin} from "../../../common/db/login";
import {useRouter} from 'next/router';
import KvilleForm from "../../components/form";
import { auth } from '@/../common/db/firebase_config';
import {BasePageContainer} from '@/components/basePageContainer';
import { UserContext } from '@/context/userContext';


const LoginPage: React.FC = () => {
  const {setIsLoggedIn, setUserID}= useContext(UserContext)
  console.log(auth.currentUser?.email);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onSuccessfulLogin = (id: string) => {
    setIsLoggedIn(true);
    router.push("/groups");
    setUserID(id);
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("trying to log in");
    tryToLogin(email, password, onSuccessfulLogin);
  };

  const formInputs = [
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="email"
      label="Email Address"
      name="email"
      autoComplete="email"
      value={email}
      onChange={handleEmailChange}
      key={"loginTextField1"}
    />, 
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type="password"
      id="password"
      autoComplete="current-password"
      value={password}
      onChange={handlePasswordChange}
      key={"loginTextField2"}
    />
  ];

  return (
    <BasePageContainer>
      <Container maxWidth="sm">
        <KvilleForm title="Login" submitText={"Sign in"} inputs={formInputs} handleSubmit={handleSubmit}></KvilleForm>
      </Container>
    </BasePageContainer>
  );
};

export default LoginPage;
