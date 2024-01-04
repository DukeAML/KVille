import React, {useContext} from "react";
import { Typography } from "@mui/material";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { TableCell } from "@material-ui/core";


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
            console.log(props.startDate);
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
        }} onClick={handleClick}>
            <Typography noWrap align="center" style={{ margin: '0', padding: '0px' }} >{props.name}</Typography>
            
        </TableCell>
    )
}