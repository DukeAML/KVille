import React from "react";
import dayjs from "dayjs";


import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Container } from "@material-ui/core";

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
                            props.setDate(newDate.toDate());
                        }
                    }}
                />
            </LocalizationProvider>
        </Container>
    )
}