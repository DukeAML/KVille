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

interface RegisterFormValues {
	username : string;
	password: string;
}

const initialValues: RegisterFormValues = {
	username : '',
	password: '',
};




const RegisterForm: React.FC = () => {

	const {setIsLoggedIn, setUserID, userID, setTriedToLogIn}= useContext(UserContext);
	const [errorMessage, setErrorMessage] = useState("");
	const router = useRouter();
	const handleSubmit = (values: RegisterFormValues) => {
		// Handle login logic here (e.g., API call to authenticate the user)
		registerThroughAPI(values.username, values.password)
		.then(async (id) => {
			await signIn("credentials", {username : values.username, password : values.password, redirect : false})
			setIsLoggedIn(true);
			setTriedToLogIn(true);
			setUserID(id);
			router.push("/groups");
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
				validationSchema={authValidationSchema} 
				textFields={[{name : "username", type : "username", label: "Username"}, {name : "password", type : "password", label: "Password"}]}
				errorMessage={errorMessage}/>

			
		</BasePageContainerWithNavBarAndTitle>
	);
};

export default RegisterForm;
