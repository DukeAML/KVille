import React, { ReactNode } from 'react';
import { UserContext } from "@/lib/shared/context/userContext";
import { useContext } from "react";
import { BasePageContainerWithNavBarAndTitle } from './basePageContainer';
import { BasePageContainerForGroupsPage } from './groupsPageContainer';
import { KvilleLoadingContainer } from '../utils/loading';

interface PermissionRequiredPageContainerProps {
	children: ReactNode;
	title: string;
    groupSpecificPage : boolean
}



export const PermissionRequiredPageContainer: React.FC<PermissionRequiredPageContainerProps> = (props: PermissionRequiredPageContainerProps) => {

    const {userID, isLoggedIn, triedToLogIn} = useContext(UserContext);

	if (props.groupSpecificPage){
        if (isLoggedIn) {
            // need to add code to check if groups match
            return (
                <BasePageContainerForGroupsPage title={props.title}>
                    {props.children}
                </BasePageContainerForGroupsPage>
            )
        }
        else {
            return (
                <BasePageContainerWithNavBarAndTitle title={"You must be logged in to view this page."}>
                </BasePageContainerWithNavBarAndTitle>
            )
        }
    } else {
        if (!triedToLogIn) {
            return (
                <BasePageContainerWithNavBarAndTitle title={"Loading"}>
                    <KvilleLoadingContainer/>
                </BasePageContainerWithNavBarAndTitle>
            )
        }
        else if (triedToLogIn && !isLoggedIn) {
            return (
                <BasePageContainerWithNavBarAndTitle title={"You must be logged in to view this page."}>
                </BasePageContainerWithNavBarAndTitle>
            )
        }
        else {
            return (
                <BasePageContainerWithNavBarAndTitle title={props.title}>
                    {props.children}
                </BasePageContainerWithNavBarAndTitle>
            )
        }
    }
};
