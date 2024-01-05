import { useQuery, UseQueryResult, UseMutationResult, useMutation, useQueryClient } from "react-query";
import {useContext} from "react";
import { GroupDescription, fetchGroupData } from "../../../common/src/db/groupExistenceAndMembership/groupMembership";
import {updateName} from "../../../common/src/db/groupExistenceAndMembership/updateGroup"; 
import { GroupContext } from "./context/groupContext";
import { INVALID_GROUP_CODE } from "../../../common/src/db/groupExistenceAndMembership/GroupCode";


export const useQueryToFetchGroupData = (groupCode : string) : UseQueryResult<GroupDescription> => {
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    return useQuery<GroupDescription, Error>(
        "fetchingGroupDataFor"+groupCode, 
        ()=> {
            if (groupDescription.groupCode === INVALID_GROUP_CODE){
                return fetchGroupData(groupCode);
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
            return await updateName(name, groupCode);
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