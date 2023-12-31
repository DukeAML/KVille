import { useQueryClient, useMutation} from "react-query";
import { removeMemberFromGroupByUsername } from "../../../common/src/db/groupExistenceAndMembership/removeMemberFromGroup";

interface HoursPerPersonInterface {
    dayHoursPerPerson : {
        [key : string] : number
    };
    nightHoursPerPerson : {
        [key : string] : number
    }
}


const removeMemberMutationFn = async (groupCode : string, usernameOfMemberToRemove : string) => {
    await removeMemberFromGroupByUsername(groupCode, usernameOfMemberToRemove);
    return groupCode;

}
export const useMutationToRemoveMember = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn : (groupCodeAndUsername : {groupCode : string, usernameOfMemberToRemove : string}) => 
                removeMemberMutationFn(groupCodeAndUsername.usernameOfMemberToRemove, groupCodeAndUsername.groupCode),   
            onSuccess : (groupCode) => {
                queryClient.invalidateQueries(getQueryNameForFetchHoursTableData(groupCode));
            }

        }
        
    )
}

const getQueryNameForFetchHoursTableData = (groupCode : string) : string => {
    return 'fetchingHours' + groupCode;
}