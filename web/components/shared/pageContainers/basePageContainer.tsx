import React, { ReactNode, useContext, useEffect} from 'react';
import { UserContext } from '@/lib/shared/context/userContext';
import {
  Container,
  Typography,

} from '@material-ui/core';


import { KvilleLoggedInNavBar } from '../navBars/loggedInNavBar';
import { KvilleLoggedOutNavBar } from '../navBars/loggedOutNavBar';
import { auth } from '../../../../common/src/db/firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { INVALID_USER_ID } from '../../../../common/src/db/auth/login';




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
		<Container component="main" maxWidth={false} style={{marginBottom : 8}} >
			{props.children? props.children : <></>}
		</Container>
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


