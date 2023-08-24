import React, {useContext, useState} from "react";
import { Container, Typography } from "@material-ui/core";
import { DatePicker } from "@mui/x-date-pickers";
import {Grid} from "@material-ui/core";
import { DateChanger } from "./dateChanger";
import { AvailabilityCalendarDatesContext } from "@/pages/groups/[groupCode]/availability/hooks/availabilityCalendarDatesContext";
import { KvilleButton } from "../utils/button";
interface DateRangeChangerProps {
    includeHours : boolean;
    externalStartDate : Date;
    externalEndDate : Date;
    submitNewDateRange : (startDate : Date, endDate : Date) => void;
}

export const DateRangeChanger : React.FC<DateRangeChangerProps> = (props : DateRangeChangerProps) => {
    const {calendarStartDate} = useContext(AvailabilityCalendarDatesContext);
    const [newStartDate, setNewStartDate] = useState<Date>(props.externalStartDate);
    const [newEndDate, setNewEndDate] = useState<Date>(props.externalEndDate);
    return (
        <Container>
            <Grid container spacing={2} alignItems="center" direction="row">
                <Grid item>
                    <DateChanger includeHours={props.includeHours} date={newStartDate} setDate={setNewStartDate}/>
                </Grid>
                <Grid item>
                    <DateChanger includeHours={props.includeHours} date ={newEndDate} setDate={setNewEndDate}/>
                </Grid>
            </Grid>
            <KvilleButton onClick={() => {
                props.submitNewDateRange(newStartDate, newEndDate);
            }}>
                <Typography variant="h6" >Submit</Typography>
            </KvilleButton>
        </Container>
    )
}


