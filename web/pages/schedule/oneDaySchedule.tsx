import React from "react";
import { Container } from "@material-ui/core";

interface OneDayScheduleProps {
    date : Date;
    schedule : string[]
}
export const OneDaySchedule : React.FC<OneDayScheduleProps> = (props : OneDayScheduleProps) => {
    return (
        <Container>
            {props.schedule.map((name, index) => {
                return (
                    <div key={index + "scheduleRow"}>{name}</div>
                )
            })}
        </Container>
    )
}