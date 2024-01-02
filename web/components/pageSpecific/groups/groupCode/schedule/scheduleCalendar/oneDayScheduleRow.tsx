import React from "react";
import { ScheduleAndStartDate } from "../../../../../../../common/src/db/schedule/scheduleAndStartDate";
import { getNumSlotsBetweenDates } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { Grid } from "@mui/material";
import { ScheduleCell } from "./scheduleCell";
import { useQueryToFetchSchedule } from "../../../../../../lib/pageSpecific/schedule/scheduleHooks";
import { useRouter } from "next/dist/client/router";
import { INVALID_GROUP_CODE } from "../../../../../../../common/src/db/groupExistenceAndMembership/GroupCode";
import { EMPTY } from "../../../../../../../common/src/scheduling/slots/tenterSlot";
import { Typography } from "@material-ui/core";
import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";

interface OneDayScheduleRowProps {
    rowStartDate : Date;
}

export const OneDayScheduleRow : React.FC<OneDayScheduleRowProps> = (props : OneDayScheduleRowProps) => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    //for some reason the custom hook with queryClient.getQueryData isn't working
    //const scheduleAndStartDate : ScheduleAndStartDate | undefined = getQueryDataForSchedule(groupCode);
     const {data : scheduleAndStartDate, isLoading, isError} = useQueryToFetchSchedule(groupCode);

    if (scheduleAndStartDate){   
        return <RowGivenData scheduleAndStartDate={scheduleAndStartDate} rowStartDate={props.rowStartDate}/>
    } else {
        return null
    }  
}


interface RowGivenDataProps {
    scheduleAndStartDate : ScheduleAndStartDate;
    rowStartDate : Date;
}

const dateToTextLabel = (date : Date) : string => {

    let hours = date.getHours();
    let am = hours < 12;
    hours = hours % 12;
    if (hours % 12 === 0){
        hours = 12;
    }
    let minutes = ":00";
    if (date.getMinutes() == 30){
        minutes = ":30";
    }
    let text : string = hours + minutes;
    if (am){
        text += "am";
    } else {
        text += "pm";
    }
    if (text.length == 6){
        text = "0" + text;
    }
    return text;

}

const RowGivenData : React.FC<RowGivenDataProps> = (props : RowGivenDataProps) => {
    let scheduleIndex = getNumSlotsBetweenDates(props.scheduleAndStartDate.startDate, props.rowStartDate);
    let names : string[] = [];
    let inBounds = true;
    if ((scheduleIndex < 0) || (scheduleIndex >= props.scheduleAndStartDate.schedule.length)){
        names = ["Not Part of the Schedule"]; 
        inBounds = false;       
    } else {
        names = props.scheduleAndStartDate.getNamesAtTimeIndex(scheduleIndex);
    }
    if (names.length == 0){
        names = [EMPTY];
    }

    let timeLabelTopMargin = "-40px";
    if (props.rowStartDate.getHours() == 0 && props.rowStartDate.getMinutes() == 0){
        timeLabelTopMargin = "-33px";
    }
    return (


        <TableRow >
            <TableCell style={{position : "sticky", left : 0, backgroundColor : "white", maxWidth:"fit-content", opacity : "100%"}}>
                <Typography style={{marginTop: timeLabelTopMargin, textAlign : "left", color : "inherit", opacity : "100%", backgroundColor : "inherit"}}>
                    {dateToTextLabel(props.rowStartDate)}
                </Typography>
            </TableCell>

            {names.map((name, index) => {
                return (
                    <ScheduleCell name={name} startDate={props.rowStartDate} inBounds={inBounds} key={index}/>
                );
            })}
        </TableRow>
    )
}