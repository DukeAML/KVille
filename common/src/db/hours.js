import { fetchGroupSchedule } from "./schedule/schedule.js";

export const HOURS_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group Does not Exist"
}

/**
 * 
 * @param {String} groupCode 
 * @param {Date} dateRangeStart 
 * @param {Date} dateRangeEnd 
 * @returns {Promise<{dayHoursPerPersonInRange : {[key : string] : number}, nightHoursPerPersonInRange : {[key : string] : number}, dayHoursPerPersonEntire : {[key : string] : number}, nightHoursPerPersonEntire : {[key : string] : number}}>}
 */
export async function fetchHoursPerPersonInDateRange(groupCode, dateRangeStart, dateRangeEnd) {
    const schedule = await fetchGroupSchedule(groupCode);
    let rangeResult = schedule.getHoursPerPersonInDateRange(dateRangeStart, dateRangeEnd);
    const dayHoursPerPersonInRange = rangeResult.dayHoursPerPerson;
    const nightHoursPerPersonInRange = rangeResult.nightHoursPerPerson;

    let fullResult = schedule.getHoursPerPersonWholeSchedule();
    const dayHoursPerPersonEntire = fullResult.dayHoursPerPerson;
    const nightHoursPerPersonEntire = fullResult.nightHoursPerPerson;

    return {dayHoursPerPersonInRange, nightHoursPerPersonInRange, dayHoursPerPersonEntire, nightHoursPerPersonEntire}
}

/**
 * 
 * @param {String} groupCode 
 * @returns {Promise<{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}>}
 */
export async function fetchHoursPerPerson(groupCode){
    const schedule = await fetchGroupSchedule(groupCode);
    return schedule.getHoursPerPersonWholeSchedule();
}

