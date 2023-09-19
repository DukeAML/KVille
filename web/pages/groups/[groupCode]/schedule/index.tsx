import React, {useContext, useState, useRef, useEffect} from "react";
import { BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/shared/basePageContainer";
import { ScheduleOptions } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleOptions";
import {getDefaultDisplayDateRangeStartDate} from "../../../../../common/src/frontendLogic/schedule/scheduleDates";
import {ScheduleAndStartDate} from '../../../../../common/src/db/schedule/scheduleAndStartDate';
import { OneDaySchedule } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleCalendar/oneDaySchedule";
import { Typography } from "@mui/material";
import { CellColorsCoordinator } from "../../../../components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator";
import { CellColorsContext } from "../../../../lib/pageSpecific/schedule/cellColorsContext";
import { DateBeingShownContext } from "../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { getQueryKeyNameForGroupCode, useQueryToFetchSchedule } from "../../../../lib/pageSpecific/schedule/scheduleHooks";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { useGroupCode } from "@/lib/shared/useGroupCode";


export default function Schedule() {
    const defaultData = new ScheduleAndStartDate([], new Date(Date.now()));
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;

    const groupCode = useGroupCode();
    console.log("the group code is " + groupCode);
    const {groupDescription} = useContext(GroupContext);
    const {data : scheduleAndStartDate, isLoading, isError} = useQueryToFetchSchedule(groupCode);

    const [dateBeingShown, setDateBeingShown] = useState<Date>(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));

    useEffect(() => {
        setDateBeingShown(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));
    }, [scheduleAndStartDate]);

    let body = null;
    if (isLoading){
        body = <KvilleLoadingContainer/>
    } else {
        body = (
            <DateBeingShownContext.Provider value={{dateBeingShown : dateBeingShown, setDateBeingShown : setDateBeingShown}}>
                <CellColorsContext.Provider value={{cellColorsCoordinator : cellColorCoordinator}}>
                <Typography align="center">This shows who is supposed to be in the tent at all times. Click the "Assign Tenters" option below to get started with using our algorithm to auto-fill the schedule</Typography>
            
                    <ScheduleOptions/>
                    
                    <OneDaySchedule/>
                </CellColorsContext.Provider>
            </DateBeingShownContext.Provider>
        );
    }
    
    //console.log(scheduleAndStartDate);
    return (
        <BasePageContainerForGroupsPage title="Schedule">
           {body}
        </BasePageContainerForGroupsPage>
    )
}

