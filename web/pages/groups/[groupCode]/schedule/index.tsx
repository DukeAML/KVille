import React, {useContext, useState, useRef, useEffect} from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { ScheduleOptions } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleOptions";
import {getDefaultDisplayDateRangeStartDate} from "../../../../../common/src/frontendLogic/schedule/scheduleDates";
import {ScheduleAndStartDate} from '../../../../../common/src/db/schedule/scheduleAndStartDate';
import { OneDaySchedule } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleCalendar/oneDaySchedule";
import { Typography, Stack } from "@mui/material";
import { CellColorsCoordinator } from "../../../../components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator";
import { CellColorsContext } from "../../../../lib/pageSpecific/schedule/cellColorsContext";
import { DateBeingShownContext } from "../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { getQueryKeyNameForGroupCode, useQueryToFetchSchedule } from "../../../../lib/pageSpecific/schedule/scheduleHooks";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { TenterSwapper } from "@/components/pageSpecific/groups/groupCode/schedule/TenterSwapper";


export default function Schedule() {
    const defaultData = new ScheduleAndStartDate([], new Date(Date.now()));
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;

    const groupCode = useGroupCode();
    const {data : scheduleAndStartDate, isLoading, isError} = useQueryToFetchSchedule(groupCode);

    //initializing variables for context hooks
    const [dateBeingShown, setDateBeingShown] = useState<Date>(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));
    const [isSwappingTenter, setIsSwappingTenter] = useState<boolean>(false);
    const [timeSlotClickedOn, setTimeSlotClickedOn] = useState<Date>(new Date(2023, 0, 0));
    const [tenterToReplace, setTenterToReplace] = useState<string>("");

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
                    <TenterSwapContext.Provider value={{isSwappingTenter, setIsSwappingTenter, timeSlotClickedOn, setTimeSlotClickedOn, tenterToReplace, setTenterToReplace}}>
                        <Typography align="center">
                            This shows who is supposed to be in the tent at all times. 
                            Click the Assign Tenters option below to get started with using our algorithm to auto-fill the schedule.
                            To swap who is assigned at a specific time slot, click on their name in the grid
                        </Typography>
                
                        <ScheduleOptions/>
                        <Stack direction="row">
                            <OneDaySchedule/>
                            <TenterSwapper/>
                        </Stack>
                    </TenterSwapContext.Provider>
                </CellColorsContext.Provider>
            </DateBeingShownContext.Provider>
        );
    }
    
    //console.log(scheduleAndStartDate);
    return (
        <PermissionRequiredPageContainer title="Schedule" groupSpecificPage={true}>
           {body}
        </PermissionRequiredPageContainer>
    )
}

