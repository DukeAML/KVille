
import {weekdayAbbreviations} from "../../data/weekdayAbbreviations.js"; 


export const getCurrentDate = () => {
    return new Date(Date.now());

    
}

/**
 * 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {int} the number of 30 minute slots between the two dates, rounded to the nearest int
 */
export const getNumSlotsBetweenDates = (startDate, endDate) => {
    let diff_ms = endDate.getTime() - startDate.getTime();
    return Math.round(diff_ms / (30 * 60 * 1000));
    
}

/**
 * 
 * @param {Date} origDate 
 * @param {int} shiftsAdder 
 * @returns {Date} a Date corresponding to origDate + 30 minutes * shiftsAdder
 */
export const getDatePlusNumShifts = (origDate, shiftsAdder) => {
    return new Date(origDate.getTime() + shiftsAdder * 30 * 60 * 1000);
    
}

/**
 * returns the number of calendar days involved in the schedule
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {int} number of days involved
 */
export const getNumDaysBetweenDates = (startDate, endDate) => {
    let ms_diff = Math.abs(endDate.getTime() - startDate.getTime());
    let num_ms_in_day = 1000 * 60 * 60 * 24;
    if (ms_diff % num_ms_in_day == 0){
        return 1 + Math.ceil(ms_diff / num_ms_in_day);
    } else {
        return Math.ceil(ms_diff / num_ms_in_day);
    }
    
  
  }

/**
 * 
 * @param {Date} date
 * @returns {Date}
 */
export const getDateRoundedTo30MinSlot = (date) => {
    let origTime = date.getTime();
    let rounded30MinSlots = Math.round(origTime / (30 * 60 * 1000));

    return new Date(rounded30MinSlots * 30 * 60 * 1000);
}

/**
 * Get an abbreviated name for a date, like "Mon. 1/15"
 * @param {Date} date just needs to be the correct year, month, day. Hour and minutes don't matter
 * @returns {String} something like "Mon. 1/15"
 */
export const getDayAbbreviation = (date) => {
    let dayNum = date.getDay();
    let dayStr = weekdayAbbreviations[dayNum];
    let month = date.getMonth() + 1;
    let monthDay = date.getDate();
    return (dayStr + " " + month.toString() + "/" + monthDay.toString());
  }

