import React from "react";
import { Container } from "@material-ui/core";
import { OneDayScheduleRow } from "./oneDayScheduleRow";
import { getDatePlusNumShifts } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { useContext } from "react";
import { DateBeingShownContext } from "../../../../../../lib/pageSpecific/schedule/dateBeingShownContext";



interface OneDayScheduleProps {
    
}
export const OneDaySchedule : React.FC<OneDayScheduleProps> = (props : OneDayScheduleProps) => {
    const {dateBeingShown} = useContext(DateBeingShownContext);
    return (
        <Container>
            {new Array(48).fill("").map((_, index) => {
                return (
                    <OneDayScheduleRow rowStartDate={getDatePlusNumShifts(dateBeingShown, index)} key={"row" + index.toString()}/>

                )
            })}
        </Container>
    )
}