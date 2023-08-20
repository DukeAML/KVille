import { UserContext } from "@/context/userContext";
import { AvailabilityCalendarDatesContext } from "./availabilityCalendarDatesContext";
import { useContext, useState } from "react";
import {useQuery} from 'react-query';
import {fetchAvailability, AvailabilitySlot} from "../../../../../common/db/availability";
import {  BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";

import { Container } from "@material-ui/core";
import { AvailabilityTable } from "./availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/features/availability/availabilityDates";
import { AvailabilityOptions } from "./availabilityOptions";
import { GroupContext } from "@/context/groupContext";


export default function Availability(){
    const { userID} = useContext(UserContext); 
    const {groupDescription : {groupCode}} = useContext(GroupContext);
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>(['getAvailability', groupCode, userID], 
        ()=> fetchAvailability(groupCode, userID),
        {
            initialData: defaultAvailabilitySlotsData
        });


    let [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate("black"));
    let [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate("black"));
    return (
        <BasePageContainerForGroupsPage title="Availability">
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
    
        </BasePageContainerForGroupsPage>
    )
}






