import React from "react";
import { useContext } from "react";
import { UserContext } from "@/lib/shared/context/userContext";
import { useQuery, useQueryClient } from "react-query";
import { ScheduleAndStartDate } from "../../../../../../../common/src/scheduling/scheduleAndStartDate";
import { getNumSlotsBetweenDates } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { Grid } from "@mui/material";
import { ScheduleCell } from "./scheduleCell";
import { fetchGroupSchedule } from "../../../../../../../common/src/db/schedule";
import { getQueryKeyNameForGroupCode, useGetQueryDataForSchedule, useQueryToFetchSchedule } from "../../../../../../lib/pageSpecific/schedule/scheduleHooks";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { useRouter } from "next/dist/client/router";
import { INVALID_GROUP_CODE } from "@/pages/_app";
import { EMPTY } from "../../../../../../../common/src/scheduling/tenterSlot";
import { Typography } from "@material-ui/core";
interface OneDayScheduleRowProps {
    rowStartDate : Date;
}

export const OneDayScheduleRow : React.FC<OneDayScheduleRowProps> = (props : OneDayScheduleRowProps) => {
    const { userID} = useContext(UserContext); //TODO: refactor out group context

    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    //for some reason the custom hook with queryClient.getQueryData isn't working
    //const scheduleAndStartDate : ScheduleAndStartDate | undefined = getQueryDataForSchedule(groupCode);
     const {data : scheduleAndStartDate, isLoading, isError} = useQueryToFetchSchedule(groupCode);


    
    if (scheduleAndStartDate){
        
        return <RowGivenData scheduleAndStartDate={scheduleAndStartDate ? scheduleAndStartDate : new ScheduleAndStartDate([""], new Date(Date.now()))} rowStartDate={props.rowStartDate}/>
    } else {
        return <div>what hte heck</div>
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
    let text : string = hours + ":00";
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
    if ((scheduleIndex < 0) || (scheduleIndex >= props.scheduleAndStartDate.schedule.length)){
        names = ["Not Part of the Schedule"];        
    } else {
        names = props.scheduleAndStartDate.schedule[scheduleIndex].split(" ");
    }
    if (names.length == 0){
        names = [EMPTY];
    }
    return (
        <Grid item container spacing={0}>
            <Typography style={{marginTop: '-10px', textAlign : "right", color : (props.rowStartDate.getMinutes() == 0 ? "inherit" : "transparent")}}>
                {dateToTextLabel(props.rowStartDate)}
            </Typography>

            {names.map((name, index) => {
                return (
                    <ScheduleCell name={name} key={index}/>
                );
            })}
        </Grid>
    )
}