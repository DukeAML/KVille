import { firestore} from "../firebase_config";

import { UPDATE_GROUP_ERROR_CODES } from "@/lib/controllers/groupMembershipAndExistence/updateGroupController";


async function checkIfGroupExistsByGroupName(groupName : string) : Promise<boolean> {
    let queryResults = await firestore.collection('groups').where('name', '==', groupName).get();
    if (queryResults.empty){
        return false;
    } else {
        return true;
    }
}


export async function updateGroupName(newGroupName : string, groupCode : string) : Promise<string> {
    //check if there is already a group with this name!
    if (await checkIfGroupExistsByGroupName(newGroupName)){
        throw new Error(UPDATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN);
    }
    try {
        await firestore.runTransaction(async (transaction) => {
            let groupRef = firestore.collection('groups').doc(groupCode);
            transaction.update(groupRef, {name: newGroupName});
        })
        return newGroupName;
    } catch (error) {
        throw new Error(UPDATE_GROUP_ERROR_CODES.UPDATE_GROUP_FAILURE);
    }
}

