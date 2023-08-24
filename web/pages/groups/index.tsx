import {KvilleAccordion} from "@/components/utils/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@material-ui/core";
import { Component, useContext } from "react";
import { useQuery } from "react-query";
import {fetchGroups, GroupDescription} from "../../../common/src/db/groupExistenceAndMembership/groupMembership";
import { GroupDisplay } from "./groupDisplay";
import { KvilleLoadingCircle, KvilleLoadingContainer } from "@/components/utils/loading";

export default function GroupPage() {
   

    const {userID, isLoggedIn} = useContext(UserContext);
    console.log("rendering groups home page and my userID is " + userID);
    const {data: groups, isLoading, isError} = useQuery<GroupDescription[], Error>(['fetchAllGroups'+userID], () => fetchGroups(userID));
    

    let body = null;
    if (isLoading){
        body = <KvilleLoadingContainer/>
    } else {
        body = (
            <Container maxWidth="sm">       
                <Typography variant="h6" align="center" >Select your Group or Join/Create one to Continue</Typography> 
                <Typography align="center">My Group</Typography>
                {groups?.map((group, index) => {
                    return (
                        <GroupDisplay group={group} key={index}/>
                    );
                })}   
            </Container>
        )
    }
    return (
        <BasePageContainerWithNavBarAndTitle title="Group Membership">
                {body}
        </BasePageContainerWithNavBarAndTitle>
    );
}