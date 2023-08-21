import {KvilleAccordion} from "@/components/utils/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@material-ui/core";
import { Component, useContext } from "react";
import { useQuery } from "react-query";
import {fetchGroups, GroupDescription} from "../../../common/db/groupMembership";
import { GroupDisplay } from "./groupDisplay";

export default function GroupPage() {
   

    const {userID, isLoggedIn} = useContext(UserContext);
    console.log("rendering groups home page and my userID is " + userID);
    const {data: groups, isLoading, isError} = useQuery<GroupDescription[], Error>(['fetchAllGroups'], () => fetchGroups(userID));
    

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