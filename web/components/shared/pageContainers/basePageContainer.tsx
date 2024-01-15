import React, { ReactNode, useContext, useEffect} from 'react';
import { UserContext } from '@/lib/context/userContext';
import { Container, Typography } from '@mui/material';


import { KvilleLoggedInNavBar } from '../navBars/loggedInNavBar';
import { KvilleLoggedOutNavBar } from '../navBars/loggedOutNavBar';
import { auth } from '@/lib/db/firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { INVALID_USER_ID } from '@/lib/db/auth/login';
import Footer from '../utils/footer';

interface BasePageContainerProps {
    children: ReactNode;
};


export const BasePageContainer: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
	const {setUserID, setIsLoggedIn, setTriedToLogIn} = useContext(UserContext);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (auth.currentUser){
				const id = auth.currentUser.uid;
				setUserID(id);
				setIsLoggedIn(true);
			} else {
				setUserID(INVALID_USER_ID);
				setIsLoggedIn(false);
			}
			setTriedToLogIn(true);
			
		})

		return () => unsubscribe();
	});
	
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
	return (
		<BasePageContainer>
			
			{isLoggedIn ? <KvilleLoggedInNavBar/> : <KvilleLoggedOutNavBar/>}
			<Typography style={{marginBottom : 24, marginTop : 24}} variant="h4" align="center">{props.title}</Typography>
			{props.children}
	
		</BasePageContainer>
	);
}


