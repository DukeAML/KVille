import React, {useContext} from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { CellColorsContext } from "../context/cellColorsContext";

interface ScheduleCellProps {
    name : string;
}

export const ScheduleCell : React.FC<ScheduleCellProps> = (props : ScheduleCellProps) => {
    const {cellColorsCoordinator} = useContext(CellColorsContext);
    return (
        <Grid item xs>
            <Paper style={{backgroundColor : cellColorsCoordinator.getColorForName(props.name)}}>
                <Typography align="center">{props.name}</Typography>
            </Paper>
        </Grid>
    )
}