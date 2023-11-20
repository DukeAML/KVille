import React, {useContext} from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { CellColorsContext } from "../../../../../../lib/pageSpecific/schedule/cellColorsContext";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";

interface ScheduleCellProps {
    name : string;
    startDate : Date;
}

export const ScheduleCell : React.FC<ScheduleCellProps> = (props : ScheduleCellProps) => {
    const {cellColorsCoordinator} = useContext(CellColorsContext);
    const {isSwappingTenter, setIsSwappingTenter, setTenterToReplace, setTimeSlotClickedOn} = useContext(TenterSwapContext)
    const handleClick = () => {
        setIsSwappingTenter(true);
        setTenterToReplace(props.name);
        setTimeSlotClickedOn(props.startDate);
    }
    return (
        <Grid item xs>
            <Paper style={{backgroundColor : cellColorsCoordinator.getColorForName(props.name), cursor : "grab"}} onClick={handleClick}>
                <Typography align="center" >{props.name}</Typography>
            </Paper>
        </Grid>
    )
}