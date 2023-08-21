import { firestore } from "./firebase_config";
import { ScheduleAndStartDate } from "../Scheduling/scheduleAndStartDate";



/**
 * 
 * @param {String} groupCode 
 * @param {Date} dateRangeStart 
 * @param {Date} dateRangeEnd 
 * @returns {{dayHoursPerPersonInRange : {[key : string] : number}, nightHoursPerPersonInRange : {[key : string] : number}, dayHoursPerPersonEntire : {[key : string] : number}, nightHoursPerPersonEntire : {[key : string] : number}}}
 */
export async function fetchHoursPerPersonInDateRange(groupCode, dateRangeStart, dateRangeEnd) {
    let allMembers = await getNameOfAllTentersInGroup(groupCode);
    let groupRef = firestore.collection('groups').doc(groupCode);
    let dayHoursPerPersonInRange = {};
    let nightHoursPerPersonInRange = {};
    let dayHoursPerPersonEntire = {};
    let nightHoursPerPersonEntire = {};
    await groupRef.get().then((group) => {
        let prevSchedule = group.data().groupSchedule;
        let groupScheduleStartDate = group.data().groupScheduleStartDate.toDate();
        let scheduleAndDateObj = new ScheduleAndStartDate(prevSchedule, groupScheduleStartDate)
        let rangeResult = scheduleAndDateObj.getHoursPerPersonInDateRange(dateRangeStart, dateRangeEnd, allMembers);
        dayHoursPerPersonInRange = rangeResult.dayHoursPerPerson;
        nightHoursPerPersonInRange = rangeResult.nightHoursPerPerson;
    
        let fullResult = scheduleAndDateObj.getHoursPerPersonWholeSchedule(allMembers);
        dayHoursPerPersonEntire = fullResult.dayHoursPerPerson;
        nightHoursPerPersonEntire = fullResult.nightHoursPerPerson;
  
    }
    );

    return {dayHoursPerPersonInRange, nightHoursPerPersonInRange, dayHoursPerPersonEntire, nightHoursPerPersonEntire}
}

/**
 * 
 * @param {String} groupCode 
 * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}}
 */
export async function fetchHoursPerPerson(groupCode){
    let allMembers = await getNameOfAllTentersInGroup(groupCode);
    let groupRef = firestore.collection('groups').doc(groupCode);
    let dayHoursPerPerson = {};
    let nightHoursPerPerson = {};
    await groupRef.get().then((group) => {
        let prevSchedule = group.data().groupSchedule;
        let groupScheduleStartDate = group.data().groupScheduleStartDate.toDate();
        let scheduleAndDateObj = new ScheduleAndStartDate(prevSchedule, groupScheduleStartDate)
    
        let fullResult = scheduleAndDateObj.getHoursPerPersonWholeSchedule(allMembers);
        dayHoursPerPerson = fullResult.dayHoursPerPerson;
        nightHoursPerPerson = fullResult.nightHoursPerPerson;
  
    }
    );

    return {dayHoursPerPerson, nightHoursPerPerson}

}

export async function getNameOfAllTentersInGroup(groupCode){
    let membersRef = firestore.collection('groups').doc(groupCode).collection('members');
    let allMembers = [];
    await membersRef.get().then((members) => {
        members.forEach((member) => {
            allMembers.push(member.data().name);
        })
    });
    return allMembers;
}