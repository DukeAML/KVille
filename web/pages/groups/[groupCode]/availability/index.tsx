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
import { GroupContext } from "@/lib/shared/context/groupContext";
import { getQueryKeyNameForFetchAvailability } from "../../../../lib/pageSpecific/availability/availabilityHooks";
import { useRouter} from "next/router";
import { INVALID_GROUP_CODE } from "@/pages/_app";
import { BLACK } from "../../../../../common/data/phaseData";

export default function Availability(){
    const { userID} = useContext(UserContext); 
  
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>([getQueryKeyNameForFetchAvailability(groupCode, userID)], 
        ()=> fetchAvailability(groupCode, userID),
        );


    let [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate(BLACK));
    let [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate(BLACK));
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






