import * as Yup from "yup";
import { firestore} from "../firebase_config.js";
import { getNumSlotsBetweenDates } from "../../calendarAndDates/datesUtils.js";
import { GroupDescription } from "./groupMembership.js";
import { getGroupMembersByGroupCode } from "./groupMembership.js";
import { CURRENT_YEAR, getScheduleDates } from "../../scheduling/rules/scheduleDates.js";
import { getTentingStartDate } from "../../calendarAndDates/tentingDates.js";

export const JOIN_GROUP_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist",
    GROUP_IS_FULL : "Group is full already",
    ALREADY_IN : "You've already joined this group"
}

export const joinGroupValidationSchema = Yup.object({
    groupCode: Yup.string().required('Required')
});



/**
 * 
 * @param {String} tentType 
 * @returns {{availability : boolean[], availabilityStartDate : Date}}
 */
export function getDefaultGroupMemberData(tentType, year=CURRENT_YEAR) {
    let availabilityStartDate = getTentingStartDate(tentType, year);
    let endDate = getScheduleDates(year).endOfTenting;
    let numSlots = getNumSlotsBetweenDates(availabilityStartDate, endDate);
    let availability = new Array(numSlots).fill({available : false, preferred : false});
    return {availability, availabilityStartDate};
}



/**
 * 
 * @param {String} groupCode
 * @returns {Promise<boolean>} exists 
 */
export async function checkIfGroupExistsByGroupCode(groupCode) {
    const groupRef = firestore.collection('groups').doc(groupCode);
    let groupExists = await groupRef.get().then((groupSnapshot) => {
        if (groupSnapshot.exists) {
            return true;
        } else {
            return false;
        }
    });
    return groupExists;
}

/**
 * 
 * @param {String} groupCode  
 * @param {String} userID
 * @returns {Promise<{canJoinGroup : Boolean, errorMessage : String}>}
 */
async function checkIfItIsPossibleToJoinGroup(groupCode, userID){
    let groupExists = await checkIfGroupExistsByGroupCode(groupCode);
    if (!groupExists) {
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.GROUP_DOES_NOT_EXIST};
    }
    let existingGroupMembers = await getGroupMembersByGroupCode(groupCode);
    let existingGroupMemberIDs = existingGroupMembers.map((member) => member.userID);
    if (existingGroupMemberIDs.length >= 12){
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.GROUP_IS_FULL};
    }


    if (existingGroupMemberIDs.includes(userID)){
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.ALREADY_IN};
    }
    return {canJoinGroup : true, errorMessage : "You can join this group"};
}

/**
 * 
 * @param {*} groupRef 
 * @returns {Promise<{groupName : string, tentType : string, creator : string, groupScheduleStartDate : Date }>}
 */
async function getGroupDataForGroupRef(groupRef) {
    let groupName = '';
    let tentType = '';
    let creator = '';
    let groupScheduleStartDate = new Date(getScheduleDates(CURRENT_YEAR).startOfBlack);
    await groupRef.get().then((groupSnapshot) => {
        groupName = groupSnapshot.data().name;
        tentType = groupSnapshot.data().tentType;
        creator = groupSnapshot.data().creator;
        groupScheduleStartDate = groupSnapshot.data().groupScheduleStartDate.toDate();
    })
    return {groupName, tentType, creator, groupScheduleStartDate};
}


/**
 * 
 * @param {String} groupCode
 * @param {String} userID
 * @returns {Promise<GroupDescription>}
 */
export async function tryToJoinGroup(groupCode, userID) {
    const groupRef = firestore.collection('groups').doc(groupCode);
    let {canJoinGroup, errorMessage} = await checkIfItIsPossibleToJoinGroup(groupCode, userID);
    if (!canJoinGroup){
        throw new Error(errorMessage);
    }
    let {groupName, tentType, creator, groupScheduleStartDate} = await getGroupDataForGroupRef(groupRef);
    try {
        await firestore.runTransaction(async (transaction) => {
            let newMemberRef = groupRef.collection('members').doc(userID);
            transaction.set(newMemberRef,  getDefaultGroupMemberData(tentType, groupScheduleStartDate.getFullYear()));
        })
    } catch (error) {
        console.log("error from transaction : " + error.message);
        throw new Error(error.message);
    } 
    return new GroupDescription(groupCode, groupName, tentType, creator);

}
