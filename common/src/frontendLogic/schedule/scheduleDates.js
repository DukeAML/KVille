import { getCurrentDate, getDatePlusNumShifts } from "../../calendarAndDates/datesUtils";
import { scheduleDates } from "../../../data/scheduleDates";

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

export const getDefaultDisplayDateRangeStartDateWithoutSchedule = () => {
  let currentDate = getCurrentDate();
  if (currentDate < scheduleDates.startOfTenting){
    return scheduleDates.startOfTenting;
  } else if (currentDate > scheduleDates.endOfTenting){
    return scheduleDates.startOfTenting;
  } else {
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    return currentDate;
  }
}