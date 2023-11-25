import React, {useContext} from "react";
import { DateBeingShownContext } from "../../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { getDatePlusNumShifts, getDayAbbreviation } from "../../../../../../common/src/calendarAndDates/datesUtils";
import { KvilleButton } from "@/components/shared/utils/button";
import { DateChanger } from "@/components/shared/dateRangeChanger/dateChanger";
import { useCheckIfScreenIsNarrow } from "@/lib/shared/windowProperties";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { Stack } from "@mui/material";

interface DatesRowProps {

}


export const DatesRow : React.FC<DatesRowProps> = (props : DatesRowProps) => {
    const {dateBeingShown, setDateBeingShown} = useContext(DateBeingShownContext);
    const {isNarrow} = useCheckIfScreenIsNarrow();

    if (isNarrow){
        return (
            <div style={{textAlign : "center", marginTop : 20, marginBottom : 20}}>
                 <Stack direction={"row"} alignItems={"center"} spacing={2} >
                <ArrowLeft onClick={() => setDateBeingShown(getDatePlusNumShifts(dateBeingShown, -48))}/>
                <DateChanger text="Date Shown" date={dateBeingShown} setDate={setDateBeingShown} includeHours={false}/>
                <ArrowRight onClick={() => setDateBeingShown(getDatePlusNumShifts(dateBeingShown, 48))}/>
            </Stack>
            </div>
           

        );
    } else {
        return (
            <div style={{display : "flex", marginTop: 20}}>
                {[-2, -1, 0, 1, 2].map((offset, index) => {
                    let date = getDatePlusNumShifts(dateBeingShown, 48 * offset);
                    if (offset != 0){
                        return (
                            <KvilleButton onClick={() => {setDateBeingShown(date)}} text={getDayAbbreviation(date)} key={index}/>
    
                        );
                    } else {
                        return <DateChanger text={"Date Shown"} date={dateBeingShown} setDate={setDateBeingShown} includeHours={false} key={index}/>
                    }
                    
                })}
            </div>
        )
    }
}

