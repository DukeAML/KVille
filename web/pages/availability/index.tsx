import { UserContext } from "@/context/userContext";
import { useContext } from "react";
import {useQuery} from 'react-query';
import {fetchAvailability, AvailabilitySlot} from "../../../common/db/availability";
import { BasePageContainerWithNavBar, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { Typography } from "@mui/material";
import { ClientSideRenderedComponent } from "@/components/clientSideRenderedComponent";
import { AvailabilityTable } from "./availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/calendarAndDates/calendar_services";

export default function Availability(){
    const {groupCode, userID} = useContext(UserContext);
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>(['getAvailability', groupCode, userID], 
        ()=> fetchAvailability(groupCode, userID),
        {
            initialData: defaultAvailabilitySlotsData
        });

    return (
        <BasePageContainerWithNavBarAndTitle title="Availability">
            <Typography>{userID} is uid</Typography>
            <Typography>{groupCode} is gruopCode</Typography>
            {isLoading ? 
                null : 
                <AvailabilityTable 
                    originalAvailabilityArr={data ? data : defaultAvailabilitySlotsData}
                    displayStartDate={getInitialAvailabilityDisplayStartDate("black")}
                    displayEndDate={getInitialAvailabilityDisplayEndDate("black")}
                />
            }
    
        </BasePageContainerWithNavBarAndTitle>
    )
}






