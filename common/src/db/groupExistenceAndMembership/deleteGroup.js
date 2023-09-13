import { firestore } from "../firebase_config.js";
import { getGroupMembersByGroupCode } from "./groupMembership.js";

export const DELETE_GROUPS_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist"
}

/**
 * TODO: add a check that the user is logged in as a member (Creator?) of this group
 * TODO: make this atomic
 * @param {String} groupCodeToDelete 
 */
export async function deleteGroup(groupCodeToDelete) {
    const groupMembers = await getGroupMembersByGroupCode(groupCodeToDelete).catch((error) => {throw new Error(DELETE_GROUPS_ERROR_CODES.GROUP_DOES_NOT_EXIST)});
    try{
        await firestore.runTransaction(async (transaction) => {
            groupMembers.forEach(async (member) => {
                const memberRef = firestore.collection('users').doc(member.userID);
                const oldData = await memberRef.get();
        
                const newData = {...oldData.data()}
                newData.groups = newData.groups.filter(group => (group.groupCode !== groupCodeToDelete));
                firestore.collection('users').doc(member.userID).update(newData);
            });

            firestore.collection('groups').doc(groupCodeToDelete).delete();
        })
    } catch (error) {

    }  
}