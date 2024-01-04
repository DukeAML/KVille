import React, {useContext, useState, useEffect} from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { CellColorsContext } from "../../../../../../lib/pageSpecific/schedule/cellColorsContext";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { EMPTY } from "../../../../../../../common/src/scheduling/slots/tenterSlot";
import { useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { useGroupCode } from "@/lib/shared/useGroupCode";

interface ScheduleCellProps {
    name : string;
    startDate : Date;
    inBounds : boolean;
    color : string;
}

export const ScheduleCell : React.FC<ScheduleCellProps> = (props : ScheduleCellProps) => {
    const {cellColorsCoordinator} = useContext(CellColorsContext);
    const {isSwappingTenter, setIsSwappingTenter, setTenterToReplace, setTimeSlotClickedOn} = useContext(TenterSwapContext)
    const handleClick = () => {
        if (props.inBounds){
            console.log(props.startDate);
            setIsSwappingTenter(true);
            setTenterToReplace(props.name);
            setTimeSlotClickedOn(props.startDate);
        }  
    }

    return (
        <TableCell style={{
            height : "100%", 
            backgroundColor : props.color, 
            cursor : "grab",
            borderLeft : "1px solid black",
            borderRight : "1px solid black",
            borderTop : (props.startDate.getMinutes() == 0) ? "2px solid black " : "2px dashed black",
        }} onClick={handleClick}>
            <Typography noWrap align="center" >{props.name}</Typography>
            
        </TableCell>
    )
}