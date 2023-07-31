import {KvilleAccordion} from "@/components/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@material-ui/core";
import { Component, useContext } from "react";
import { useQuery } from "react-query";





export default function CreateGroupPage() {

    const {userID, groupCode, setGroupCode, isLoggedIn} = useContext(UserContext);


    return (
        <BasePageContainerWithNavBarAndTitle title="Group Membership">

                <Container maxWidth="sm">
                    
                    <Typography variant="h6" align="center" >Select your Group or Join/Create one to Continue</Typography>
                    
            

                
                </Container>

        </BasePageContainerWithNavBarAndTitle>
    );
}