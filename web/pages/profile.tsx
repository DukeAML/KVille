import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer";
import { ErrorMessage } from "@/components/shared/utils/errorMessage";
import { KvilleLoadingCircle } from "@/components/shared/utils/loading";
import { getErrorMessage } from "@/lib/db/errorHandling";
import { NO_SUCCESS_MSG, useMutationToUpdateUsername } from "@/lib/hooks/updateUsernameHooks";
import { Container, Stack, TextField, Typography, Button } from "@mui/material";
import React, {useState} from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage(){
    const [newUsername, setNewUsername] = useState<string>("");
    const {data} = useSession();

    const {mutate : updateUsername, isLoading, isError, error, successMsg} = useMutationToUpdateUsername();
    return (
        <BasePageContainerWithNavBarAndTitle title="Profile">
            <Container maxWidth="sm">
                <Stack direction="column" gap={1}>
                    <Typography variant="h6">Change your name - this is how your group members will see your name</Typography>
                    {data && data.user && data.user.name ?
                    <Typography>You will still need your original username, {data.user?.email}, to login</Typography>
                    :
                    null
                    }
                    <TextField label="New Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}>
                    </TextField>
                    <Button variant="contained" color="primary" disabled={newUsername.length < 1 || newUsername.length > 20} onClick={() => updateUsername({newUsername})}>Submit</Button>
                    {isLoading ? <KvilleLoadingCircle/> : null}
                    {isError ? <ErrorMessage msg={getErrorMessage(error)}/> : null}
                    {successMsg !== NO_SUCCESS_MSG ? <Typography color="green">{successMsg}</Typography>  : null}
                </Stack>
            </Container>
        </BasePageContainerWithNavBarAndTitle>
    )
}