import ScheduleAndStartDate from "../Scheduling/scheduleAndStartDate";
import { firestore } from "./firebase_config";
import { getDateRoundedTo30MinSlot } from "../calendarAndDates/dates_services";
/**
 * 
 * @param {string} groupCode 
 * @returns {ScheduleAndStartDate} object containing the schedule as an array of strings, and the start Date of the schedule
 */
export async function fetchGroupSchedule(groupCode) {
    console.log("fetching schedule for " + groupCode + " group ");
    const db = firestore;
    const groupRef = db.collection('groups').doc(groupCode);
    const group = await groupRef.get();

    //firebase dates are kinda weird, so we need to make sure it is formatted properly now
    let origDate = group.data().groupScheduleStartDate.toDate();
    let roundedDate = getDateRoundedTo30MinSlot(origDate);


    return new ScheduleAndStartDate(group.data().groupSchedule, roundedDate);
}