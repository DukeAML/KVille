import { useQueryClient, useMutation} from "react-query";
import { useState } from "react";
import { removeMemberFromGroupByUsername, REMOVE_USER_ERRORS } from "../../../../common/src/db/groupExistenceAndMembership/removeMemberFromGroup";
import { getQueryKeyNameForScheduleFetch, useQueryToFetchSchedule } from "../schedule/scheduleHooks";

interface HoursPerPersonInterface {
    dayHoursPerPerson : {
        [key : string] : number
    };
    nightHoursPerPerson : {
        [key : string] : number
    }
}


const removeMemberMutationFn = async (usernameOfMemberToRemove : string, groupCode : string) => {
    await removeMemberFromGroupByUsername(usernameOfMemberToRemove, groupCode);
    return groupCode;
}

interface GroupCodeAndUsername{
    groupCode : string;
    usernameOfMemberToRemove : string;
}
interface UseMutationToRemoveMemberType {
    confirmationOpened : boolean;
    setConfirmationOpened : (b : boolean) => void; 
    mutate : (groupCodeAndUsername : GroupCodeAndUsername) => void;
    isLoading : boolean;
    isError : boolean;
    removed : boolean;
}
export const useMutationToRemoveMember = () : UseMutationToRemoveMemberType => {
    const queryClient = useQueryClient();
    const [confirmationOpened, setConfirmationOpened] = useState<boolean>(false);
    const [removed, setRemoved] = useState<boolean>(false);
    const {mutate, isLoading, isError} = useMutation(
        {
            mutationFn : (groupCodeAndUsername : GroupCodeAndUsername) => 
                removeMemberMutationFn(groupCodeAndUsername.usernameOfMemberToRemove, groupCodeAndUsername.groupCode),   
            onSuccess : (groupCode) => {
                queryClient.invalidateQueries(getQueryKeyNameForScheduleFetch(groupCode));
                setConfirmationOpened(false);
                setRemoved(true);
            }

        }
        
    )
    return {confirmationOpened, setConfirmationOpened, mutate, isLoading, isError, removed};
}

