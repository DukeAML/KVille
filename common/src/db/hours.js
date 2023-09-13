import { firestore } from "./firebase_config.js";
import { ScheduleAndStartDate } from "./schedule/scheduleAndStartDate.js";
import { getGroupMembersByGroupCode } from "./groupExistenceAndMembership/groupMembership.js";

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
    let allMembers = await getGroupMembersByGroupCode(groupCode).catch((error) => {throw new Error(HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST)});
    allMembers = allMembers.map((member) => member.username);
    let groupRef = firestore.collection('groups').doc(groupCode);
    let dayHoursPerPersonInRange = {};
    let nightHoursPerPersonInRange = {};
    let dayHoursPerPersonEntire = {};
    let nightHoursPerPersonEntire = {};
    const group = await groupRef.get();
    if (group.exists){
        let prevSchedule = group.data().groupSchedule;
        let groupScheduleStartDate = group.data().groupScheduleStartDate.toDate();
        let scheduleAndDateObj = new ScheduleAndStartDate(prevSchedule, groupScheduleStartDate)
        let rangeResult = scheduleAndDateObj.getHoursPerPersonInDateRange(dateRangeStart, dateRangeEnd, allMembers);
        dayHoursPerPersonInRange = rangeResult.dayHoursPerPerson;
        nightHoursPerPersonInRange = rangeResult.nightHoursPerPerson;
    
        let fullResult = scheduleAndDateObj.getHoursPerPersonWholeSchedule(allMembers);
        dayHoursPerPersonEntire = fullResult.dayHoursPerPerson;
        nightHoursPerPersonEntire = fullResult.nightHoursPerPerson;

    } else {
        throw new Error(HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
    

    return {dayHoursPerPersonInRange, nightHoursPerPersonInRange, dayHoursPerPersonEntire, nightHoursPerPersonEntire}
}

/**
 * 
 * @param {String} groupCode 
 * @returns {Promise<{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}>}
 */
export async function fetchHoursPerPerson(groupCode){
    let allMembers = await getGroupMembersByGroupCode(groupCode).catch((error) => {throw new Error(HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST)});
    allMembers = allMembers.map((member) => member.username);
    let groupRef = firestore.collection('groups').doc(groupCode);
    let dayHoursPerPerson = {};
    let nightHoursPerPerson = {};
    const group = await groupRef.get();
    if (group.exists){
        let prevSchedule = group.data().groupSchedule;
        let groupScheduleStartDate = group.data().groupScheduleStartDate.toDate();
        let scheduleAndDateObj = new ScheduleAndStartDate(prevSchedule, groupScheduleStartDate)
    
        let fullResult = scheduleAndDateObj.getHoursPerPersonWholeSchedule(allMembers);
        dayHoursPerPerson = fullResult.dayHoursPerPerson;
        nightHoursPerPerson = fullResult.nightHoursPerPerson;
        return {dayHoursPerPerson, nightHoursPerPerson};
    } else {
        throw new Error(HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
   

}

