import { firestore } from "../firebase_config.js";
import {EMPTY} from "../../scheduling/slots/tenterSlot.js";

export const REMOVE_USER_ERRORS = {
    USER_DOES_NOT_EXIST: "User does not exist",
    USER_NOT_IN_GROUP: "User is not in group",
    GROUP_DOES_NOT_EXIST: "Group does not exist",
    DEFAULT: "Error removing user",
  };


/**
 * 
 * @param {String} username 
 * @param {String} groupCode 
 * @returns {Promise<void>}
 */
export async function removeMemberFromGroupByUsername(username, groupCode){
    const userID = await findUserIDForMemberInGroupWithGivenUsername(username, groupCode);
    removeMemberFromGroupByID(userID, groupCode);
}

/**
 * 
 * @param {string} username 
 * @param {string} groupCode 
 * @returns {Promise<string>} userID
 */
async function findUserIDForMemberInGroupWithGivenUsername(username, groupCode){
    try {
        const membersCollection = await firestore.collection('groups').doc(groupCode).collection('members').get();
        for (const memberDoc of membersCollection.docs) {
            const userID = memberDoc.id;
            const userSnapshot = await firestore.collection('users').doc(userID).get();
            const userData = userSnapshot.data();
    
            // Check if the username matches the given username
            if (userData && userData.username === username) {
                return userID;
            }
        } 
        throw new Error(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
    } catch (error) {
        throw new Error(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
    }
}


/**
 * //this assumes usernames are unique and cannot be changed! 
 * //the above constraint is enforced elsewhere 
 * @param {String} userID
 * @param {String} groupCode
 * @returns {Promise<void>}
 */
export async function removeMemberFromGroupByID(userID, groupCode) {
    const userRef = firestore.collection("users").doc(userID);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error(REMOVE_USER_ERRORS.USER_DOES_NOT_EXIST);
    }
    let newUserData = { ...userDoc.data() };
    newUserData.groups = newUserData.groups.filter(
      (group) => group.groupCode !== groupCode
    );
    const userInGroupRef = firestore
      .collection("groups")
      .doc(groupCode)
      .collection("members")
      .doc(userID);
    const userInGroupDoc = await userInGroupRef.get();
    if (!userInGroupDoc.exists) {
      throw new Error(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
    }
  
    const groupRef = firestore.collection("groups").doc(groupCode);
    const groupDoc = await groupRef.get();
    let newGroupData = {...groupDoc.data()};
    newGroupData.groupSchedule = replaceUserWithEmptyInGroupSchedule(newGroupData.groupSchedule, newUserData.username);
  
    try {
      await firestore.runTransaction(async (transaction) => {
        transaction.delete(userInGroupRef);
        transaction.update(userRef, newUserData);
        transaction.update(groupRef, newGroupData);
      });
    } catch (error) {
      throw new Error(REMOVE_USER_ERRORS.DEFAULT);
    }
  }
  
  /**
   * 
   * @param {Array<string>} originalSchedule looks like ["Bob Joe", "Bob Joe", "Mike Steve Jim", "Mike Steve Jim", ...]
   * @param {string} tenterToRemove 
   * @returns {Array<string>} updatedSchedule
   */
  function replaceUserWithEmptyInGroupSchedule (originalSchedule, tenterToRemove){
    //TODO: fill in this method, using the EMPTY variable imported at the top of this file
    /* 
    As an example of how this should work, suppose originalSchedule is ["Bob Joe", "Bob Joe", "Mike Steve Jim", "Mike Steve Jim"]
    and tenterToRemove is "Bob". Then, the function should return ["empty Joe", "empty Joe", "Mike Steve Jim", "Mike Steve Jim"] where EMPTY = "empty"
    */
    const names = entry.split(' ');

    // Replace tenterToRemove with "empty"
    const updatedNames = names.map(name => (name === tenterToRemove ? EMPTY : name));

    // Join the names back into an entry
    return updatedNames.join(' ');


    return originalSchedule;
  
  }