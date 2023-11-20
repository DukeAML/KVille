import { ScheduleAndStartDate } from "./scheduleAndStartDate.js";
import { firestore } from "../firebase_config.js";
import { getDateRoundedTo30MinSlot } from "../../calendarAndDates/datesUtils.js";


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
    if (group.exists){
        let origDate = group.data().groupScheduleStartDate.toDate();
        let roundedDate = getDateRoundedTo30MinSlot(origDate);
        console.log("finished fetching group schedule");
        return new ScheduleAndStartDate(group.data().groupSchedule, roundedDate);
    } else {
        throw new Error(FETCH_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }


}

/**
 * 
 * @param {string} groupCode 
 * @param {string[]} newSchedule 
 * @returns {Promise<string[]>}
 */
export async function setGroupScheduleInDB(groupCode, newSchedule) {
    console.log("updating group schedule with ");
    console.log(newSchedule);
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();
    if (group.exists){
        groupRef.update({
            groupSchedule: newSchedule
        });
        return newSchedule;
    } else {
        throw new Error(SET_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
}