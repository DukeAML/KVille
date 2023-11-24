import { useQuery, useQueryClient, UseQueryResult, useMutationResult, useMutation} from "react-query";
import { fetchHoursPerPerson } from "../../../common/src/db/hours";
import { removeMemberFromGroupByUsername } from "../../../common/src/db/groupExistenceAndMembership/removeMemberFromGroup";

interface HoursPerPersonInterface {
    dayHoursPerPerson : {
        [key : string] : number
    };
    nightHoursPerPerson : {
        [key : string] : number
    }
}
export const useQueryToFetchHoursTableData = (groupCode : string) : UseQueryResult<HoursPerPersonInterface> => {
    return useQuery(getQueryNameForFetchHoursTableData(groupCode), () => fetchHoursPerPerson(groupCode));
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