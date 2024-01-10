import React, {useEffect, useState} from "react";
import { Container, Stack, Typography } from "@mui/material";
import { OneDayScheduleRow } from "./oneDayScheduleRow";
import { getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils";
import { useContext } from "react";
import { DateBeingShownContext } from "@/lib/context/schedule/dateBeingShownContext";
import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks";
import { useGroupCode } from "@/lib/hooks/useGroupCode";


interface OneDayScheduleProps {
    
}
export const OneDaySchedule : React.FC<OneDayScheduleProps> = (props : OneDayScheduleProps) => {
    const {dateBeingShown} = useContext(DateBeingShownContext);
    const groupCode = useGroupCode();
    const {data : schedule, isLoading} = useQueryToFetchSchedule(groupCode);
    const [maxWidth, setMaxWidth] = useState<"xs" | "md" | "sm">("md")
    useEffect(() => {
        if (!isLoading && schedule){
            let maxPpl = schedule.getMaxNumPplOnDay(dateBeingShown);
            if (maxPpl <= 2){
                setMaxWidth("xs");
            } else if (maxPpl <= 4){
                setMaxWidth("sm");
            } else {
                setMaxWidth("md")
            }
        }

    }, [dateBeingShown, schedule])
    
    return (
        <Container maxWidth={maxWidth} style={{alignContent : "left", justifyContent:"left"}}>

            <TableContainer >
                <Table>
                    <TableBody>
                        {new Array(48).fill("").map((_, index) => <OneDayScheduleRow rowStartDate={getDatePlusNumShifts(dateBeingShown, index)} key={"row" + getDatePlusNumShifts(dateBeingShown, index).toLocaleString()}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
            
            
        </Container>
    )
}

