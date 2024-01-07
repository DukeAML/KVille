import React, { ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import { KvilleLoggedInNavBar } from '../navBars/loggedInNavBar';
import { KvilleGroupsNavBar } from '../navBars/groupsNavBar';
import { BasePageContainer } from './basePageContainer';
import { useQueryToFetchGroupData } from '@/lib/hooks/fetchGroupData';
import { useGroupCode } from '@/lib/hooks/useGroupCode';

interface BasePageContainerForGroupsPageProps {
	children: ReactNode;
	title: string;
}

export const BasePageContainerForGroupsPage: React.FC<BasePageContainerForGroupsPageProps> = (props: BasePageContainerForGroupsPageProps) => {
	const groupCode = useGroupCode();
	const {data, isLoading} = useQueryToFetchGroupData(groupCode); // this line just forces the site to load the group's data if it doesn't have it cached already
	return (
		<BasePageContainer>

			<KvilleLoggedInNavBar />
			<KvilleGroupsNavBar />
			<Typography style={{ marginBottom: 24, marginTop: 24 }} variant="h4" align="center">{props.title}</Typography>
			{props.children}


		</BasePageContainer>
	);
};
