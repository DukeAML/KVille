import React from "react";
import { useContext } from "react";
import { UserContext } from "@/context/userContext";
import { useQuery, useQueryClient } from "react-query";
import { ScheduleAndStartDate } from "../../../../../../common/src/Scheduling/scheduleAndStartDate";
import { getNumSlotsBetweenDates } from "../../../../../../common/src/calendarAndDates/datesUtils";
import { Grid } from "@mui/material";
import { ScheduleCell } from "./scheduleCell";
import { fetchGroupSchedule } from "../../../../../../common/src/db/schedule";
import { getQueryKeyNameForGroupCode, getQueryDataForSchedule } from "../hooks/scheduleHooks";
import { GroupContext } from "@/context/groupContext";
import { useRouter } from "next/dist/client/router";
import { INVALID_GROUP_CODE } from "@/pages/_app";
interface OneDayScheduleRowProps {
    rowStartDate : Date;
}

export const OneDayScheduleRow : React.FC<OneDayScheduleRowProps> = (props : OneDayScheduleRowProps) => {
    const { userID} = useContext(UserContext); //TODO: refactor out group context

    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    //const {isLoading, isError} = useQuery<ScheduleAndStartDate, Error>(getQueryKeyNameForGroupCode(groupCode), ()=>fetchGroupSchedule(groupCode));
    const queryClient = useQueryClient();
    const scheduleAndStartDate : ScheduleAndStartDate | undefined = getQueryDataForSchedule(groupCode);

    
    if (scheduleAndStartDate){
        
        return <RowGivenData scheduleAndStartDate={scheduleAndStartDate ? scheduleAndStartDate : new ScheduleAndStartDate([""], new Date(Date.now()))} rowStartDate={props.rowStartDate}/>
    } else {
        return <div>"what hte heck"</div>
    }
    
}


interface RowGivenDataProps {
    scheduleAndStartDate : ScheduleAndStartDate;
    rowStartDate : Date;
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
        names = ["empty"];
    }
    return (
        <Grid item container spacing={0}>
            {names.map((name, index) => {
                return (
                    <ScheduleCell name={name} key={index}/>
                );
            })}
        </Grid>
    )
}