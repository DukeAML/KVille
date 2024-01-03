import { ScheduleAndStartDate } from "./scheduleAndStartDate.js";
import { firestore } from "../firebase_config.js";
import { getDateRoundedTo30MinSlot } from "../../calendarAndDates/datesUtils.js";
import { getGroupMembersByGroupCode } from "../groupExistenceAndMembership/groupMembership.js";
import { GRACE } from "../../scheduling/slots/tenterSlot.js";
import { checkIfNameIsForGracePeriod } from "../../scheduling/rules/gracePeriods.js";


export const FETCH_SCHEDULE_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
};

export const SET_SCHEDULE_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
};

/**
 * @param {String[]} userIDs
 * @returns {Promise<{ userID: String, username: String }[]>}
 */
async function getUsernames(userIDs) {
    return new Promise((resolve, reject) => {
        const userPromises = [];
    
        userIDs.forEach((userID) => {
            const userPromise = firestore.collection('users').doc(userID).get();
            userPromises.push(userPromise);
        });
    
        Promise.all(userPromises)
            .then((userSnapshots) => {
                const usernames = [];
                userSnapshots.forEach((userSnapshot) => {
                    if (userSnapshot.exists) {
                        const userData = userSnapshot.data();
                        const username = userData.username;
                        usernames.push({ userID: userSnapshot.id, username });
                    }
                });
        
                resolve(usernames); // Resolve the Promise with the array of user data
            })
        .catch((error) => {
            console.error('Error fetching usernames:', error);
            reject(error); // Reject the Promise if there's an error
        });
    });
  }
  

  

/**
 * 
 * @param {string} groupCode 
 * @returns {Promise<ScheduleAndStartDate>} object containing the schedule as an array of strings, and the start Date of the schedule
 */
export async function fetchGroupSchedule(groupCode) {
    console.log("fetching schedule for " + groupCode + " group ");
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();
    const groupMemberIDs = await getGroupMembersByGroupCode(groupCode);
    const groupMembers = await getUsernames(groupMemberIDs.map((member) => member.userID));
    const IDToNameMap = new Map();
    groupMembers.forEach((member) => IDToNameMap.set(member.userID, member.username));
    if (group.exists){
        let origDate = group.data().groupScheduleStartDate.toDate();
        let roundedDate = getDateRoundedTo30MinSlot(origDate);
        let schedule = [];
        group.data().groupSchedule.map((idsAtIndex) => {
            let ids = idsAtIndex.split(" ");
            if (checkIfNameIsForGracePeriod(idsAtIndex)){
                ids = [idsAtIndex];
            }
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