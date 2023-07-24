import React, {useContext, useState} from "react";
import { KvilleAccordion } from "@/components/accordion";
import { Typography } from "@material-ui/core";
import { DateRangeChanger } from "@/components/dateRangeChanger/dateRangeChanger";
import {Container} from "@material-ui/core";
import { ScheduleCalendarDatesContext } from "./scheduleCalendarDatesContext";


export const ScheduleOptions : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate} = useContext(ScheduleCalendarDatesContext);

    let changeTimesOption = {
        summary : <Typography>Change Dates Visible</Typography>,
        detail : 
            <DateRangeChanger includeHours={false}
                externalStartDate={calendarStartDate}
                externalEndDate={calendarEndDate}
                setExternalStartDate={setCalendarStartDate}
                setExternalEndDate={setCalendarEndDate}
            />
    }
    
    return (
        <Container maxWidth="md">
            <KvilleAccordion elements={[changeTimesOption]}/>
        </Container>
    );
}