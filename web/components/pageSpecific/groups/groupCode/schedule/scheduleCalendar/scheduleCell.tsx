import React, {useContext} from "react";
import { Typography } from "@mui/material";
import { TenterSwapContext } from "@/lib/context/schedule/tenterSwapContext";
import { TableCell } from "@material-ui/core";
import { ROW_PADDING_AND_MARGIN } from "./oneDayScheduleRow";


interface ScheduleCellProps {
    name : string;
    startDate : Date;
    inBounds : boolean;
    color : string;
}

export const ScheduleCell : React.FC<ScheduleCellProps> = (props : ScheduleCellProps) => {
    const {isSwappingTenter, setIsSwappingTenter, setTenterToReplace, setTimeSlotClickedOn} = useContext(TenterSwapContext)
    const handleClick = () => {
        if (props.inBounds){
            setIsSwappingTenter(true);
            setTenterToReplace(props.name);
            setTimeSlotClickedOn(props.startDate);
        }  
    }

    return (
        <TableCell style={{
            backgroundColor : props.color, 
            cursor : "grab",
            borderLeft : "1px solid black",
            borderRight : "1px solid black",
            borderTop : (props.startDate.getMinutes() == 0) ? "2px solid black " : "2px dashed black",
            margin : ROW_PADDING_AND_MARGIN,
            padding : ROW_PADDING_AND_MARGIN,
            height : 20
        }} onClick={handleClick}>
            <Typography noWrap align="center" style={{ margin : 0, padding : 0}} >{props.name}</Typography>
    
            
        </TableCell>
    )
}