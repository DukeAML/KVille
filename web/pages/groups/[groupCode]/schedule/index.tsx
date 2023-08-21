import React, {useContext, useState, useRef, useEffect} from "react";
import { useQuery } from "react-query";
import { BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { ScheduleOptions } from "./scheduleOptions";
import { UserContext } from "@/context/userContext";
import {fetchGroupSchedule} from "@/../common/db/schedule";
import {getDefaultDisplayDateRangeStartDate} from "@/../common/features/schedule/scheduleDates";
import {ScheduleAndStartDate} from '@/../common/Scheduling/scheduleAndStartDate';
import { OneDaySchedule } from "./scheduleCalendar/oneDaySchedule";
import { Typography } from "@mui/material";
import { CellColorsCoordinator } from "./cellColorsCoordinator";
import { CellColorsContext } from "./context/cellColorsContext";
import { DateBeingShownContext } from "./context/dateBeingShownContext";
import { getQueryKeyNameForGroupCode, useQueryToFetchSchedule } from "./hooks/scheduleHooks";
import { GroupContext } from "@/context/groupContext";


export default function Schedule() {
    const defaultData = new ScheduleAndStartDate([], new Date(Date.now()));
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;

    
    const {userID} = useContext(UserContext); //TODO: refactor out group context
    const {groupDescription} = useContext(GroupContext);
    const {data : scheduleAndStartDate, isLoading, isError} = useQueryToFetchSchedule(groupDescription.groupCode);

    const [dateBeingShown, setDateBeingShown] = useState<Date>(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));

    useEffect(() => {
        setDateBeingShown(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));
    }, [scheduleAndStartDate]);

    if (isLoading){
        return <div>LOADING</div>
    }
    
    //console.log(scheduleAndStartDate);
    return (
        <BasePageContainerForGroupsPage title="Schedule">
            <DateBeingShownContext.Provider value={{dateBeingShown : dateBeingShown, setDateBeingShown : setDateBeingShown}}>
                <CellColorsContext.Provider value={{cellColorsCoordinator : cellColorCoordinator}}>
                    <ScheduleOptions/>
                    <OneDaySchedule/>
                </CellColorsContext.Provider>
            </DateBeingShownContext.Provider>
        </BasePageContainerForGroupsPage>
    )
}

