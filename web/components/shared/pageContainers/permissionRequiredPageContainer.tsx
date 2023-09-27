import React, { ReactNode } from 'react';

import { BasePageContainerWithNavBarAndTitle } from './basePageContainer';
import { BasePageContainerForGroupsPage } from './groupsPageContainer';

interface PermissionRequiredPageContainerProps {
	children: ReactNode;
	title: string;
    groupSpecificPage : boolean
}



export const PermissionRequiredPageContainer: React.FC<PermissionRequiredPageContainerProps> = (props: PermissionRequiredPageContainerProps) => {

	if (props.groupSpecificPage){
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
