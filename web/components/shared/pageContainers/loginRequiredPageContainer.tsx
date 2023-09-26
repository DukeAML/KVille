import React, { ReactNode } from 'react';

import { BasePageContainerWithNavBarAndTitle } from './basePageContainer';
import { BasePageContainerForGroupsPage } from './groupsPageContainer';

interface LoginRequiredPageContainerProps {
	children: ReactNode;
	title: string;
    groupsPage : boolean
}



export const LoginRequiredPageContainer: React.FC<LoginRequiredPageContainerProps> = (props: LoginRequiredPageContainerProps) => {

	if (props.groupsPage){
        return (
            <BasePageContainerForGroupsPage title={props.title}>
                {props.children}
            </BasePageContainerForGroupsPage>
        )
    } else {
        return (
            <BasePageContainerWithNavBarAndTitle title={props.title}>
                {props.children}
            </BasePageContainerWithNavBarAndTitle>
        )
    }
};
