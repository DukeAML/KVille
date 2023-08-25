import { getDatePlusNumShifts, getCurrentDate } from "../../calendarAndDates/datesUtils";
import { Helpers } from "../../Scheduling/helpers.js";

/**
 * 
 * @param {String[]} groupSchedule 
 * @param {Date} groupScheduleStartDate 
 * @returns {Date}
 */
export const getDefaultAssignDateRangeStartDate = (groupSchedule, groupScheduleStartDate) => {
    for (let i = 0; i < groupSchedule.length; i += 1){
        let names = groupSchedule[i].split(' ');
        for (let j = 0; j < names.length; j+= 1){
            if (names[j] == "empty")
                return getDatePlusNumShifts(groupScheduleStartDate, i);
      }
    }

    let currentDate = getCurrentDate();
    if (currentDate < groupScheduleStartDate){
        return groupScheduleStartDate;
    } else if (currentDate >= getDatePlusNumShifts(groupScheduleStartDate, groupSchedule.length)){
        return groupScheduleStartDate;
    } else {
        return currentDate;
    }

}

/**
 * 
 * @param {string[]} groupSchedule 
 * @param {Date} groupScheduleStartDate 
 * @returns {Date}
 */
export const getDefaultAssignDateRangeEndDate = (groupSchedule, groupScheduleStartDate) => {
    let correspondingStartDate = getDefaultAssignDateRangeStartDate(groupSchedule, groupScheduleStartDate);
    let startDatePlusWeek = getDatePlusNumShifts(correspondingStartDate, 336);
    let endOfTenting = Helpers.getTentingEndDate();
   
    if (startDatePlusWeek <= endOfTenting) {
        return startDatePlusWeek;
    } else {
        return endOfTenting;
    }
}

/**
 * 
 * @param {Date} newStartDate 
 * @param {Date} newEndDate 
 * @param {Date} groupScheduleStartDate
 * @returns {{successful : boolean, message : string}}
 */
export const validateAssignTentersDateRange = (newStartDate, newEndDate, groupScheduleStartDate) => {
    if (newStartDate < groupScheduleStartDate){
        return {successful: false, message: "Start date of " + newStartDate.getTime() + " must be at least " + groupScheduleStartDate.getTime()};
    } else if (newEndDate > Helpers.getTentingEndDate()){
        return {succesful: false, message: "End date cannot occur after the end of tenting"};
    } else if (newEndDate <= newStartDate){
        return {succesful: false, message: "End date must be later than the start date"};
    } else {
        return {successful: true, message: "Date Range is valid"}
    }
}
