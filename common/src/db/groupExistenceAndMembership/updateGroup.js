import * as Yup from "yup";
import { firestore} from "../firebase_config.js";

import { TENTING_COLORS } from "../../../data/phaseData.js";


export const UPDATE_GROUP_ERROR_CODES = {
    UPDATE_GROUP_FAILURE : "Unknown Error",
    GROUP_NAME_TAKEN : "Group Name is Already Taken"
}

export const createGroupValidationSchema = Yup.object({
    groupName: Yup.string().required('Required'),
    tentType : Yup.string().required().oneOf([TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, TENTING_COLORS.WHITE]) 
});

/**
 * 
 * @param {String} groupName 
 * @returns {boolean} true iff there exists such a group
 */
async function checkIfGroupExistsByGroupName(groupName) {
    let queryResults = await firestore.collection('groups').where('name', '==', groupName).get();
    console.log(queryResults.empty);
    if (queryResults.empty){
        return false;
    } else {
        return true;
    }
}

/**
 * 
 * @param {String} newGroupName 
 * @param {String} groupCode 
 * @param {String} userID
 * @returns {Promise<string>} newGroupName
 */
export async function updateName(newGroupName, groupCode) {
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
        console.log("error from transaction : " + error.message);
        throw new Error(UPDATE_GROUP_ERROR_CODES.UPDATE_GROUP_ERROR_CODES);
    }
}