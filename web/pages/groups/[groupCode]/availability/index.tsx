import { UserContext } from "@/context/userContext";
import { AvailabilityCalendarDatesContext } from "./hooks/availabilityCalendarDatesContext";
import { useContext, useState } from "react";
import {useQuery} from 'react-query';
import {fetchAvailability, AvailabilitySlot} from "../../../../../common/src/db/availability";
import {  BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { KvilleLoadingContainer} from "@/components/utils/loading";

import { Container } from "@material-ui/core";
import { AvailabilityTable } from "./availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/src/frontendLogic/availability/availabilityDates";
import { AvailabilityOptions } from "./availabilityOptions";
import { GroupContext } from "@/context/groupContext";
import { getQueryKeyNameForFetchAvailability } from "./hooks/availabilityHooks";
import { useRouter} from "next/router";
import { INVALID_GROUP_CODE } from "@/pages/_app";

export default function Availability(){
    const { userID} = useContext(UserContext); 
  
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>([getQueryKeyNameForFetchAvailability(groupCode, userID)], 
        ()=> fetchAvailability(groupCode, userID),
        );


    let [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate("black"));
    let [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate("black"));
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






