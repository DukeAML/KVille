import React, { useState, useRef, useContext } from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { ScheduleOptions } from "@/components/pageSpecific/groups/groupCode/schedule/scheduleOptions";
import { OneDaySchedule } from "@/components/pageSpecific/groups/groupCode/schedule/scheduleCalendar/oneDaySchedule";
import { Typography, Container } from "@mui/material";
import { CellColorsCoordinator } from "@/components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator";
import { CellColorsContext } from "@/lib/context/schedule/cellColorsContext";
import { DateBeingShownContext } from "@/lib/context/schedule/dateBeingShownContext";
import { useFetchScheduleAndSetDisplayDate } from "@/lib/hooks/scheduleHooks";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { useGroupCode } from "@/lib/hooks/useGroupCode";
import { TenterSwapContext } from "@/lib/context/schedule/tenterSwapContext";
import { TenterSwapper } from "@/components/pageSpecific/groups/groupCode/schedule/tenterSwapper/TenterSwapper";
import { CURRENT_YEAR, getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { EMPTY } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils";
import { GroupContext } from "@/lib/context/groupContext";
import { DatesRow } from "@/components/pageSpecific/groups/groupCode/schedule/datesRow";
import { SaveSchedule } from "@/components/pageSpecific/groups/groupCode/schedule/saveSchedule";



export default function Schedule() {
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;
    const {groupDescription} = useContext(GroupContext);
    const groupCode = useGroupCode();
    
    const [isSwappingTenter, setIsSwappingTenter] = useState<boolean>(false);
    const [timeSlotClickedOn, setTimeSlotClickedOn] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const [tenterToReplace, setTenterToReplace] = useState<string>("");
    const [newTenter, setNewTenter] = useState<string>(EMPTY);
    const [startReplacementDate, setStartReplacementDate] = useState<Date>(getScheduleDates(CURRENT_YEAR).startOfBlack);
    const [endReplacementDate, setEndReplacementDate] = useState<Date>(getDatePlusNumShifts(getScheduleDates(CURRENT_YEAR).startOfBlack, 1));
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
                        
                        <Container maxWidth="lg">
                            <Typography align="left" variant="h6" style={{marginBottom : 16}}>
                            Here is your schedule. It shows who is supposed to be in the tent at each time. 
                            Click the dropdown below to get started with using our algorithm to auto-fill the schedule.
                            To manually change who is assigned at a specific time slot, click on the corresponding box in the grid to replace them with someone else at that time. 
                            </Typography>
                            <SaveSchedule/>
                        </Container>

                
                        <ScheduleOptions/>

                        {isSwappingTenter ? <TenterSwapper/> : null}
                        <OneDaySchedule/>
                        <Container maxWidth="md"><DatesRow/></Container>

                    </TenterSwapContext.Provider>
                </CellColorsContext.Provider>
            </DateBeingShownContext.Provider>
        );
    }
    
    return (
        <PermissionRequiredPageContainer title="Schedule" groupSpecificPage={true}>
           {body}
        </PermissionRequiredPageContainer>
    )
}

