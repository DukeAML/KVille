// LoginForm.tsx

import React, {useState} from 'react';
import { loginValidationSchema } from '../../../common/src/db/auth/login';
import { BasePageContainerWithNavBarAndTitle } from '@/components/shared/basePageContainer';
import { useContext } from 'react';
import { UserContext } from '@/lib/shared/context/userContext';
import {useRouter} from 'next/router';
import { tryToLogin } from '../../../common/src/db/auth/login';
import { KvilleForm } from '@/components/shared/utils/form';

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
		tryToLogin(values.email, values.password)
		.then((id) => {
			localStorage.setItem("userID", id);
			localStorage.setItem("isLoggedIn", "true");
			setUserID(id);
			setIsLoggedIn(true);
			router.push("/groups/");
		})
		.catch((error) => {
			setErrorMessage(error.message);
		})
	};

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
