import { UserContext } from "@/lib/shared/context/userContext";
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';
import { useContext, useState, useEffect } from "react";
import {useQuery} from 'react-query';
import {fetchAvailability, AvailabilitySlot} from "../../../../../common/src/db/availability";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { KvilleLoadingContainer} from "@/components/shared/utils/loading";

import { Container } from "@material-ui/core";
import { AvailabilityTable } from "../../../../components/pageSpecific/groups/groupCode/availability/availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/src/frontendLogic/availability/availabilityDates";
import { AvailabilityOptions } from "../../../../components/pageSpecific/groups/groupCode/availability/availabilityOptions";
import { getQueryKeyNameForFetchAvailability } from "../../../../lib/pageSpecific/availability/availabilityHooks";
import { TENTING_COLORS } from "../../../../../common/data/phaseData";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { Typography } from "@mui/material";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { CURRENT_YEAR } from "../../../../../common/data/scheduleDates";

export default function Availability(){
    const { userID} = useContext(UserContext); 
    const groupCode = useGroupCode();
    const {groupDescription} = useContext(GroupContext);
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>([getQueryKeyNameForFetchAvailability(groupCode, userID)], 
        ()=> fetchAvailability(groupCode, userID),
    );
    let year = data ? data[0].startDate.getFullYear() : CURRENT_YEAR;


    const [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate(TENTING_COLORS.BLACK, year));
    const [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate(TENTING_COLORS.BLACK, year));

    useEffect(() => {
        if (groupDescription){
            year = data ? data[0].startDate.getFullYear() : CURRENT_YEAR;
            setCalendarStartDate(getInitialAvailabilityDisplayStartDate(groupDescription.tentType, year));
            setCalendarEndDate(getInitialAvailabilityDisplayEndDate(groupDescription.tentType, year));
        }
    }, [groupDescription, data]);
    
    const [settingPreferred, setSettingPreferred] = useState<boolean>(false);
    const [colorblindModeIsOn, setColorblindModeIsOn] = useState<boolean>(false);
    return (
        <PermissionRequiredPageContainer title="Availability" groupSpecificPage={true}>
            {isLoading ? 
                <KvilleLoadingContainer/> : 
                <Container>
                    <Typography align="center" style={{marginBottom : 16}}>
                        Fill in your availability here - the grid below works kind of like a when2meet. 
                        Click on a cell to begin toggling your status - click on any cell to finish toggling. 
                        All cells in between the two will be switched to the new status. 
                        Go to the Change Dates Visible dropdown to change which dates you can fill in.
                    </Typography>
                    <AvailabilityPageContext.Provider value={{calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate, settingPreferred, setSettingPreferred, colorblindModeIsOn, setColorblindModeIsOn}}>
                        <AvailabilityOptions/>
                        <AvailabilityTable 
                            originalAvailabilityArr={data ? data : defaultAvailabilitySlotsData}
                        />
                    </AvailabilityPageContext.Provider>
                </Container>
            }
    
        </PermissionRequiredPageContainer>
    )
}






