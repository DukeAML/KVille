import React, {useContext} from "react";
import { DateBeingShownContext } from "./context/dateBeingShownContext";
import { getDatePlusNumShifts, getDayAbbreviation } from "../../../../../common/src/calendarAndDates/datesUtils";
import { Typography } from "@mui/material";
import { KvilleButton } from "@/components/utils/button";
import { DateChanger } from "@/components/dateRangeChanger/dateChanger";


interface DatesRowProps {

}


export const DatesRow : React.FC<DatesRowProps> = (props : DatesRowProps) => {
    const {dateBeingShown, setDateBeingShown} = useContext(DateBeingShownContext);


    return (
        <div style={{display : "flex"}}>
            {[-2, -1, 0, 1, 2].map((offset, index) => {
                let date = getDatePlusNumShifts(dateBeingShown, 48 * offset);
                if (offset != 0){
                    return (
                        <KvilleButton onClick={() => {setDateBeingShown(date)}}>
                            <Typography>{getDayAbbreviation(date)}</Typography>
                        </KvilleButton>
                    );
                } else {
                    return <DateChanger date={dateBeingShown} setDate={setDateBeingShown} includeHours={false}/>
                }
                
            })}
        </div>
    )
}