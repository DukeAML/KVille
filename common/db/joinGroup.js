import * as Yup from "yup";
import { firestore, auth } from "./firebase_config.js";
import { Helpers } from "../Scheduling/helpers.js";
import { getNumSlotsBetweenDates } from "../calendarAndDates/dates_services.js";
import { GroupDescription } from "./groupMembership.js";

export const joinGroupValidationSchema = Yup.object({
    groupCode: Yup.string().required('Required')
});



/**
 * 
 * @param {String} name 
 * @param {String} tentType 
 * @param {String} groupRole 
 * @returns {{boolean[], Date, string, string, boolean}}
 */
export function getDefaultGroupMemberData(name, tentType, groupRole) {
    let availabilityStartDate = Helpers.getTentingStartDate(tentType);
    
    let endDate = Helpers.getTentingEndDate();
    let numSlots = getNumSlotsBetweenDates(availabilityStartDate, endDate);
    let availability = new Array(numSlots).fill(false);
    let inTent = false;
    return {availability, availabilityStartDate, name, groupRole, inTent};
}

/**
 * 
 * @param {String} groupCode 
 * @returns {Promise<String[]>} userIDs
 */
async function getGroupMembersByGroupCode(groupCode) {
    const groupRef = firestore.collection('groups').doc(groupCode).collection('members');
    let memberDocs = await groupRef.get();
    return memberDocs.docs.map((doc, index) => doc.id);
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
        return {canJoinGroup : false, errorMessage : "Group does not exist"};
    }
    let existingGroupMembers = await getGroupMembersByGroupCode(groupCode);
    if (existingGroupMembers.length >= 12){
        return {canJoinGroup : false, errorMessage : "Group is already full"};
    }

    if (existingGroupMembers.includes(userID)){
        return {canJoinGroup : false, errorMessage : "You've already joined this group"};
    }
    return {canJoinGroup : true, errorMessage : "You can join this group"};
}

/**
 * 
 * @param {*} groupRef 
 * @returns {Promise<{groupName : string, tentType : string}>}
 */
async function getGroupNameAndTypeForGroupRef(groupRef) {
    let groupName = '';
    let tentType = '';
    await groupRef.get().then((groupSnapshot) => {
        groupName = groupSnapshot.data().name;
        tentType = groupSnapshot.data().tentType;
    })
    return {groupName, tentType};
}

export async function getNewUserDataAfterJoiningGroup(userRef, groupName, groupCode){
    
    let oldUserData = (await userRef.get()).data();
    let newUserData = {
        ...oldUserData, 
        groupCode : [
            ...oldUserData.groupCode,
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
    let {canJoinGroup, errorMessage} = await checkIfItIsPossibleToJoinGroup(groupCode, groupRef, userRef);
    if (!canJoinGroup){
        throw new Error(errorMessage);
    }
    let {groupName, tentType} = await getGroupNameAndTypeForGroupRef(groupRef);
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
    return new GroupDescription(groupCode, gruopName, tentType);

}
