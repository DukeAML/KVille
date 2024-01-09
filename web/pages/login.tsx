// LoginForm.tsx

import React, { useState } from "react";
import { authValidationSchema } from "@/lib/db/auth/register";
import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer";
import { useContext } from "react";
import { UserContext } from "@/lib/context/userContext";
import { useRouter } from "next/router";
import { LOGIN_ERROR_CODES, tryToLogin } from "@/lib/db/auth/login";
import { KvilleForm } from "@/components/shared/utils/form";

interface LoginFormValues {
	username: string;
	password: string;
}

const initialValues: LoginFormValues = {
	username: "",
	password: "",
};

const LoginPage: React.FC = () => {
	const { setIsLoggedIn, setUserID, setTriedToLogIn } = useContext(UserContext);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const router = useRouter();
	const handleSubmit = (values: LoginFormValues) => {
		// Handle login logic here (e.g., API call to authenticate the user)
		tryToLogin(values.username, values.password)
		.then((id) => {
			setUserID(id);
			setIsLoggedIn(true);
			setTriedToLogIn(true);
			router.push("/groups/fromLogin");
		})
		.catch((error) => {
			setErrorMessage(LOGIN_ERROR_CODES.FAILURE);

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
