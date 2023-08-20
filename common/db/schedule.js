import {ScheduleAndStartDate} from "../Scheduling/scheduleAndStartDate.js";
import { firestore } from "./firebase_config.js";
import { getDateRoundedTo30MinSlot } from "../calendarAndDates/dates_services.js";
/**
 * 
 * @param {string} groupCode 
 * @returns {ScheduleAndStartDate} object containing the schedule as an array of strings, and the start Date of the schedule
 */
export async function fetchGroupSchedule(groupCode) {
    console.log("fetching schedule for " + groupCode + " group ");
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();

    //firebase dates are kinda weird, so we need to make sure it is formatted properly now
    let origDate = group.data().groupScheduleStartDate.toDate();
    let roundedDate = getDateRoundedTo30MinSlot(origDate);
    //console.log("in the fetcher, schedule for " + groupCode + "  is " + group.data().groupSchedule);


    return new ScheduleAndStartDate(group.data().groupSchedule, roundedDate);
}

/**
 * 
 * @param {string} groupCode 
 * @param {string[]} newSchedule 
 * @returns {Promise<string[]>}
 */
export async function setGroupScheduleInDB(groupCode, newSchedule) {
    const groupRef = firestore.collection('groups').doc(groupCode);
    groupRef.update({
        groupSchedule: newSchedule
      });
    return newSchedule
}