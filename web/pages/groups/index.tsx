import {KvilleAccordion} from "@/components/accordion";
import { BasePageContainerWithNavBar, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@material-ui/core";
import { Component, useContext } from "react";
import { useQuery } from "react-query";
import {fetchGroups, GroupDescription} from "../../../common/db/groupMembership";
import { ClientSideRenderedComponent } from "@/components/clientSideRenderedComponent";
import { GroupDisplay } from "./groupDisplay";


export default function GroupPage() {

    const {userID, groupCode, setGroupCode, isLoggedIn} = useContext(UserContext);
    const {data: groups, isLoading, isError} = useQuery<GroupDescription[], Error>('groups', fetchGroups);
    

    return (
        <BasePageContainerWithNavBarAndTitle title="Group Membership">

                <Container maxWidth="sm">
                    
                    <Typography variant="h6" align="center" >Select your Group or Join/Create one to Continue</Typography>
                    
               
                    <Typography align="center">My Group</Typography>
                    {groups?.map((group, index) => {
                        return (
                            <GroupDisplay group={group} key={index}/>
                        );
                    })}

                
                </Container>

        </BasePageContainerWithNavBarAndTitle>
    );
}