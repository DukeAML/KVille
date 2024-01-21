// RegisterForm.tsx

import React, {useState} from 'react';
import { registerThroughAPI } from "@/lib/controllers/auth/registerController";
import { authValidationSchema } from '@/lib/controllers/auth/registerController';
import { BasePageContainerWithNavBarAndTitle } from '@/components/shared/pageContainers/basePageContainer';
import { useContext } from 'react';
import { UserContext } from '@/lib/context/userContext';
import {useRouter} from 'next/router';
import { KvilleForm } from '@/components/shared/utils/form';
import {signIn} from "next-auth/react";
import { Stack, Typography } from '@mui/material';
import { KvilleLoadingCircle } from '@/components/shared/utils/loading';
import { SignalCellularNullRounded } from '@mui/icons-material';

interface RegisterFormValues {
	username : string;
	password: string;
}

const initialValues: RegisterFormValues = {
	username : '',
	password: '',
};


const delay10S = () => {
	return new Promise((resolve, reject) => {
	  // Simulate an asynchronous operation
	  setTimeout(() => {
		// Resolve the promise after 10 seconds
		resolve('Operation completed');
	  }, 2000);
	});
  };

const RegisterForm: React.FC = () => {

	const {setIsLoggedIn, setUserID, userID, setTriedToLogIn}= useContext(UserContext);
	const [loggingIn, setLoggingIn] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState("");
	const router = useRouter();
	const handleSubmit = (values: RegisterFormValues) => {
		// Handle login logic here (e.g., API call to authenticate the user)
		registerThroughAPI(values.username, values.password)
		.then(async (id) => {
			setLoggingIn(true);
			delay10S().then(async () => {
				await signIn("credentials", {username : values.username, password : values.password, redirect : false})
				setIsLoggedIn(true);
				setTriedToLogIn(true);
				setUserID(id);
				setLoggingIn(false);
				router.push("/groups");
				
			})
		})
		.catch((error) => {
			setErrorMessage(error.message);
			setLoggingIn(false);
		})
		setLoggingIn(false);
	};


	return (
		<BasePageContainerWithNavBarAndTitle title="Register" >
			<KvilleForm 
				handleSubmit={handleSubmit} 
				initialValues={initialValues} 
				validationSchema={authValidationSchema} 
				textFields={[{name : "username", type : "username", label: "Username"}, {name : "password", type : "password", label: "Password"}]}
				errorMessage={errorMessage}/>

				{loggingIn ? 
					<Stack direction="column" gap={1}>
						<Typography align="center">Logging you in</Typography>
						<KvilleLoadingCircle/>
					</Stack>
				: null}
			
		</BasePageContainerWithNavBarAndTitle>
	);
};

export default RegisterForm;
