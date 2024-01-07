import { getCurrentDate, getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils";
import { getScheduleDates, CURRENT_YEAR } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";

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
  let scheduleDates = getScheduleDates(CURRENT_YEAR);
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


/**
 * 
 * @param {string} tentType
 * @param {number} year 
 * @returns {Date} displayDate
 */
export const getDefaultDisplayDateGivenTentType = (tentType, year=CURRENT_YEAR) => {
  let scheduleDates = getScheduleDates(year);
  let startOfTenting = scheduleDates.startOfBlack
  if (tentType === TENTING_COLORS.BLUE){
    startOfTenting = scheduleDates.startOfBlue;
  } else if (tentType === TENTING_COLORS.WHITE){
    startOfTenting = scheduleDates.startOfWhite;
  }
  let currentDate = getCurrentDate();
  if (currentDate < startOfTenting){
    return startOfTenting;
  } else if (currentDate > scheduleDates.endOfTenting){
    return startOfTenting;
  } else {
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    return currentDate;
  }


}