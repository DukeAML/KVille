import { firestore } from "../firebase_config";

export const DELETE_GROUPS_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
}

/**
 * TODO: add a check that the user is logged in as a member (Creator?) of this group
 * @param {String} groupCodeToDelete 
 */
export async function deleteGroup(groupCodeToDelete : string) {
    firestore.collection('groups').doc(groupCodeToDelete).delete();
}