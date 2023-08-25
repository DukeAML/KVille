import React, {useContext} from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography } from "@material-ui/core";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import {Container} from "@material-ui/core";
import { AvailabilityCalendarDatesContext } from "../../../../../lib/pageSpecific/availability/availabilityCalendarDatesContext";


export const AvailabilityOptions : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate} = useContext(AvailabilityCalendarDatesContext);

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
    
    return (
        <Container maxWidth="md">
            <KvilleAccordion elements={[changeTimesOption]}/>
        </Container>
    );
}