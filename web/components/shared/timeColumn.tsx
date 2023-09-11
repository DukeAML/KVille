import { Typography } from "@mui/material";
import React from "react";

interface TimeColumnProps {

}
export const TimeColumn : React.FC<TimeColumnProps> = (props : TimeColumnProps) => {
    const arr48 = new Array(48).fill("");
    return (
        <div>
            <Typography>hi</Typography>
            <Typography>hi2</Typography>
            {arr48.map((_, index) => {
                let text = "";
                if (index % 2 === 0){
                    text = index.toFixed();
                }
                return <Typography>{text}</Typography>
            })}
        </div>
    )

}