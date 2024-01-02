import * as Yup from "yup";
import { firestore} from "../firebase_config.js";
import { getNumSlotsBetweenDates } from "../../calendarAndDates/datesUtils.js";
import { GroupDescription } from "./groupMembership.js";
import { getGroupMembersByGroupCode } from "./groupMembership.js";
import { CURRENT_YEAR, getScheduleDates } from "../../../data/scheduleDates.js";
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
 * @param {String} name 
 * @param {String} tentType 
 * @param {String} groupRole 
 * @returns {{availability : boolean[], availabilityStartDate : Date, name : string, groupRole : string, inTent: boolean}}
 */
export function getDefaultGroupMemberData(name, tentType, groupRole="Member") {
    let availabilityStartDate = getTentingStartDate(tentType, CURRENT_YEAR);
    
    let endDate = getScheduleDates(CURRENT_YEAR).endOfTenting;
    let numSlots = getNumSlotsBetweenDates(availabilityStartDate, endDate);
    let availability = new Array(numSlots).fill({available : false, preferred : false});
    return {availability, availabilityStartDate, name};
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
 * @param {*} groupRef 
 * @param {*} userRef 
 * @param {String} userID
 * @returns {Promise<{canJoinGroup : Boolean, errorMessage : String}>}
 */
async function checkIfItIsPossibleToJoinGroup(groupCode, groupRef, userRef, userID){
    let groupExists = await checkIfGroupExistsByGroupCode(groupCode);
    if (!groupExists) {
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.GROUP_DOES_NOT_EXIST};
    }
    let existingGroupMembers = await getGroupMembersByGroupCode(groupCode);
    existingGroupMembers = existingGroupMembers.map((member) => member.userID);
    if (existingGroupMembers.length >= 12){
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.GROUP_IS_FULL};
    }


    if (existingGroupMembers.includes(userID)){
        console.log("should be returning false here");
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.ALREADY_IN};
    }
    return {canJoinGroup : true, errorMessage : "You can join this group"};
}

/**
 * 
 * @param {*} groupRef 
 * @returns {Promise<{groupName : string, tentType : string, creator : string}>}
 */
async function getGroupNameAndTypeForGroupRef(groupRef) {
    let groupName = '';
    let tentType = '';
    let creator = '';
    await groupRef.get().then((groupSnapshot) => {
        groupName = groupSnapshot.data().name;
        tentType = groupSnapshot.data().tentType;
        creator = groupSnapshot.data().creator;
    })
    return {groupName, tentType, creator};
}

export async function getNewUserDataAfterJoiningGroup(userRef, groupName, groupCode){
    
    let oldUserData = (await userRef.get()).data();
    let newUserData = {
        ...oldUserData, 
        groups : [
            ...oldUserData.groups,
            {
                groupCode : groupCode,
                groupName : groupName
            }
        ]
    }
    return newUserData;
}

/**
 * 
 * @param {String} groupCode
 * @param {String} userID
 * @returns {Promise<GroupDescription>}
 */
export async function tryToJoinGroup(groupCode, userID) {
    const groupRef = firestore.collection('groups').doc(groupCode);
    const userRef = firestore.collection('users').doc(userID);
    let {canJoinGroup, errorMessage} = await checkIfItIsPossibleToJoinGroup(groupCode, groupRef, userRef, userID);
    if (!canJoinGroup){
        throw new Error(errorMessage);
    }
    let {groupName, tentType, creator} = await getGroupNameAndTypeForGroupRef(groupRef);
    let newUserData = await getNewUserDataAfterJoiningGroup(userRef, groupName, groupCode);
    let myUsername = newUserData.username;
    try {
        await firestore.runTransaction(async (transaction) => {
            
            transaction.set(userRef, newUserData);
            let newMemberRef = groupRef.collection('members').doc(userID)

            transaction.set(newMemberRef,  getDefaultGroupMemberData(myUsername, tentType, "Member"));
        })
    } catch (error) {
        console.log("error from transaction : " + error.message);
        throw new Error(error.message);
    } 
    return new GroupDescription(groupCode, groupName, tentType, creator);

}
