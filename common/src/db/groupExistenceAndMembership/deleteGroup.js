import { firestore } from "../firebase_config.js";

export const DELETE_GROUPS_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
}

/**
 * TODO: add a check that the user is logged in as a member (Creator?) of this group
 * TODO: make this atomic
 * @param {String} groupCodeToDelete 
 */
export async function deleteGroup(groupCodeToDelete) {
    firestore.collection('groups').doc(groupCodeToDelete).delete();
}