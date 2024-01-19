import { useQuery, UseQueryResult, UseMutationResult, useMutation, useQueryClient } from "react-query";
import {useContext} from "react";
import { fetchGroupDataThroughAPI } from "../controllers/groupMembershipAndExistence/groupMembershipController";
import { GroupDescription } from "../controllers/groupMembershipAndExistence/groupMembershipController";
import { updateGroupNameThroughAPI } from "../controllers/groupMembershipAndExistence/updateGroupController";
import { GroupContext } from "../context/groupContext";
import { INVALID_GROUP_CODE } from "../controllers/groupMembershipAndExistence/groupCodeController";


export const useQueryToFetchGroupData = (groupCode : string) : UseQueryResult<GroupDescription> => {
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    return useQuery<GroupDescription, Error>(
        "fetchingGroupDataFor"+groupCode, 
        ()=> {
            if (groupDescription.groupCode === INVALID_GROUP_CODE){
                return fetchGroupDataThroughAPI(groupCode);
            } else {
                return groupDescription;
            }
        },
        {
            onSuccess: (data) => {
                setGroupDescription(data);
            }
        }
    );
}



export const useMutationToUpdateGroupData = (groupCode : string, cleanupFunction : () => void) : UseMutationResult<string, Error, string, unknown> => {
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    const queryClient = useQueryClient();
    return useMutation<string, Error, string, unknown>(
        ["updating group name", groupCode], 
        async (name : string) => {
            return await updateGroupNameThroughAPI(name, groupCode);
        },
        {
            onSuccess : (data : string) => {
                
                let newGroupDescription = {...groupDescription};
                newGroupDescription.groupName = data;
                setGroupDescription(newGroupDescription);
                queryClient.setQueryData("fetchingGroupDataFor"+groupCode, newGroupDescription);
                //queryClient.invalidateQueries("fetchingGroupDataFor"+groupCode);
                cleanupFunction();
                

            }
        }
    )
}