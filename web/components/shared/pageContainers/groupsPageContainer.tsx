import React, { ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import { KvilleLoggedInNavBar } from '../navBars/loggedInNavBar';
import { KvilleGroupsNavBar } from '../navBars/groupsNavBar';
import { BasePageContainer } from './basePageContainer';

interface BasePageContainerForGroupsPageProps {
	children: ReactNode;
	title: string;
}

export const BasePageContainerForGroupsPage: React.FC<BasePageContainerForGroupsPageProps> = (props: BasePageContainerForGroupsPageProps) => {
	return (
		<BasePageContainer>

			<KvilleLoggedInNavBar />
			<KvilleGroupsNavBar />
			<Typography style={{ marginBottom: 24, marginTop: 24 }} variant="h4" align="center">{props.title}</Typography>
			{props.children}


		</BasePageContainer>
	);
};
