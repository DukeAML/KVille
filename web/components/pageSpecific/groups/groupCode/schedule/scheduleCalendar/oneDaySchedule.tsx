import React, {useEffect, useState} from "react";
import { Container, Stack, Typography } from "@mui/material";
import { OneDayScheduleRow } from "./oneDayScheduleRow";
import { getDatePlusNumShifts } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { useContext } from "react";
import { DateBeingShownContext } from "../../../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { useGroupCode } from "@/lib/shared/useGroupCode";


interface OneDayScheduleProps {
    
}
export const OneDaySchedule : React.FC<OneDayScheduleProps> = (props : OneDayScheduleProps) => {
    const {dateBeingShown} = useContext(DateBeingShownContext);
    const groupCode = useGroupCode();
    const {data : schedule, isLoading} = useQueryToFetchSchedule(groupCode);
    const [maxWidth, setMaxWidth] = useState<string>("md")
    useEffect(() => {
        if (!isLoading && schedule){
            let maxPpl = schedule.getMaxNumPplOnDay(dateBeingShown);
            console.log("max ppl is " + maxPpl);
            if (maxPpl <= 2){
                setMaxWidth("xs");
            } else if (maxPpl <= 4){
                setMaxWidth("sm");
            } else {
                setMaxWidth("md")
            }
        }
        console.log("max widht is " + maxWidth + " and max ppl is " + schedule?.getMaxNumPplOnDay(dateBeingShown));

    }, [dateBeingShown, schedule])
    
    return (
        <Container maxWidth={maxWidth} style={{alignContent : "left", justifyContent:"left"}}>

            <TableContainer >
                <Table>
                    <TableBody>
                        {new Array(48).fill("").map((_, index) => <OneDayScheduleRow rowStartDate={getDatePlusNumShifts(dateBeingShown, index)} key={"row" + index.toString()}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
            
            
        </Container>
    )
}

