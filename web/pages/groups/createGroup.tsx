import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { UserContext } from "@/lib/context/userContext";
import { Container, Typography, Link } from "@mui/material";
import { useContext, useState } from "react";
import { KvilleForm } from "@/components/shared/utils/form";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";

import { tryToCreateGroupThroughAPI } from "@/lib/controllers/groupMembershipAndExistence/createGroupController";
import { createGroupValidationSchema } from "@/lib/controllers/groupMembershipAndExistence/createGroupController";
import { NO_ERROR_MESSAGE } from "@/components/shared/utils/form";
import { GroupContext } from "@/lib/context/groupContext";
import { GroupDescription } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { SelectTentType } from "@/components/pageSpecific/groups/createGroup/selectTentType";

interface CreateGroupFormValues {
    groupName : string;
    tentType : string;
}

const initialValues : CreateGroupFormValues = {
    groupName : '',
    tentType : TENTING_COLORS.BLUE
}



export default function CreateGroupPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {userID, isLoggedIn} = useContext(UserContext);
    const [tentType, setTentType] = useState<string>(TENTING_COLORS.BLACK);
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    const [errorMessage, setErrorMessage] = useState<string>(NO_ERROR_MESSAGE);
    const handleSubmit = (values : CreateGroupFormValues) => {
        
        tryToCreateGroupThroughAPI(values.groupName, tentType).
            then((groupCode) => {
                queryClient.invalidateQueries({queryKey : ['fetchAllGroups']})
                setGroupDescription(new GroupDescription(groupCode, values.groupName, tentType, userID));
                router.push("/groups/" + groupCode);
            }).
            catch((error) => {
                setErrorMessage(error.message);
            })
    }

    return (
        <PermissionRequiredPageContainer title="Create a Group" groupSpecificPage={false}>

                <Container maxWidth="sm">
                    <Typography variant="h5" style={{marginBottom : 16, marginTop : 16}}>If someone has already created your group, ask them for the group code and go to the <Link href="/groups/joinGroup">Join Group page</Link>.</Typography>
                    <KvilleForm 
                        validationSchema={createGroupValidationSchema} 
                        initialValues={initialValues}
                        textFields={[{name : "groupName", type : "string", label: "Group Name"}]}
                        extraStuff={<SelectTentType tentType={tentType} setTentType={setTentType}/>}
                        errorMessage={errorMessage}
                        handleSubmit={handleSubmit}
                    />
                    
            

                
                </Container>

        </PermissionRequiredPageContainer>
    );
}