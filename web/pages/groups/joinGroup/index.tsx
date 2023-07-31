import {KvilleAccordion} from "@/components/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@mui/material";
import { Component, useContext, useState } from "react";
import { useQuery } from "react-query";
import { KvilleForm } from "@/components/form";

import { joinGroupValidationSchema } from '../../../../common/db/joinGroup';
import { join } from "path";

import { NO_ERROR_MESSAGE } from "@/components/form";

interface JoinGroupFormValues {
    groupCode : string;
}

const initialValues : JoinGroupFormValues = {
    groupCode : 'hello'
}

export default function CreateGroupPage() {

    const {userID, groupCode, setGroupCode, isLoggedIn} = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState<string>(NO_ERROR_MESSAGE)
    console.log("my user id is " + userID);



    return (
        <BasePageContainerWithNavBarAndTitle title="Group Membership">

                <Container maxWidth="sm">
                    <Typography variant="h5">If someone has already created your team's group, ask them for the group code</Typography>
                    <KvilleForm 
                        validationSchema={joinGroupValidationSchema} 
                        initialValues={initialValues}
                        handleSubmit={(values : JoinGroupFormValues) => {console.log(values)}}
                        textFields={[{name : "groupCode", type : "string"}]}
                        errorMessage={errorMessage}
                    />
            

                
                </Container>

        </BasePageContainerWithNavBarAndTitle>
    );
}