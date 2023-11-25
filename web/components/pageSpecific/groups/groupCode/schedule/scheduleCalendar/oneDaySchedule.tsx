import React from "react";
import { Container, Stack, Typography } from "@mui/material";
import { OneDayScheduleRow } from "./oneDayScheduleRow";
import { getDatePlusNumShifts } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { useContext } from "react";
import { DateBeingShownContext } from "../../../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";


interface OneDayScheduleProps {
    
}
export const OneDaySchedule : React.FC<OneDayScheduleProps> = (props : OneDayScheduleProps) => {
    const {dateBeingShown} = useContext(DateBeingShownContext);
    return (
        <Container maxWidth="md">

            <TableContainer>
                <Table>
                    <TableBody>
                        {new Array(48).fill("").map((_, index) => <OneDayScheduleRow rowStartDate={getDatePlusNumShifts(dateBeingShown, index)} key={"row" + index.toString()}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
            
            
        </Container>
    )
}

