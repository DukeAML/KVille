import React, { ReactNode, useContext, useEffect} from 'react';
import { UserContext } from '@/lib/shared/context/userContext';
import {
  Container,
  Typography,

} from '@material-ui/core';


import { KvilleLoggedInNavBar } from './navBars/loggedInNavBar';
import { KvilleLoggedOutNavBar } from './navBars/loggedOutNavBar';
import { KvilleGroupsNavBar } from './navBars/groupsNavBar';
import { auth } from '../../../common/src/db/firebase_config';
import { onAuthStateChanged } from 'firebase/auth';




interface BasePageContainerProps {
    children: ReactNode;
};


const BasePageContainer: React.FC<BasePageContainerProps> = (props:BasePageContainerProps) => {
	const {setUserID, setIsLoggedIn} = useContext(UserContext);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (auth.currentUser){
				const id = auth.currentUser.uid;
				setUserID(id);
				setIsLoggedIn(true);
				console.log("I logged them in from the useEffect with " + id);
			}
			
		})

		return () => unsubscribe();
	});
	
	return (
		<Container component="main" maxWidth={false} >
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

interface BasePageContainerForGroupsPageProps {
	children : ReactNode;
	title : string;
}

export const BasePageContainerForGroupsPage: React.FC<BasePageContainerForGroupsPageProps> = (props:BasePageContainerForGroupsPageProps) => {
	return (
		<BasePageContainer>
				
				<KvilleLoggedInNavBar/>
				<KvilleGroupsNavBar/>
				<Typography style={{marginBottom : 24, marginTop : 24}} variant="h4" align="center">{props.title}</Typography>
				{props.children}

			
		</BasePageContainer>
	);
}

