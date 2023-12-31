import { ScheduleAndStartDate } from "./scheduleAndStartDate.js";
import { firestore } from "../firebase_config.js";
import { getDateRoundedTo30MinSlot } from "../../calendarAndDates/datesUtils.js";
import { getGroupMembersByGroupCode } from "../groupExistenceAndMembership/groupMembership.js";
import { GRACE } from "../../scheduling/slots/tenterSlot.js";


export const FETCH_SCHEDULE_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
};

export const SET_SCHEDULE_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
};

/**
 * 
 * @param {string} groupCode 
 * @returns {Promise<ScheduleAndStartDate>} object containing the schedule as an array of strings, and the start Date of the schedule
 */
export async function fetchGroupSchedule(groupCode) {
    console.log("fetching schedule for " + groupCode + " group ");
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();
    const groupMembers = await getGroupMembersByGroupCode(groupCode);
    const IDToNameMap = new Map();
    const NameToIDMap = new Map();
    groupMembers.forEach((member) => IDToNameMap.set(member.userID, member.username));
    groupMembers.forEach((member) => NameToIDMap.set(member.username, member.userID));
    if (group.exists){
        let origDate = group.data().groupScheduleStartDate.toDate();
        let roundedDate = getDateRoundedTo30MinSlot(origDate);
        let schedule = [];
        group.data().groupSchedule.map((namesAtIndex) => {
            let ids = [];
            let names = namesAtIndex.split(" ");
            if (names[0] === "Grace" && names[1] === "Period"){
                names = [GRACE];
            }
            names.forEach((name) => {
                if (NameToIDMap.has(name)){
                    ids.push(NameToIDMap.get(name))
                } else {
                    ids.push(name)
                }
                
            });
            schedule.push(ids);
        })
        return new ScheduleAndStartDate(schedule, roundedDate, IDToNameMap);
    } else {
        throw new Error(FETCH_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
}

/**
 * 
 * @param {string} groupCode 
 * @param {ScheduleAndStartDate} newSchedule 
 * @returns {Promise<ScheduleAndStartDate>}
 */
export async function setGroupScheduleInDB(groupCode, newSchedule) {
    console.log("updating group schedule with ");
    console.log(newSchedule.schedule);
    console.log("group code is " + groupCode);
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();
    if (group.exists){
        groupRef.update({
            groupSchedule: newSchedule.schedule.map((ids) => ids.join(" "))
        });
        return newSchedule;
    } else {
        console.log("group does not exist")
        throw new Error(SET_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
}