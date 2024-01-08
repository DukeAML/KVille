import React, {useContext} from "react";
import { useMutationToRemoveMember } from "@/lib/hooks/groupOverviewHooks";
import { Typography} from "@mui/material";
import {Button} from "@material-ui/core";
import { useGroupCode } from "@/lib/hooks/useGroupCode";
import { KvilleLoadingCircle } from "@/components/shared/utils/loading";

interface RemoveMemberPromptProps{
    memberUsername : string;
}
export const RemoveMemberPrompt : React.FC<RemoveMemberPromptProps> = (props : RemoveMemberPromptProps) => {
    const groupCode = useGroupCode();

    const {mutate : removeMember, isLoading, isError, confirmationOpened, setConfirmationOpened, removed} = useMutationToRemoveMember();

    const handleConfirmationClick = () => {
        removeMember({groupCode, usernameOfMemberToRemove : props.memberUsername});
    }

    if (confirmationOpened){
        return (
            <>
                <Typography >Are you sure you want to remove {props.memberUsername}?</Typography>
                <Button variant="outlined" color="primary" style={{marginBottom : 4, marginTop : 4, marginRight : 4}} onClick={handleConfirmationClick}>Yes</Button>
                <Button variant="contained" color="primary" onClick={() => setConfirmationOpened(false)}>No</Button>
                {isLoading ? <KvilleLoadingCircle/> : null}
                {isError ? <Typography>An error occurred</Typography> : null}
            </>
        );
    } else if (removed){
        return <Typography>Removed</Typography>
    }
    else {
        return (
            <Button style={{backgroundColor : "#ff5555", marginTop : 0, paddingTop : 0, marginBottom : 0, paddingBottom : 0}} variant="contained" onClick={() => setConfirmationOpened(true)}>
                Remove
            </Button>
        );
    }

}