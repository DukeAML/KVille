import React from "react";
import dayjs from "dayjs";


import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Container } from "@mui/material";
import { getDateRoundedTo30MinSlot } from "@/lib/calendarAndDatesUtils/datesUtils";


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
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        props.setDate(getDateRoundedTo30MinSlot(newDate));
    }
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker minutesStep={30} value={dayjs(props.date)} timeSteps={{hours : 1, minutes : 30, seconds : 0}} onChange={(e) => {
                    if (e){
                        handleTimeChange(e.toDate().getHours(), e.toDate().getMinutes());
                    } 
                        }
                    }
                />
        </LocalizationProvider>
    )
}
