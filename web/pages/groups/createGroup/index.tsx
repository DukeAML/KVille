import {KvilleAccordion} from "@/components/utils/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { UserContext } from "@/context/userContext";
import { Container, Typography } from "@mui/material";
import { Component, useContext, useState } from "react";
import { useQuery } from "react-query";
import { KvilleForm } from "@/components/utils/form";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";

import { createGroupValidationSchema, tryToCreateGroup } from "../../../../common/db/createGroup";


import { NO_ERROR_MESSAGE } from "@/components/utils/form";
import { GroupContext } from "@/context/groupContext";
import { GroupDescription } from "../../../../common/db/groupMembership";

interface CreateGroupFormValues {
    groupName : string;
    tentType : string;
}

const initialValues : CreateGroupFormValues = {
    groupName : ' ',
    tentType : 'Blue'
}

export default function CreateGroupPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {userID, isLoggedIn} = useContext(UserContext);
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    const [errorMessage, setErrorMessage] = useState<string>(NO_ERROR_MESSAGE);
    const handleSubmit = (values : CreateGroupFormValues) => {
        tryToCreateGroup(values.groupName, values.tentType, userID).
            then((groupCode) => {
                queryClient.invalidateQueries({queryKey : ['fetchAllGroups']})
                setGroupDescription(new GroupDescription(groupCode, values.groupName, values.tentType));
                router.push("/groups");
            }).
            catch((error) => {
                setErrorMessage(error.message);
            })
    }



    return (
        <BasePageContainerWithNavBarAndTitle title="Group Membership">

                <Container maxWidth="sm">
                    <Typography variant="h5">If someone has already created your team's group, ask them for the group code</Typography>
                    <KvilleForm 
                        validationSchema={createGroupValidationSchema} 
                        initialValues={initialValues}
                        textFields={[{name : "groupName", type : "string"}]}
                        selectFields={[{name : "tentType", options : ["Black", "Blue", "White"]}]}
                        errorMessage={errorMessage}
                        handleSubmit={handleSubmit}
                    />
                    
            

                
                </Container>

        </BasePageContainerWithNavBarAndTitle>
    );
}