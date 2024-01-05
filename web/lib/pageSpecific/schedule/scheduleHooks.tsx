import { useMutation,  UseQueryResult } from "react-query";
import { setGroupScheduleInDB } from "../../../../common/src/db/schedule/schedule";
import { useQueryClient, useQuery, QueryClient } from "react-query";
import {fetchGroupSchedule} from "../../../../common/src/db/schedule/schedule";
import {ScheduleAndStartDate} from '../../../../common/src/db/schedule/scheduleAndStartDate';
import { INVALID_GROUP_CODE } from "../../../../common/src/db/groupExistenceAndMembership/GroupCode";
import { assignTentersAndGetNewFullSchedule } from "../../../../common/src/scheduling/externalInterface/createGroupSchedule";
import { useContext, useState } from "react";
import { CURRENT_YEAR, getScheduleDates } from "../../../../common/src/scheduling/rules/scheduleDates";
import { getDefaultDisplayDateGivenTentType } from "../../../../common/src/frontendLogic/schedule/scheduleDates";
import { CellColorsContext } from "./cellColorsContext";


const onSuccessfulDBScheduleUpdate = (newSchedule : ScheduleAndStartDate, groupCode : string, queryClient : QueryClient) => {

    let queryKeyName = getQueryKeyNameForScheduleFetch(groupCode);
    let oldData : ScheduleAndStartDate | undefined = queryClient.getQueryData(queryKeyName);
    if (oldData === undefined) {
        queryClient.invalidateQueries(queryKeyName);
    } else {
        queryClient.setQueryData(queryKeyName, newSchedule);
        //queryClient.refetchQueries(queryKeyName);
        queryClient.invalidateQueries(queryKeyName);
    }

}

export const useMutationToUpdateSchedule = (groupCode : string) => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn : (newSchedule : ScheduleAndStartDate) => setGroupScheduleInDB(groupCode, newSchedule),
            onSuccess : (newSchedule : ScheduleAndStartDate) => {
                onSuccessfulDBScheduleUpdate(newSchedule, groupCode, queryClient);
            }
        }
    );

}


const assignAndUpdateMutationFn = async (groupCode : string, startDate : Date, endDate : Date, tentType : string, oldSchedule : ScheduleAndStartDate) => {
    const newSchedule = await assignTentersAndGetNewFullSchedule(groupCode, tentType, startDate, endDate, oldSchedule);
    let newSchedObj = new ScheduleAndStartDate(newSchedule, oldSchedule.startDate, oldSchedule.IDToNameMap);
    return await setGroupScheduleInDB(groupCode, newSchedObj);

}

interface useMutationToAssignTentersAndUpdateScheduleData {
    startDate : Date;
    endDate : Date;
    oldSchedule : ScheduleAndStartDate;
    tentType : string;

}
export const useMutationToAssignTentersAndUpdateSchedule = (groupCode : string) => {
    const [successMsg, setSuccessMsg] = useState<string>("");
    const queryClient = useQueryClient();
    const {mutate, isError, isLoading} = useMutation (
        {
            mutationFn : (mutationData : useMutationToAssignTentersAndUpdateScheduleData) => assignAndUpdateMutationFn(groupCode, mutationData.startDate, mutationData.endDate, mutationData.tentType, mutationData.oldSchedule),
            onSuccess : (newSchedule : ScheduleAndStartDate) => {
                onSuccessfulDBScheduleUpdate(newSchedule, groupCode, queryClient);
                setSuccessMsg("Successfully filled in the schedule!");
                setTimeout(() => {
                    setSuccessMsg("");
                }, 3000);
            }
        }
    );
    return {mutate, isError, isLoading, successMsg};

}



export const useQueryToFetchSchedule = (groupCode : string) : UseQueryResult<ScheduleAndStartDate> => {
    const {cellColorsCoordinator} = useContext(CellColorsContext);
    return useQuery<ScheduleAndStartDate, Error>(
        getQueryKeyNameForScheduleFetch(groupCode), 
        ()=> {
            if (groupCode === INVALID_GROUP_CODE){
                throw new Error("");
            }
            return fetchGroupSchedule(groupCode);
        },
        {
            onSuccess: (data) => {
                cellColorsCoordinator.establishNames(data.getAllMembers().map((member) => member.username));
            }
        }
    );
}


export const useFetchScheduleAndSetDisplayDate = (groupCode : string, tentType : string) => {
    const [dateBeingShown, setDateBeingShown] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const [dateHasBeenSetAlready, setDateHasBeenSetAlready] = useState<boolean>(false);
    const {data, isLoading, isError} = useQuery<ScheduleAndStartDate, Error>(
        getQueryKeyNameForScheduleFetch(groupCode),
        () => {
            if (groupCode === INVALID_GROUP_CODE){
                throw new Error("");
            }
            return fetchGroupSchedule(groupCode);
        },
        {
            onSuccess: (data) => {
                if (!dateHasBeenSetAlready){
                    setDateBeingShown(getDefaultDisplayDateGivenTentType(tentType, data.startDate.getFullYear()));
                    setDateHasBeenSetAlready(true);
                }
                
            }
        }
    )

    return {dateBeingShown, setDateBeingShown, data, isLoading, isError}
}



export const getQueryKeyNameForScheduleFetch = (groupCode : string)  =>  {
    return "getGroupSchedule" + groupCode;
}

export const useGetQueryDataForSchedule = (groupCode : string ) : ScheduleAndStartDate | undefined => {
    let queryClient = useQueryClient();
    return queryClient.getQueryData(getQueryKeyNameForScheduleFetch(groupCode));
}



