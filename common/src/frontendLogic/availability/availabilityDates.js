import { getCurrentDate } from "../../calendarAndDates/datesUtils.js";
import { getScheduleDates } from "../../../data/scheduleDates.js";
import { getTentingStartDate } from "../../calendarAndDates/tentingDates.js";


/**
 * 
 * @param {string} tentType 
 * @param {number}  year
 * @returns {Date} displayStartDate
 */
export const getInitialAvailabilityDisplayStartDate = (tentType, year) => {
    //TODO: use context to get tentType and specify the start date more closely
    //use current day, if in tenting range. Else, use first day of tenting
    const currDate = getCurrentDate();
    let startDateNow = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDay(), 0, 0);
    let firstDay = getTentingStartDate(tentType, year);
    let endDay = getScheduleDates(year).endOfTenting;
    if ((startDateNow > firstDay) && (startDateNow < endDay)){
        return startDateNow;
    } else {
        return firstDay;
    }
}

/**
 * 
 * @param {string} tentType 
 * @param {number} year
 * @returns {Date} displayEndDate
 */
export const getInitialAvailabilityDisplayEndDate = (tentType, year) => {
    let startDate = getInitialAvailabilityDisplayStartDate(tentType, year);
    let tentingEndDate = getScheduleDates(year).endOfTenting;
    let startDatePlusWeek = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startDatePlusWeek < tentingEndDate){
        return startDatePlusWeek;
    } else {
        return tentingEndDate;
    }
}