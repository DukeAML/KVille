import { DateBeingShownContext } from "@/lib/context/schedule/dateBeingShownContext"
import { Typography } from "@mui/material"
import { useContext } from "react"

export const DatesWarnings = () => {
    const {dateBeingShown} = useContext(DateBeingShownContext);
    const year = dateBeingShown.getFullYear();
    const month = dateBeingShown.getMonth();
    const date = dateBeingShown.getDate();
    console.log(year);
    console.log(month);
    console.log(date);
    if (year === 2024){
        if (month === 1){
            if (date === 23 || date === 24){
                return (
                    <Typography style={{fontWeight : "bold", marginTop : 8}} align="center">
                        P Checks will occur the night of Friday 2/23 - Saturday 2/24. They are not accounted for in this schedule, since 
                        we did not know when exactly they would start/end. 
                    </Typography>
                )
            }
        } else if (month === 2 && date == 2){
            return (
                <Typography style={{fontWeight : "bold", marginTop : 8}} align="center">
                    Tenting ends at 4:00pm on March 2nd. Due to a minor bug, the end date shown here for white tents is 11:00am. 
                </Typography>
            );
        }
    }
    return null;
}