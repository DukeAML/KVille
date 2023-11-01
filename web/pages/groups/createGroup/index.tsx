import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { UserContext } from "@/lib/shared/context/userContext";
import { Container, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { KvilleForm } from "@/components/shared/utils/form";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";

import { createGroupValidationSchema, tryToCreateGroup } from "../../../../common/src/db/groupExistenceAndMembership/createGroup";


import { NO_ERROR_MESSAGE } from "@/components/shared/utils/form";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { GroupDescription } from "../../../../common/src/db/groupExistenceAndMembership/groupMembership";
import { TENTING_COLORS } from "../../../../common/data/phaseData";

interface CreateGroupFormValues {
    groupName : string;
    tentType : string;
}

const initialValues : CreateGroupFormValues = {
    groupName : ' ',
    tentType : TENTING_COLORS.BLUE
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
                setGroupDescription(new GroupDescription(groupCode, values.groupName, values.tentType, userID));
                router.push("/groups");
            }).
            catch((error) => {
                setErrorMessage(error.message);
            })
    }



    return (
        <PermissionRequiredPageContainer title="Create a Group" groupSpecificPage={false}>

                <Container maxWidth="sm">
                    <Typography variant="h5">If someone has already created your group, ask them for the group code and go to the join group pae. Also, we need to make this page look better</Typography>
                    <KvilleForm 
                        validationSchema={createGroupValidationSchema} 
                        initialValues={initialValues}
                        textFields={[{name : "groupName", type : "string"}]}
                        selectFields={[{name : "tentType", options : [TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, TENTING_COLORS.WHITE]}]}
                        errorMessage={errorMessage}
                        handleSubmit={handleSubmit}
                    />
                    
            

                
                </Container>

        </PermissionRequiredPageContainer>
    );
}