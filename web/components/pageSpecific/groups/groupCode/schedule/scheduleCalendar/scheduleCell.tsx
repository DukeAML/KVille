import React, {useContext, useState, useEffect} from "react";
import { Typography } from "@mui/material";
import { TenterSwapContext } from "@/lib/context/schedule/tenterSwapContext";
import { TableCell } from "@material-ui/core";
import { ROW_HEIGHT, ROW_PADDING_AND_MARGIN, ROW_TEXT_FONT_SIZE } from "./oneDayScheduleRow";
import { checkIfNameIsForGracePeriod } from "@/lib/schedulingAlgo/rules/gracePeriods";

interface ScheduleCellProps {
    name : string;
    startDate : Date;
    inBounds : boolean;
    color : string;
}

export const ScheduleCell : React.FC<ScheduleCellProps> = (props : ScheduleCellProps) => {
    const {isSwappingTenter, setIsSwappingTenter, setTenterToReplace, setTimeSlotClickedOn} = useContext(TenterSwapContext)
    const handleClick = () => {
        setText(props.name);
        if (props.inBounds){
            setIsSwappingTenter(true);
            setTenterToReplace(props.name);
            setTimeSlotClickedOn(props.startDate);
        }  
    }

    const [text, setText] = useState<string>(checkIfNameIsForGracePeriod(props.name) ? "Grace Period..." : props.name);
    
    useEffect(() => {
        setText(checkIfNameIsForGracePeriod(props.name) ? "Grace Period..." : props.name);
    }, [props.name]);



    return (
        <TableCell style={{
            backgroundColor : props.color, 
            cursor : "grab",
            borderLeft : "1px solid black",
            borderRight : "1px solid black",
            borderTop : (props.startDate.getMinutes() == 0) ? "2px solid black " : "1px dashed black",
            paddingBottom : ROW_PADDING_AND_MARGIN,
            paddingTop : ROW_PADDING_AND_MARGIN,
            height : ROW_HEIGHT
        }} onClick={handleClick}>
            <Typography noWrap align="center" style={{ margin : 0, padding : 0, fontSize: ROW_TEXT_FONT_SIZE, boxSizing : "border-box"}} >{text}</Typography>
    
            
        </TableCell>
    )
}