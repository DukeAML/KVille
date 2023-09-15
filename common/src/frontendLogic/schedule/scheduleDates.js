import { getCurrentDate, getDatePlusNumShifts } from "../../calendarAndDates/datesUtils";

/**
 * 
 * @param {ScheduleAndStartDate} groupScheduleAndStartDate 
 * @returns {Date}
 */
export const getDefaultDisplayDateRangeStartDate = (groupScheduleAndStartDate) => {
    let currentDate = getCurrentDate();
    if (currentDate < groupScheduleAndStartDate.startDate){
      return groupScheduleAndStartDate.startDate;
    } else if (currentDate >= getDatePlusNumShifts(groupScheduleAndStartDate.startDate, groupScheduleAndStartDate.schedule.length)){
      return groupScheduleAndStartDate.startDate;
    } else {
      return currentDate;
    }
  }