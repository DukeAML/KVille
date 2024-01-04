import React, { useState, useRef, useEffect, useContext } from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { ScheduleOptions } from "@/components/pageSpecific/groups/groupCode/schedule/scheduleOptions";
import {getDefaultDisplayDateGivenTentType, getDefaultDisplayDateRangeStartDateWithoutSchedule} from "../../../../common/src/frontendLogic/schedule/scheduleDates";
import { OneDaySchedule } from "@/components/pageSpecific/groups/groupCode/schedule/scheduleCalendar/oneDaySchedule";
import { Typography, Stack, Container } from "@mui/material";
import { CellColorsCoordinator } from "@/components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator";
import { CellColorsContext } from "@/lib/pageSpecific/schedule/cellColorsContext";
import { DateBeingShownContext } from "@/lib/pageSpecific/schedule/dateBeingShownContext";
import { useFetchScheduleAndSetDisplayDate, useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { TenterSwapper } from "@/components/pageSpecific/groups/groupCode/schedule/tenterSwapper/TenterSwapper";
import { CURRENT_YEAR, getScheduleDates } from "../../../../common/src/scheduling/rules/scheduleDates";
import { EMPTY } from "../../../../common/src/scheduling/slots/tenterSlot";
import { getDatePlusNumShifts } from "../../../../common/src/calendarAndDates/datesUtils";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { DatesRow } from "@/components/pageSpecific/groups/groupCode/schedule/datesRow";



export default function Schedule() {
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;
    //const [dateBeingShown, setDateBeingShown] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const {groupDescription} = useContext(GroupContext);
    const groupCode = useGroupCode();
    
    const [isSwappingTenter, setIsSwappingTenter] = useState<boolean>(false);
    const [timeSlotClickedOn, setTimeSlotClickedOn] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const [tenterToReplace, setTenterToReplace] = useState<string>("");
    const [newTenter, setNewTenter] = useState<string>(EMPTY);
    const [startReplacementDate, setStartReplacementDate] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const [endReplacementDate, setEndReplacementDate] = useState<Date>(getDatePlusNumShifts(getScheduleDates(CURRENT_YEAR).startOfBlack, 1));

    //const {data : scheduleAndStartDate, isLoading, isError, refetch} = useQueryToFetchSchedule(groupCode);
    const {dateBeingShown, setDateBeingShown, data : scheduleAndStartDate, isLoading, isError} = useFetchScheduleAndSetDisplayDate(groupCode, groupDescription.tentType);

    let body = null;
    if (isLoading){
        body = <KvilleLoadingContainer/>
    } else {
        body = (
            <DateBeingShownContext.Provider value={{dateBeingShown : dateBeingShown, setDateBeingShown : setDateBeingShown}}>
                <CellColorsContext.Provider value={{cellColorsCoordinator : cellColorCoordinator}}>
                    <TenterSwapContext.Provider value={{isSwappingTenter, setIsSwappingTenter, timeSlotClickedOn, setTimeSlotClickedOn, tenterToReplace, setTenterToReplace,
                                                        newTenter, setNewTenter, startReplacementDate, setStartReplacementDate, endReplacementDate, setEndReplacementDate}}>
                        
                        <Container maxWidth="md">
                            <Typography align="left">
                            Here is your schedule. It shows who is supposed to be in the tent at each time. 
                            Click the "Fill in Schedule" dropdown below to get started with using our algorithm to auto-fill the schedule.
                            To manually change who is assigned at a specific time slot, click on the corresponding box in the grid to replace them with someone else at that time. 
                            </Typography>
                        </Container>
                
                        <ScheduleOptions/>

                        {isSwappingTenter ? <TenterSwapper/> : null}
                        <OneDaySchedule/>

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

