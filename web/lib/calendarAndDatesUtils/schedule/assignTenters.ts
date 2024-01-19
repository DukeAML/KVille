import { getDatePlusNumShifts, getCurrentDate } from "@/lib/calendarAndDatesUtils/datesUtils";
import { EMPTY } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { ScheduleData } from "@/lib/controllers/scheduleData";


export const getDefaultAssignDateRangeStartDate = (schedule : ScheduleData) : Date => {
    for (let timeIndex = 0; timeIndex < schedule.schedule.length; timeIndex += 1){
        let names = schedule.getNamesAtTimeIndex(timeIndex);
        for (let namesIndex = 0; namesIndex < names.length; namesIndex+= 1){
            if (names[namesIndex] == EMPTY)
                return getDatePlusNumShifts(schedule.startDate, timeIndex);
      }
    }

    let currentDate = getCurrentDate();
    if (currentDate < schedule.startDate){
        return schedule.startDate;
    } else if (currentDate >= getDatePlusNumShifts(schedule.startDate, schedule.schedule.length)){
        return schedule.startDate;
    } else {
        return currentDate;
    }

}


export const getDefaultAssignDateRangeEndDate = (schedule : ScheduleData) : Date => {
    let correspondingStartDate = getDefaultAssignDateRangeStartDate(schedule);
    let startDatePlusWeek = getDatePlusNumShifts(correspondingStartDate, 336);
    let endOfTenting = getScheduleDates(schedule.startDate.getFullYear()).endOfTenting;
   
    if (startDatePlusWeek <= endOfTenting) {
        return startDatePlusWeek;
    } else {
        return endOfTenting;
    }
}



interface ValidationStatus{
    successful : boolean;
    message : string;
}
export const validateAssignTentersDateRange = (newStartDate : Date, newEndDate : Date, groupScheduleStartDate : Date) : ValidationStatus => {
    let endOfTenting = getScheduleDates(groupScheduleStartDate.getFullYear()).endOfTenting;
    if (newStartDate < groupScheduleStartDate){
        return {successful: false, message: "Start date must be at least " + groupScheduleStartDate.toLocaleString()};
    } else if (newEndDate > endOfTenting){
        return {successful: false, message: "End date cannot occur after the end of tenting on " + endOfTenting.toLocaleString()};
    } else if (newEndDate <= newStartDate){
        return {successful: false, message: "End date must be later than the start date"};
    } else {
        return {successful: true, message: "Date Range is valid"}
    }
}
