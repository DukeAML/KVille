import { ScheduleData } from "@/lib/controllers/scheduleData";
import { firestore } from "@/lib/db/firebase_config";
import { getDateRoundedTo30MinSlot } from "@/lib/calendarAndDatesUtils/datesUtils";
import { getGroupMembersByGroupCode } from "../groupExistenceAndMembership/groupMembership";
import { checkIfNameIsForGracePeriod } from "@/lib/schedulingAlgo/rules/gracePeriods";
import firebase from 'firebase/compat/app';
import { UsernameAndIDs, FETCH_SCHEDULE_ERROR_CODES, SET_SCHEDULE_ERROR_CODES } from "@/lib/controllers/scheduleController";


async function getUsernames(userIDs : string[]) : Promise<UsernameAndIDs[]> {
    return new Promise((resolve, reject) => {
        const userPromises : Promise<firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>>[] = [];
    
        userIDs.forEach((userID) => {
            const userPromise = firestore.collection('users').doc(userID).get();
            userPromises.push(userPromise);
        });
    
        Promise.all(userPromises)
            .then((userSnapshots) => {
                const usernames : UsernameAndIDs[] = [];
                userSnapshots.forEach((userSnapshot) => {
                    let userData = userSnapshot.data();
                    if (userData !== undefined) {
                        const username : string = userData.username;
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
 * @returns {Promise<ScheduleData>} object containing the schedule as an array of strings, and the start Date of the schedule
 */
export async function fetchGroupSchedule(groupCode : string) : Promise<ScheduleData> {
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();
    const groupMemberIDs = await getGroupMembersByGroupCode(groupCode);
    const groupMembers = await getUsernames(groupMemberIDs.map((member) => member.userID));
    const IDToNameMap = new Map();
    groupMembers.forEach((member) => IDToNameMap.set(member.userID, member.username));
    let groupData = group.data();
    if (groupData !== undefined){
        let origDate = groupData.groupScheduleStartDate.toDate();
        let roundedDate = getDateRoundedTo30MinSlot(origDate);
        let schedule : string[][]= [];
        groupData.groupSchedule.map((idsAtIndex : string) => {
            let ids = idsAtIndex.split(" ");
            if (checkIfNameIsForGracePeriod(idsAtIndex)){
                ids = [idsAtIndex];
            }
            schedule.push(ids);
        })
        return new ScheduleData(schedule, roundedDate, IDToNameMap);
    } else {
        throw new Error(FETCH_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
}

/**
 * 
 * @param {string} groupCode 
 * @param {ScheduleData} newSchedule 
 * @returns {Promise<ScheduleData>}
 */
export async function setGroupScheduleInDB(groupCode : string, newSchedule : ScheduleData) :  Promise<ScheduleData> {
    const groupRef = firestore.collection('groups').doc(groupCode);
    const group = await groupRef.get();
    if (group.exists){
        groupRef.update({
            groupSchedule: newSchedule.schedule.map((ids) => ids.join(" "))
        });
        return newSchedule;
    } else {
        throw new Error(SET_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    }
}

