import { useMutation,  UseMutationResult, UseQueryResult } from "react-query";
import { QueryClient } from "react-query";
import { setGroupScheduleInDB } from "../../../../common/src/db/schedule";
import { group } from "console";
import { generateGroupCode } from "../../../../common/src/db/groupExistenceAndMembership/GroupCode";
import { useQueryClient, useQuery } from "react-query";
import { useContext } from "react";


import {fetchGroupSchedule} from "../../../../common/src/db/schedule";
import {ScheduleAndStartDate} from '../../../../common/src/Scheduling/scheduleAndStartDate';




export const useMutationToUpdateSchedule = (groupCode : string, onSuccess : (newSchedule : string[]) => void) => {
    return useMutation(
        {
            mutationFn : (newSchedule : string[]) => setGroupScheduleInDB(groupCode, newSchedule),
            onSuccess : (newSchedule : string[]) => onSuccess(newSchedule)
        }
    );

}

export const useQueryToFetchSchedule = (groupCode : string) : UseQueryResult<ScheduleAndStartDate> => {
    return useQuery<ScheduleAndStartDate, Error>(
        getQueryKeyNameForGroupCode(groupCode), 
        ()=> fetchGroupSchedule(groupCode),
        {
            onSuccess: () => {
                console.log("I fetched the schedule" );
                //setDateBeingShown(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));
        
            }
        }
    );
}

export const useGetQueryDataForSchedule = (groupCode : string ) : ScheduleAndStartDate | undefined => {
    let queryClient = useQueryClient();
    return queryClient.getQueryData(getQueryKeyNameForGroupCode(groupCode));
}

export const getQueryKeyNameForGroupCode = (groupCode : string) : string =>  {
    return "getGroupSchedule"+groupCode;
}