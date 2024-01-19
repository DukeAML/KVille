// LoginForm.tsx

import React, { useState } from "react";
import { authValidationSchema } from '@/lib/controllers/auth/registerController';
import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer";
import { useRouter } from "next/router";
import { KvilleForm } from "@/components/shared/utils/form";
import { signIn } from "next-auth/react"; 

interface LoginFormValues {
	username: string;
	password: string;
}

const initialValues: LoginFormValues = {
	username: "",
	password: "",
};

const LoginPage: React.FC = () => {
	const [errorMessage, setErrorMessage] = useState<string>("");
	const router = useRouter();
	const handleSubmit = (values: LoginFormValues) => {
		// Handle login logic here (e.g., API call to authenticate the user)
		signIn("credentials", {username : values.username, password : values.password, redirect : false}).then((d) => {
			console.log(d);
			if (!d || (d && d.status > 300) ){
				setErrorMessage("Wrong username/password");
			} else {
				router.push("/groups/fromLogin");
			}

		}).catch((reason) => {
			
		});
	};

	return (
		<BasePageContainerWithNavBarAndTitle title="Login">
		<KvilleForm
			handleSubmit={handleSubmit}
			initialValues={initialValues}
			validationSchema={authValidationSchema}
			textFields={[
				{ name: "username", type: "username", label: "Username" },
				{ name: "password", type: "password", label: "Password" },
			]}
			errorMessage={errorMessage}
		/>
		</BasePageContainerWithNavBarAndTitle>
	);
};

export default LoginPage;
