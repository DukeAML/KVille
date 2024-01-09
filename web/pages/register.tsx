// RegisterForm.tsx

import React, {useState} from 'react';
import { authValidationSchema } from '@/lib/db/auth/register';
import { BasePageContainerWithNavBarAndTitle } from '@/components/shared/pageContainers/basePageContainer';
import { useContext } from 'react';
import { UserContext } from '@/lib/context/userContext';
import {useRouter} from 'next/router';
import { tryToRegister } from '@/lib/db/auth/register';
import { KvilleForm } from '@/components/shared/utils/form';

interface RegisterFormValues {
	username : string;
	password: string;
}

const initialValues: RegisterFormValues = {
	username : '',
	password: '',
};




const RegisterForm: React.FC = () => {

	const {setIsLoggedIn, setUserID, userID}= useContext(UserContext);
	const [errorMessage, setErrorMessage] = useState("");
	const router = useRouter();
	const handleSubmit = (values: RegisterFormValues) => {
		// Handle login logic here (e.g., API call to authenticate the user)
		tryToRegister(values.username, values.password)
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
				validationSchema={authValidationSchema} 
				textFields={[{name : "username", type : "username", label: "Username"}, {name : "password", type : "password", label: "Password"}]}
				errorMessage={errorMessage}/>

			
		</BasePageContainerWithNavBarAndTitle>
	);
};

export default RegisterForm;
