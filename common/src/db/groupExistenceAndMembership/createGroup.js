import * as Yup from "yup";
import { firestore} from "../firebase_config.js";
import { getDefaultGroupMemberData, getNewUserDataAfterJoiningGroup } from "./joinGroup.js";
import {generateGroupCode} from "./GroupCode.js";
import { TENTING_COLORS } from "../../../data/phaseData.js";
import { getTentingStartDate } from "../../calendarAndDates/tentingDates.js";
import { CURRENT_YEAR, getScheduleDates } from "../../../data/scheduleDates.js";
import { getDatePlusNumShifts, getNumSlotsBetweenDates } from "../../calendarAndDates/datesUtils.js";
import { EMPTY } from "../../scheduling/slots/tenterSlot.js";
import { Slot } from "../../scheduling/slots/slot.js";

const GROUP_CODE_LENGTH = 8;
const CREATOR_ROLE = "Creator";

export const CREATE_GROUP_ERROR_CODES = {
    CREATE_GROUP_FAILURE : "Failed to Create Group",
    GROUP_NAME_TAKEN : "Group Name is Already Taken"
}

export const createGroupValidationSchema = Yup.object({
    groupName: Yup.string().required('Required'),
    tentType : Yup.string().required().oneOf([TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, TENTING_COLORS.WHITE]) 
});

/**
 * 
 * @param {String} groupName 
 * @returns {boolean} true iff there exists such a group
 */
async function checkIfGroupExistsByGroupName(groupName) {
    let queryResults = await firestore.collection('groups').where('name', '==', groupName).get();
    console.log(queryResults.empty);
    if (queryResults.empty){
        return false;
    } else {
        return true;
    }

}

/**
 * 
 * @param {String} tentType 
 * @param {number} year 
 * @returns {Array<String>} an array with an entry for each timeslot, autofilled with "empty"
 */
export function getDefaultSchedule(tentType, year){
    let startDate = getTentingStartDate(tentType, year);
    let endDate = getScheduleDates(year).endOfTenting;
    let numSlots = getNumSlotsBetweenDates(startDate, endDate);
    let sched = [];
    for (let i = 0; i < numSlots; i += 1){
        let slot = new Slot(getDatePlusNumShifts(startDate, i), tentType);
        let numPpl = slot.calculatePeopleNeeded();
        sched.push(new Array(numPpl).fill(EMPTY).join(" "));
    }
    return sched;
    
}

/**
 * 
 * @param {String} groupName 
 * @param {String} tentType 
 * @param {String} creator
 */
function getDefaultNewGroupData(groupName, tentType, creator){
    return {
        name : groupName,
        tentType : tentType,
        groupSchedule : getDefaultSchedule(tentType, CURRENT_YEAR),
        groupScheduleStartDate : getTentingStartDate(tentType, CURRENT_YEAR),
        creator : creator
    }
}

/**
 * 
 * @param {String} groupName 
 * @param {String} tentType 
 * @param {String} userID
 * @returns {Promise<String>} groupCode
 */
export async function tryToCreateGroup(groupName, tentType, userID) {
    //check if there is already a group with this name!
    if (await checkIfGroupExistsByGroupName(groupName)){
        throw new Error(CREATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN);
    }
    let groupCode = await generateGroupCode(GROUP_CODE_LENGTH);
    let userRef = firestore.collection('users').doc(userID);
    let newUserData = await getNewUserDataAfterJoiningGroup(userRef, groupName, groupCode);
    let username = newUserData.username;
    //creates/adds to groups collection, adds doc with generated group code and sets name and tent type

    try {
        await firestore.runTransaction(async (transaction) => {
            let groupRef = firestore.collection('groups').doc(groupCode);
            transaction.set(groupRef, getDefaultNewGroupData(groupName, tentType, userID));
            let groupMembersRef = groupRef.collection('members');
            let myGroupMemberRef = groupMembersRef.doc(userID);
            transaction.set(myGroupMemberRef, getDefaultGroupMemberData(username, tentType, CREATOR_ROLE));
            transaction.set(userRef, newUserData);
            
        })
    } catch (error) {
        console.log("error from transaction : " + error.message);
        throw new Error(CREATE_GROUP_ERROR_CODES.CREATE_GROUP_FAILURE);
    } 
    return groupCode;
    
}





