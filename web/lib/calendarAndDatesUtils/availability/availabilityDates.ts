import { getCurrentDate, getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils";
import { getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { getTentingStartDate } from "@/lib/calendarAndDatesUtils/tentingDates";


export const getInitialAvailabilityDisplayStartDate = (tentType : string, year : number) : Date => {
    //TODO: use context to get tentType and specify the start date more closely
    //use current day, if in tenting range. Else, use first day of tenting
    const currDate = getCurrentDate();
    let startDateNow = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0, 0);
    let firstDay = getTentingStartDate(tentType, year);
    let endDay = getScheduleDates(year).endOfTenting;
    if ((startDateNow > firstDay) && (startDateNow < endDay)){
        return startDateNow;
    } else {
        let firstDayMidnight = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate(), 0, 0);
        return firstDayMidnight;
    }
}


export const getInitialAvailabilityDisplayEndDate = (tentType : string, year : number) : Date => {
    let startDate = getInitialAvailabilityDisplayStartDate(tentType, year);
    let tentingEndDate = getScheduleDates(year).endOfTenting;
    let startDatePlusWeek = getDatePlusNumShifts(startDate, 7 * 48);

    let tentativeEndDate = startDatePlusWeek;
    if (startDatePlusWeek < tentingEndDate){
        tentativeEndDate = startDatePlusWeek;
    } else {
        tentativeEndDate =  tentingEndDate;
    }

    return new Date(tentativeEndDate.getFullYear(), tentativeEndDate.getMonth(), tentativeEndDate.getDate(), 0, 0);

}