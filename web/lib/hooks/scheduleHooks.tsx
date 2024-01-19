import { useMutation,  UseQueryResult } from "react-query";
import { setGroupScheduleInDBThroughAPI } from "../controllers/scheduleController";
import { fetchGroupScheduleThroughAPI } from "../controllers/scheduleController";
import { useQueryClient, useQuery, QueryClient } from "react-query";
import { ScheduleData } from "../controllers/scheduleData";
import { INVALID_GROUP_CODE } from "../controllers/groupMembershipAndExistence/groupCodeController";
import { assignTentersAndGetNewFullSchedule } from "../schedulingAlgo/externalInterface/createGroupSchedule";
import { useContext, useState } from "react";
import { CURRENT_YEAR, getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { getDefaultDisplayDateGivenTentType } from "@/lib/calendarAndDatesUtils/schedule/scheduleDates";
import { CellColorsContext } from "../context/schedule/cellColorsContext";
import { getDefaultAssignDateRangeEndDate, getDefaultAssignDateRangeStartDate } from "@/lib/calendarAndDatesUtils/schedule/assignTenters";


const onSuccessfulDBScheduleUpdate = (newSchedule : ScheduleData, groupCode : string, queryClient : QueryClient) => {

    let queryKeyName = getQueryKeyNameForScheduleFetch(groupCode);
    let oldData : ScheduleData | undefined = queryClient.getQueryData(queryKeyName);
    if (oldData === undefined) {
        queryClient.invalidateQueries(queryKeyName);
    } else {
        queryClient.setQueryData(queryKeyName, newSchedule);
        //queryClient.invalidateQueries(queryKeyName);
    }

}

export const useMutationToUpdateSchedule = (groupCode : string) => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn : (newSchedule : ScheduleData) => setGroupScheduleInDBThroughAPI(groupCode, newSchedule),
            onSuccess : (newSchedule : ScheduleData) => {
                onSuccessfulDBScheduleUpdate(newSchedule, groupCode, queryClient);
            }
        }
    );

}


const assignAndUpdateMutationFn = async (groupCode : string, startDate : Date, endDate : Date, tentType : string, oldSchedule : ScheduleData) => {
    const newSchedule = await assignTentersAndGetNewFullSchedule(groupCode, tentType, startDate, endDate, oldSchedule);
    let newSchedObj = new ScheduleData(newSchedule, oldSchedule.startDate, oldSchedule.IDToNameMap);
    return await setGroupScheduleInDBThroughAPI(groupCode, newSchedObj);

}

interface useMutationToAssignTentersAndUpdateScheduleData {
    startDate : Date;
    endDate : Date;
    oldSchedule : ScheduleData;
    tentType : string;

}
export const useMutationToAssignTentersAndUpdateSchedule = (groupCode : string) => {
    const [successMsg, setSuccessMsg] = useState<string>("");
    const queryClient = useQueryClient();
    const {mutate, isError, isLoading} = useMutation (
        {
            mutationFn : (mutationData : useMutationToAssignTentersAndUpdateScheduleData) => assignAndUpdateMutationFn(groupCode, mutationData.startDate, mutationData.endDate, mutationData.tentType, mutationData.oldSchedule),
            onSuccess : (newSchedule : ScheduleData) => {
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

const fetchScheduleFunc = async (groupCode : string) : Promise<ScheduleData> => {
    if (groupCode === INVALID_GROUP_CODE){
        throw new Error("");
    }

    return fetchGroupScheduleThroughAPI(groupCode);
}


export const useQueryToFetchSchedule = (groupCode : string) : UseQueryResult<ScheduleData> => {
    const {cellColorsCoordinator} = useContext(CellColorsContext);
    return useQuery<ScheduleData, Error>(
        getQueryKeyNameForScheduleFetch(groupCode), 
        ()=> fetchScheduleFunc(groupCode),
        {
            onSuccess: (data) => {
                cellColorsCoordinator.establishNames(data.getAllMembers().map((member) => member.username));
            }
        }
    );
}

export const useFetchScheduleAndSetDefaultAssignTentersDate = (groupCode : string) => {
    const [defaultDateHasBeenDate, setDefaultDateHasBeenSet] = useState<boolean>(false);
    const [defaultAssignDateRangeStartDate, setDefaultAssignDateRangeStartDate] = useState<Date>(new Date(Date.now()));
    const [defaultAssignDateRangeEndDate, setDefaultAssignDateRangeEndDate] = useState<Date>(new Date(Date.now()));

    const {data, isLoading, isError} = useQuery<ScheduleData, Error>(
        getQueryKeyNameForScheduleFetch(groupCode),
        () => fetchScheduleFunc(groupCode),
        {
            onSuccess: (data) => {
                if (!defaultDateHasBeenDate){
                    setDefaultAssignDateRangeStartDate(getDefaultAssignDateRangeStartDate(data));
                    setDefaultAssignDateRangeEndDate(getDefaultAssignDateRangeEndDate(data));
                    setDefaultDateHasBeenSet(true);
                }
            }
        }
    )

    return {data, isLoading, isError, defaultAssignDateRangeStartDate, defaultAssignDateRangeEndDate};
}


export const useFetchScheduleAndSetDisplayDate = (groupCode : string, tentType : string) => {
    const [dateBeingShown, setDateBeingShown] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const [dateHasBeenSetAlready, setDateHasBeenSetAlready] = useState<boolean>(false);
    const {data, isLoading, isError} = useQuery<ScheduleData, Error>(
        getQueryKeyNameForScheduleFetch(groupCode),
        () => fetchScheduleFunc(groupCode),
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

export const useGetQueryDataForSchedule = (groupCode : string ) : ScheduleData | undefined => {
    let queryClient = useQueryClient();
    return queryClient.getQueryData(getQueryKeyNameForScheduleFetch(groupCode));
}



