import { getDayAbbreviation } from "./dates_services.js";
import { getNumDaysBetweenDates } from "./dates_services.js";



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
 * @returns {string[]}
 */
export const get48TimeLabels = () => {
    let times = [];
    for (let i = 0; i < 48; i += 1){
        let half = "am";
        if (i >= 24){
            half = "pm";
        }
        let hour = Math.floor((i % 24) / 2).toString();
        let needs30Minutes= (i%2) == 1;
        if ((i % 24) <= 1){
            hour = "12";
        }
        if (needs30Minutes){
            times.push(hour + ":30" + half);
        } else {
            times.push(hour + ":00" + half);
        }
        
    }
    return times;
}

