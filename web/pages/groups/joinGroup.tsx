import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { UserContext } from "@/lib/context/userContext";
import { Container, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { KvilleForm } from "@/components/shared/utils/form";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import { tryToJoinGroup } from '@/lib/db/groupExistenceAndMembership/joinGroup';
import { tryToJoinGroupThroughAPI } from "@/lib/controllers/groupMembershipAndExistence/joinGroupController";
import { joinGroupValidationSchema } from "@/lib/controllers/groupMembershipAndExistence/joinGroupController";
import { NO_ERROR_MESSAGE } from "@/components/shared/utils/form";
import { GroupContext } from "@/lib/context/groupContext";

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
        tryToJoinGroupThroughAPI(values.groupCode, userID)
            .then((groupDescription) => {   
                queryClient.invalidateQueries({queryKey : ['fetchAllGroups']})
                setGroupDescription(groupDescription);
                router.push("/groups/" + values.groupCode);
            }).catch((error) => {
                setErrorMessage(error.message);
            })
    }


    return (
        <PermissionRequiredPageContainer title="Join a Group" groupSpecificPage={false}>
            <Container maxWidth="sm">
                <Typography variant="h5" style={{marginBottom : 16, marginTop : 16}}>Ask a Group member for the group code to join</Typography>
                <KvilleForm 
                    validationSchema={joinGroupValidationSchema} 
                    initialValues={initialValues}
                    textFields={[{name : "groupCode", type : "string", label: "Group Code"}]}
                    errorMessage={errorMessage}
                    handleSubmit={handleSubmit}
                />
            </Container>
        </PermissionRequiredPageContainer>
    );
}