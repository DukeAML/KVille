import { UserContext } from "@/context/userContext";
import { AvailabilityCalendarDatesContext } from "./availabilityCalendarDatesContext";
import { useContext, useState } from "react";
import {useQuery} from 'react-query';
import {fetchAvailability, AvailabilitySlot} from "../../../common/db/availability";
import { BasePageContainerWithNavBar, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";

import { Container } from "@material-ui/core";
import { AvailabilityTable } from "./availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/calendarAndDates/calendar_services";
import { AvailabilityOptions } from "./availabilityOptions";


export default function Availability(){
    const {groupCode, userID} = useContext(UserContext); //TODO: refactor out group context
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>(['getAvailability', groupCode, userID], 
        ()=> fetchAvailability(groupCode, userID),
        {
            initialData: defaultAvailabilitySlotsData
        });


    let [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate("black"));
    let [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate("black"));
    return (
        <BasePageContainerWithNavBarAndTitle title="Availability">
            {isLoading ? 
                null : 
                <Container>
                    <AvailabilityCalendarDatesContext.Provider value={{calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate}}>
                        <AvailabilityOptions/>
                        <AvailabilityTable 
                            originalAvailabilityArr={data ? data : defaultAvailabilitySlotsData}
                        />
                    </AvailabilityCalendarDatesContext.Provider>
                </Container>
            }
    
        </BasePageContainerWithNavBarAndTitle>
    )
}






