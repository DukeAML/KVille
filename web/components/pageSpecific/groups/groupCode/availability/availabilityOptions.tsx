import React, {useContext} from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography, Container, Button } from "@mui/material";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';


export const AvailabilityOptions : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate, settingPreferred, setSettingPreferred} = useContext(AvailabilityPageContext);

    let changeTimesOption = {
        summary : <Typography>Change Dates Visible</Typography>,
        detail : 
            <DateRangeChanger includeHours={false}
                externalStartDate={calendarStartDate}
                externalEndDate={calendarEndDate}
                submitNewDateRange={(startDate : Date, endDate : Date) => {
                    setCalendarStartDate(startDate);
                    setCalendarEndDate(endDate);
                }}
   
            />
    }

    let changeSettingPreferredOption = {
        summary : <Typography>Set Preferred Timeslots</Typography>,
        detail : <Container>
            <Button disabled={settingPreferred} onClick={() => setSettingPreferred(true)}>
                Set Preferred Times
            </Button>
            <Button disabled={!settingPreferred} onClick={() => setSettingPreferred(false)}>
                Set Standard Availability Times
            </Button>
        </Container>
    }
    
    return (
        <Container maxWidth="md">
            <KvilleAccordion elements={[changeTimesOption, changeSettingPreferredOption]}/>
        </Container>
    );
}