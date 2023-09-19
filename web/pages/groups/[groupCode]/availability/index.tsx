import { UserContext } from "@/lib/shared/context/userContext";
import { AvailabilityCalendarDatesContext } from "../../../../lib/pageSpecific/availability/availabilityCalendarDatesContext";
import { useContext, useState } from "react";
import {useQuery} from 'react-query';
import {fetchAvailability, AvailabilitySlot} from "../../../../../common/src/db/availability";
import {  BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/shared/basePageContainer";
import { KvilleLoadingContainer} from "@/components/shared/utils/loading";

import { Container } from "@material-ui/core";
import { AvailabilityTable } from "../../../../components/pageSpecific/groups/groupCode/availability/availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/src/frontendLogic/availability/availabilityDates";
import { AvailabilityOptions } from "../../../../components/pageSpecific/groups/groupCode/availability/availabilityOptions";
import { getQueryKeyNameForFetchAvailability } from "../../../../lib/pageSpecific/availability/availabilityHooks";
import { TENTING_COLORS } from "../../../../../common/data/phaseData";
import { useGroupCode } from "@/lib/shared/useGroupCode";

export default function Availability(){
    const { userID} = useContext(UserContext); 
    const groupCode = useGroupCode();
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>([getQueryKeyNameForFetchAvailability(groupCode, userID)], 
        ()=> fetchAvailability(groupCode, userID),
        );


    let [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate(TENTING_COLORS.BLACK));
    let [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate(TENTING_COLORS.BLACK));
    return (
        <BasePageContainerForGroupsPage title="Availability">
            {isLoading ? 
                <KvilleLoadingContainer/> : 
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






