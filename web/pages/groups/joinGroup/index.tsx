import {KvilleAccordion} from "@/components/utils/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@mui/material";
import { Component, useContext, useState } from "react";
import { useQuery } from "react-query";
import { KvilleForm } from "@/components/utils/form";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";

import { joinGroupValidationSchema, tryToJoinGroup } from '../../../../common/db/joinGroup';
import { join } from "path";

import { NO_ERROR_MESSAGE } from "@/components/utils/form";
import { GroupContext } from "@/context/groupContext";

interface JoinGroupFormValues {
    groupCode : string;
}

const initialValues : JoinGroupFormValues = {
    groupCode : ''
}

export default function JoinGroupPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {userID, isLoggedIn} = useContext(UserContext);
    const {groupDescription, setGroupDescription} = useContext(GroupContext)
    const [errorMessage, setErrorMessage] = useState<string>(NO_ERROR_MESSAGE);
    const handleSubmit = (values : JoinGroupFormValues) => {
        console.log("handling submit");
        tryToJoinGroup(values.groupCode, userID)
            .then((groupDescription) => {
                console.log("success");
                
                queryClient.invalidateQueries({queryKey : ['fetchAllGroups']})
                setGroupDescription(groupDescription);
                router.push("/groups");
            }).catch((error) => {
                console.log(error.message);
                setErrorMessage(error.message);
            })
    }



    return (
        <BasePageContainerWithNavBarAndTitle title="Group Membership">

                <Container maxWidth="sm">
                    <Typography variant="h5">If someone has already created your team's group, ask them for the group code</Typography>
                    <KvilleForm 
                        validationSchema={joinGroupValidationSchema} 
                        initialValues={initialValues}
                        textFields={[{name : "groupCode", type : "string"}]}
                        errorMessage={errorMessage}
                        handleSubmit={handleSubmit}
                    />
                    
            

                
                </Container>

        </BasePageContainerWithNavBarAndTitle>
    );
}