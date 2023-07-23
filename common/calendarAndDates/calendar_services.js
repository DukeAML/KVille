import { getDayAbbreviation } from "../services/dates_services";
import { getNumDaysBetweenDates } from "../services/dates_services";
const  Helpers = require("../Scheduling/helpers");

/**
 * Get the day abbreviations for each day in the schedule
 * @param {Date} startDate
 * @param {int} numTimeSlots
 * @returns {string[]} something like ["Mon. 1/15", "Tue. 1/16", "Wed. 1/17"]
 */
export const getCalendarColumnTitles = (startDate, endDate) =>{
    let numDays = getNumDaysBetweenDates(startDate, endDate);

    let titles= [];
    for (let i = 0; i < numDays; i++){
        let newDate = new Date(startDate.getTime() + i*24*60*60*1000);
        titles.push(getDayAbbreviation(newDate));
    }
    return titles;
}

/**
 * 
 * @param {string} tentType 
 * @returns {Date} displayStartDate
 */
export const getInitialAvailabilityDisplayStartDate = (tentType) => {
    //TODO: use context to get tentType and specify the start date more closely
    //use current day, if in tenting range. Else, use first day of tenting
    const currDate = new Date(Date.now());
    let startDateNow = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDay(), 0, 0);
    let firstDay = Helpers.getTentingStartDate(tentType);
    let endDay = Helpers.getTentingEndDate();
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
    let tentingEndDate = Helpers.getTentingEndDate();
    let startDatePlusWeek = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startDatePlusWeek < tentingEndDate){
        return startDatePlusWeek;
    } else {
        return tentingEndDate;
    }
}