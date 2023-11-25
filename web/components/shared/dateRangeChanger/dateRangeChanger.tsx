import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import {Grid} from "@material-ui/core";
import { DateChanger } from "./dateChanger";
import { KvilleButton } from "../utils/button";
interface DateRangeChangerProps {
    includeHours : boolean;
    externalStartDate : Date;
    externalEndDate : Date;
    submitNewDateRange : (startDate : Date, endDate : Date) => void;
}

export const DateRangeChanger : React.FC<DateRangeChangerProps> = (props : DateRangeChangerProps) => {

    const [newStartDate, setNewStartDate] = useState<Date>(props.externalStartDate);
    const [newEndDate, setNewEndDate] = useState<Date>(props.externalEndDate);

    useEffect(() => {
        setNewStartDate(props.externalStartDate);
        setNewEndDate(props.externalEndDate);
    }, [props.externalStartDate, props.externalEndDate]);
    return (
        <Container>
            <Grid container spacing={2} alignItems="center" direction="row">
                <Grid item>
                    <DateChanger text={"start"} includeHours={props.includeHours} date={newStartDate} setDate={setNewStartDate}/>
                </Grid>
                <Grid item>
                    <DateChanger text={"end"} includeHours={props.includeHours} date ={newEndDate} setDate={setNewEndDate}/>
                </Grid>
            </Grid>
            <KvilleButton onClick={() => {props.submitNewDateRange(newStartDate, newEndDate);}} text={"Submit"}/>
        </Container>
    )
}


