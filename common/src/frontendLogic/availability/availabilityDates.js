import { getCurrentDate } from "../../calendarAndDates/datesUtils.js";
import { scheduleDates } from "../../../data/scheduleDates.js";
import { getTentingStartDate } from "../../calendarAndDates/tentingDates.js";


/**
 * 
 * @param {string} tentType 
 * @returns {Date} displayStartDate
 */
export const getInitialAvailabilityDisplayStartDate = (tentType) => {
    //TODO: use context to get tentType and specify the start date more closely
    //use current day, if in tenting range. Else, use first day of tenting
    const currDate = getCurrentDate();
    let startDateNow = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDay(), 0, 0);
    let firstDay = getTentingStartDate(tentType);
    let endDay = scheduleDates.endOfTenting;
    if ((startDateNow > firstDay) && (startDateNow < endDay)){
        return startDateNow;
    } else {
        return firstDay;
    }
}

/**
 * 
 * @param {string} tentType 
 * @returns {Date} displayEndDate
 */
export const getInitialAvailabilityDisplayEndDate = (tentType) => {
    let startDate = getInitialAvailabilityDisplayStartDate(tentType);
    let tentingEndDate = scheduleDates.endOfTenting;
    let startDatePlusWeek = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startDatePlusWeek < tentingEndDate){
        return startDatePlusWeek;
    } else {
        return tentingEndDate;
    }
}