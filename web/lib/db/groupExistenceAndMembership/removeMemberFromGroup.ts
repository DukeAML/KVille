import { firestore } from "@/lib/db/firebase_config";
import {EMPTY} from "@/lib/schedulingAlgo/slots/tenterSlot";
import { REMOVE_USER_ERRORS } from "@/lib/controllers/groupMembershipAndExistence/removeMemberController";

export async function removeMemberFromGroupByUsername(username : string, groupCode : string) {
    const userID = await findUserIDForMemberInGroupWithGivenUsername(username, groupCode);
    removeMemberFromGroupByID(userID, groupCode);
}

async function findUserIDForMemberInGroupWithGivenUsername(username : string, groupCode : string) :  Promise<string> {
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



export async function removeMemberFromGroupByID(userID : string, groupCode : string) {
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
    let groupData = groupDoc.data();
    if (groupData !== undefined){
      if (groupData.creator === userID){
        throw new Error (REMOVE_USER_ERRORS.CANNOT_REMOVE_CREATOR);
      }
    }

    let newGroupData = {...groupDoc.data()};
    newGroupData.groupSchedule = replaceUserWithEmptyInGroupSchedule(newGroupData.groupSchedule, userID);
  
    try {
		await firestore.runTransaction(async (transaction) => {
			transaction.delete(userInGroupRef);
			transaction.update(groupRef, newGroupData);
		});
    } catch (error) {
		throw new Error(REMOVE_USER_ERRORS.DEFAULT);
    }
  }
  

function replaceUserWithEmptyInGroupSchedule (originalSchedule : string[], tenterIDToRemove : string) : string[] {
	return originalSchedule.map((ids) => {
		let originalIDs = ids.split(" ");
		return originalIDs.map((originalID) => {
			if (originalID === tenterIDToRemove) {
				return EMPTY;
			} else {
				return originalID;
			}
		}).join(" ");
	})

}