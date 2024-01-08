import * as Yup from "yup";
import { firestore} from "../firebase_config";

import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";


export const UPDATE_GROUP_ERROR_CODES = {
    UPDATE_GROUP_FAILURE : "Unknown Error",
    GROUP_NAME_TAKEN : "Group Name is Already Taken"
}

export const createGroupValidationSchema = Yup.object({
    groupName: Yup.string().required('Required'),
    tentType : Yup.string().required().oneOf([TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, TENTING_COLORS.WHITE]) 
});


async function checkIfGroupExistsByGroupName(groupName : string) : Promise<boolean> {
    let queryResults = await firestore.collection('groups').where('name', '==', groupName).get();
    if (queryResults.empty){
        return false;
    } else {
        return true;
    }
}


export async function updateName(newGroupName : string, groupCode : string) : Promise<string> {
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