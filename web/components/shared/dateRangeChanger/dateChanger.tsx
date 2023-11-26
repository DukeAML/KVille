import React from "react";
import dayjs from "dayjs";


import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Container } from "@material-ui/core";
import {Select, MenuItem, FormControl, InputLabel} from "@material-ui/core";
import { TENTING_COLORS } from "../../../../common/data/phaseData";
import { get48TimeLabels } from "../../../../common/src/calendarAndDates/calendarUtils";


interface DateChangerProps {
    includeHours : boolean;
    text : string;
    date : Date;
    setDate : (d : Date) => void;
}

export const DateChanger : React.FC<DateChangerProps> = (props : DateChangerProps) => {
    return (
        <Container>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker 
                    label={props.text} 
                    value={dayjs(props.date)}
                    onChange={(newDate) => {
                        if (newDate != null){
                            let date = newDate.toDate();
                            date.setHours(0);
                            date.setMinutes(0);
                            date.setSeconds(0);
                            date.setMilliseconds(0);
                            props.setDate(date);
                        }
                    }}
                />
                {props.includeHours ? <HoursChooser date={props.date} setDate={props.setDate}/> : null}
            </LocalizationProvider>
        </Container>
    )
}

interface HoursChooserProps {
    date : Date;
    setDate : (d : Date) => void;
}

const HoursChooser : React.FC<HoursChooserProps> = (props : HoursChooserProps) => {
    const handleTimeChange = (hours : number, minutes : number) => {
        let newDate = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate());
        console.log(newDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        console.log(newDate);
        props.setDate(newDate);
    }
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker label="Time" timeSteps={{hours : 1, minutes : 30, seconds : 0}} onChange={(e) => {
                    if (typeof(e.$d.getHours()) === "number" && typeof(e.$d.getMinutes()) === "number"){
                        handleTimeChange(e.$d.getHours(), e.$d.getMinutes());
                    }}} />
        </LocalizationProvider>
    )
}
