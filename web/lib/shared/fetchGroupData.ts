import { useQuery, UseQueryResult } from "react-query";
import {useContext} from "react";
import { GroupDescription, fetchGroupData } from "../../../common/src/db/groupExistenceAndMembership/groupMembership";
import { GroupContext } from "./context/groupContext";
import { INVALID_GROUP_CODE } from "../../../common/src/db/groupExistenceAndMembership/GroupCode";


export const useQueryToFetchGroupData = (groupCode : string) : UseQueryResult<GroupDescription> => {
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    return useQuery<GroupDescription, Error>(
        "fetchingGroupDataFor"+groupCode, 
        ()=> {
            console.log("fetching group data");
            if (groupDescription.groupCode === INVALID_GROUP_CODE){
                return fetchGroupData(groupCode);
            } else {
                return groupDescription;
            }
        },
        {
            onSuccess: (data) => {
                console.log("setting group description with the following");
                console.log(data);
                setGroupDescription(data);
            }
        }
    );
}