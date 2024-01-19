import React, { ReactNode } from 'react';
import { UserContext } from "@/lib/context/userContext";
import { useContext } from "react";
import { useQuery } from "react-query";
import { BasePageContainerWithNavBarAndTitle } from './basePageContainer';
import { BasePageContainerForGroupsPage } from './groupsPageContainer';
import { KvilleLoadingContainer } from '../utils/loading';
import { getGroupMembersByGroupCodeThroughAPI } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { useGroupCode } from '@/lib/hooks/useGroupCode';

interface PermissionRequiredPageContainerProps {
	children: ReactNode;
	title: string;
    groupSpecificPage : boolean
}



export const PermissionRequiredPageContainer: React.FC<PermissionRequiredPageContainerProps> = (props: PermissionRequiredPageContainerProps) => {

    const {userID, isLoggedIn, triedToLogIn} = useContext(UserContext);
    let groupCode = useGroupCode();
    const {data: members, isLoading, isError} = useQuery('fetchGroupMembers' + groupCode, () => getGroupMembersByGroupCodeThroughAPI(groupCode));


    if (!isLoggedIn) {
        return (
            <BasePageContainerWithNavBarAndTitle title={"You must be logged in to view this page."}>
            </BasePageContainerWithNavBarAndTitle>
        )
    }

	if (props.groupSpecificPage) {
        let userInGroup = false;

        if (isLoading) {
            return (
                <BasePageContainerWithNavBarAndTitle title={"Loading"}>
                    <KvilleLoadingContainer/>
                </BasePageContainerWithNavBarAndTitle>
            )
        }

        if (isError) {
            return (
                <BasePageContainerWithNavBarAndTitle title={"Something went wrong with the page you tried to access."}>
                </BasePageContainerWithNavBarAndTitle>
            )
        }

        if (members && !isLoading) {
            members.forEach(member => {
                if (member.userID === userID) {
                    userInGroup = true;
                }
            });
            if (userInGroup) {
                return (
                    <BasePageContainerForGroupsPage title={props.title}>
                        {props.children}
                    </BasePageContainerForGroupsPage>
                )
            }
            else {
                return (
                <BasePageContainerWithNavBarAndTitle title={"You cannot access another group's page."}>
                </BasePageContainerWithNavBarAndTitle>
                )
            }
        }
    } else {
        return (
            <BasePageContainerWithNavBarAndTitle title={props.title}>
                {props.children}
            </BasePageContainerWithNavBarAndTitle>
        )
    }
};
