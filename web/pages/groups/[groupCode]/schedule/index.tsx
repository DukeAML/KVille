import React, {useContext, useState, useRef, useEffect} from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { ScheduleOptions } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleOptions";
import {getDefaultDisplayDateRangeStartDateWithoutSchedule} from "../../../../../common/src/frontendLogic/schedule/scheduleDates";
import {ScheduleAndStartDate} from '../../../../../common/src/db/schedule/scheduleAndStartDate';
import { OneDaySchedule } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleCalendar/oneDaySchedule";
import { Typography, Stack } from "@mui/material";
import { CellColorsCoordinator } from "../../../../components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator";
import { CellColorsContext } from "../../../../lib/pageSpecific/schedule/cellColorsContext";
import { DateBeingShownContext } from "../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { useQueryToFetchSchedule } from "../../../../lib/pageSpecific/schedule/scheduleHooks";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { TenterSwapper } from "@/components/pageSpecific/groups/groupCode/schedule/tenterSwapper/TenterSwapper";
import { scheduleDates } from "../../../../../common/data/scheduleDates";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { EMPTY } from "../../../../../common/src/scheduling/slots/tenterSlot";
import { getDatePlusNumShifts } from "../../../../../common/src/calendarAndDates/datesUtils";



export default function Schedule() {
    const defaultData = new ScheduleAndStartDate([], scheduleDates.startOfBlack);
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;

    const DEFAULT_DATE_BEING_SHOWN = scheduleDates.startOfBlue;
    const [dateBeingShown, setDateBeingShown] = useState<Date>(DEFAULT_DATE_BEING_SHOWN);
    const {groupDescription} = useContext(GroupContext);
    const groupCode = useGroupCode();
    
    const [isSwappingTenter, setIsSwappingTenter] = useState<boolean>(false);
    const [timeSlotClickedOn, setTimeSlotClickedOn] = useState<Date>(scheduleDates.startOfBlack);
    const [tenterToReplace, setTenterToReplace] = useState<string>("");
    const [newTenter, setNewTenter] = useState<string>(EMPTY);
    const [startReplacementDate, setStartReplacementDate] = useState<Date>(scheduleDates.startOfBlack);
    const [endReplacementDate, setEndReplacementDate] = useState<Date>(getDatePlusNumShifts(scheduleDates.startOfBlack, 1));

    const {data : scheduleAndStartDate, isLoading, isError, refetch} = useQueryToFetchSchedule(groupCode);
    useEffect(() => {
        setDateBeingShown(getDefaultDisplayDateRangeStartDateWithoutSchedule());
    }, []);

    console.log(scheduleAndStartDate);

    
    



    let body = null;
    if (isLoading){
        body = <KvilleLoadingContainer/>
    } else {
        body = (
            <DateBeingShownContext.Provider value={{dateBeingShown : dateBeingShown, setDateBeingShown : setDateBeingShown}}>
                <CellColorsContext.Provider value={{cellColorsCoordinator : cellColorCoordinator}}>
                    <TenterSwapContext.Provider value={{isSwappingTenter, setIsSwappingTenter, timeSlotClickedOn, setTimeSlotClickedOn, tenterToReplace, setTenterToReplace,
                                                        newTenter, setNewTenter, startReplacementDate, setStartReplacementDate, endReplacementDate, setEndReplacementDate}}>
                        <Typography align="center">
                            This shows who is supposed to be in the tent at all times. 
                            Click the Assign Tenters option below to get started with using our algorithm to auto-fill the schedule.
                            To swap who is assigned at a specific time slot, click on their name in the grid
                        </Typography>
                
                        <ScheduleOptions/>
                        <Stack direction="row">
                            <OneDaySchedule/>
                            {isSwappingTenter ? <TenterSwapper/> : null}
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

