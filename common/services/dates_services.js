const weekdayAbbreviations =require("../data/weekdayAbbreviations.json");

const getCurrentDate = () => {
    return new Date(Date.now());
    
}

/**
 * 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {int} the number of 30 minute slots between the two dates, rounded to the nearest int
 */
const getNumSlotsBetweenDates = (startDate, endDate) => {
    let diff_ms = endDate.getTime() - startDate.getTime();
    return Math.round(diff_ms / (30 * 60 * 1000));
    
}

/**
 * 
 * @param {Date} origDate 
 * @param {int} shiftsAdder 
 * @returns {Date} a Date corresponding to origDate + 30 minutes * shiftsAdder
 */
const getDatePlusNumShifts = (origDate, shiftsAdder) => {
    return new Date(origDate.getTime() + shiftsAdder * 30 * 60 * 1000);
    
}

/**
 * returns the number of calendar days involved in the schedule
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {int} number of days involved
 */
const getNumDaysBetweenDates = (startDate, endDate) => {
    let ms_diff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(ms_diff / (1000 * 60 * 60 * 24));
  
  }

/**
 * 
 * @param {Date} date
 * @returns Date 
 */
const getDateRoundedTo30MinSlot = (date) => {
    let origTime = date.getTime();
    let roundedMinutes = Math.round(origTime / (60 * 1000));
    return new Date(roundedMinutes * 60 * 1000);
}

/**
 * Get an abbreviated name for a date, like "Mon. 1/15"
 * @param {Date} date just needs to be the correct year, month, day. Hour and minutes don't matter
 * @returns {String} something like "Mon. 1/15"
 */
const getDayAbbreviation = (date) => {
    let dayNum = date.getDay();
    let dayStr = weekdayAbbreviations[dayNum];
    let month = date.getMonth() + 1;
    let monthDay = date.getDate();
    return (dayStr + " " + month.toString() + "/" + monthDay.toString());
  }

module.exports = { getCurrentDate, getNumSlotsBetweenDates, getDatePlusNumShifts, getNumDaysBetweenDates, getDateRoundedTo30MinSlot, getDayAbbreviation};