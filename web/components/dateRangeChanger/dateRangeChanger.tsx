import React, {useContext, useState} from "react";
import { Container, Typography } from "@material-ui/core";
import { DatePicker } from "@mui/x-date-pickers";
import {Grid} from "@material-ui/core";
import { DateChanger } from "./dateChanger";
import { AvailabilityCalendarDatesContext } from "@/pages/availability/availabilityCalendarDatesContext";
import { KvilleButton } from "../button";
interface DateRangeChangerProps {
    includeHours : boolean;
    externalStartDate : Date;
    externalEndDate : Date;
    setExternalStartDate : (d : Date) => void;
    setExternalEndDate : (d : Date) => void;
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
                props.setExternalStartDate(newStartDate);
                props.setExternalEndDate(newEndDate);
            }}>
                <Typography>Submit</Typography>
            </KvilleButton>
        </Container>
    )
}
