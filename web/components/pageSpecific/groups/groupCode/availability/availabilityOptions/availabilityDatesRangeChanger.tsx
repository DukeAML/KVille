import React, { useState } from "react";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import { useContext } from "react";
import { AvailabilityPageContext } from "@/lib/pageSpecific/availability/AvailabilityPageContextType";
import { Container } from "@mui/material";
import { ErrorMessage } from "@/components/shared/utils/errorMessage";
import { getDatePlusNumShifts } from "../../../../../../../common/src/calendarAndDates/datesUtils";

export const AvailabilityDatesRangeChanger : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate } = useContext(AvailabilityPageContext);
    const NO_ERROR = "";
    const [errorMsg, setErrorMsg] = useState<string>(NO_ERROR);

    return (
        <Container>
            <DateRangeChanger includeHours={false}
                externalStartDate={calendarStartDate}
                externalEndDate={calendarEndDate}
                submitNewDateRange={(startDate : Date, endDate : Date) => {
                    if (endDate <= startDate){
                        setErrorMsg("End date must come after the start date");
                        return;
                    } else {
                        setCalendarStartDate(startDate);
                        setCalendarEndDate(endDate);
                        setErrorMsg(NO_ERROR);
                    }
                }}

            />
            {errorMsg === NO_ERROR ? null : <ErrorMessage msg={errorMsg}/>}
        </Container>
    )
}