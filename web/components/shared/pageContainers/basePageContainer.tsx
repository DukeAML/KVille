import React, { ReactNode, useContext, useEffect} from 'react';
import { UserContext } from '@/lib/context/userContext';
import { Container, Typography } from '@mui/material';


import { KvilleLoggedInNavBar } from '../navBars/loggedInNavBar';
import { KvilleLoggedOutNavBar } from '../navBars/loggedOutNavBar';
import Footer from '../utils/footer';
import {useSession} from "next-auth/react";
import { INVALID_USER_ID } from '@/lib/controllers/auth/loginControllers';

interface BasePageContainerProps {
    children: ReactNode;
};


export const BasePageContainer: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
	const {setUserID, setIsLoggedIn, setTriedToLogIn} = useContext(UserContext);

	const {data} = useSession();
	useEffect(() => {
		console.log("user is " );
		console.log(data?.user);
		if (data && data.user && data.user.id !== INVALID_USER_ID){
			setUserID(data.user.id);
			setIsLoggedIn(true);
			setTriedToLogIn(true);
		} else {
			setIsLoggedIn(false);
			setTriedToLogIn(false);
			setUserID(INVALID_USER_ID);
		}
	}, [data]);

	
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
			}}
		>
			<Container
				component="main"
				maxWidth={false}
				style={{
					flex: 1,
					marginBottom: 8,
				}}
			>
				{props.children ? props.children : <></>}
			</Container>
			<Footer />
		</div>
	);
};




interface BasePageContainerWithNavBarAndTitleProps {
	children: ReactNode;
	title: string;
}

export const BasePageContainerWithNavBarAndTitle: React.FC<BasePageContainerWithNavBarAndTitleProps> = (props:BasePageContainerWithNavBarAndTitleProps) => {
	const {isLoggedIn} = useContext(UserContext);
	console.log(isLoggedIn);
	return (
		<BasePageContainer>
			
			{isLoggedIn ? <KvilleLoggedInNavBar/> : <KvilleLoggedOutNavBar/>}
			<Typography style={{marginBottom : 24, marginTop : 24}} variant="h4" align="center">{props.title}</Typography>
			{props.children}
	
		</BasePageContainer>
	);
}


