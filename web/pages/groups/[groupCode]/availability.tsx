import { UserContext } from "@/lib/context/userContext";
import { AvailabilityPageContext } from '@/lib/context/AvailabilityPageContextType';
import { useContext, useState, useEffect } from "react";
import {useQuery} from 'react-query';
import { fetchAvailabilityThroughAPI } from "@/lib/controllers/availabilityController";
import { AvailabilitySlot } from "@/lib/controllers/availabilityController";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { KvilleLoadingContainer} from "@/components/shared/utils/loading";

import { Container } from "@material-ui/core";
import { AvailabilityTable } from "@/components/pageSpecific/groups/groupCode/availability/availabilityTable/availabilityTable";
import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/lib/calendarAndDatesUtils/availability/availabilityDates";
import { AvailabilityOptions } from "@/components/pageSpecific/groups/groupCode/availability/availabilityOptions/availabilityOptions";
import { getQueryKeyNameForFetchAvailability } from "@/lib/hooks/availabilityHooks";
import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { useGroupCode } from "@/lib/hooks/useGroupCode";
import { Typography } from "@mui/material";
import { GroupContext } from "@/lib/context/groupContext";
import { CURRENT_YEAR } from "@/lib/schedulingAlgo/rules/scheduleDates";

export default function Availability(){
    const { userID} = useContext(UserContext); 
    const groupCode = useGroupCode();
    const {groupDescription} = useContext(GroupContext);
    const defaultAvailabilitySlotsData = [new AvailabilitySlot(new Date(Date.now()), false)];
    const [calendarDateHasBeenSet, setCalendarDateHasBeenSet] = useState<boolean>(false);

    const {data, isLoading, isError} = useQuery<AvailabilitySlot[], Error>([getQueryKeyNameForFetchAvailability(groupCode, userID)], 
        ()=> fetchAvailabilityThroughAPI(groupCode),
        {
            onSuccess : (data) => {
                if (!calendarDateHasBeenSet){
                    year = data ? data[0].startDate.getFullYear() : CURRENT_YEAR;
                    setCalendarStartDate(getInitialAvailabilityDisplayStartDate(groupDescription.tentType, year));
                    setCalendarEndDate(getInitialAvailabilityDisplayEndDate(groupDescription.tentType, year));
                    setCalendarDateHasBeenSet(true);
                }
                
            }
        }
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
    }, [groupDescription]);
    
    const [settingPreferred, setSettingPreferred] = useState<boolean>(false);
    const [colorblindModeIsOn, setColorblindModeIsOn] = useState<boolean>(false);
    return (
        <PermissionRequiredPageContainer title="Availability" groupSpecificPage={true}>
            {isLoading ? 
                <KvilleLoadingContainer/> : 
                <Container >
                    <Typography align="center" style={{marginBottom : 16}} variant="h6">
                        Fill in your availability here - the grid below works kind of like a when2meet. 
                        Click on a cell to begin toggling your status - click on any cell to finish toggling. 
                        All cells in between the two will be switched to the new status. 
                        Check the dropdowns below for more options.
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






