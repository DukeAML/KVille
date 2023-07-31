import * as Yup from "yup";
import { firestore, auth } from "./firebase_config";
import { group } from "console";

export const joinGroupValidationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required'),
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
async function checkIfGroupExistsByGroupCode(groupCode) {
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
 * @returns {Promise<boolean>}
 */
async function checkIfItIsPossibleToJoinGroup(groupCode, groupRef, userRef){
    let groupExists = await checkIfGroupExistsByGroupCode(groupCode);
    if (!groupExists) {
        return false;
    }
    let existingGroupMembers = await getGroupMembersByGroupCode(groupCode);
    if (existingGroupMembers.length >= 12){
        return false;
    }

    if (existingGroupMembers.includes(auth.currentUser.uid)){
        return false;
    }
    return true;
}

/**
 * 
 * @param {*} groupRef 
 * @returns {Promise<{{string, string}}>}
 */
async function getGroupNameAndTypeForGroupRef(groupRef) {
    let name = '';
    let tentType = '';
    await groupRef.get().then((groupSnapshot) => {
        name = groupSnapshot.data().name;
        tentType = groupSnapshot.data().tentType;
    })
    return {name, tentType};
}


export async function tryToJoinGroup(groupCode) {
    const groupRef = firestore.collection('groups').doc(groupCode);
    const userRef = firestore.collection('users').doc(auth.currentUser.uid);
    let canJoinGroup = await checkIfItIsPossibleToJoinGroup(groupCode, groupRef, userRef);
    if (!canJoinGroup){
        return; //set error message!
    }

    try {
        await firestore.runTransaction(async (transaction) => {
            
            let {groupName, tentType} = await getGroupNameAndTypeForGroupRef(groupRef);
            let oldUserData = await userRef.get().data();
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
            transaction.set(userRef, newUserData);
            let newMemberRef = groupRef.collection('users').doc(auth.currentUser.uid)
            let myUsername = await userRef.get().data().username;
            transaction.set(newMemberRef,  getDefaultGroupMemberData(myUsername, tentType, "Member"));
        })
    } catch (error) {
        console.log("error from transaction : " + error.message);
        //handleFailureMessageIfAny(error.message);
    } 

}

export async function tryToJoinGroupOrig(groupCode){
    const groupRef = firestore.collection('groups').doc(groupCode);
    const userRef = firestore.collection('users').doc(auth.currentUser.uid);
    await groupRef.get().then(async (docSnapshot) => {
        console.log('Group exists: ', docSnapshot.exists);
        if (docSnapshot.exists) {
        tentType = docSnapshot.data().tentType;
        //Max 12 people in a group
        let result = await groupRef
            .collection('members')
            .get()
            .then((collSnap) => {
            console.log(collSnap.size);
            if (collSnap.size == 12) {
                console.log('Group is full');
                dispatch(toggleSnackBar());
                dispatch(setSnackMessage('Group already full'));
                return 'full';
            }
            });
        console.log(result);
        if (result == 'full') {
            return;
        }
        result = await groupRef
            .collection('members')
            .doc(auth.currentUser.uid)
            .get()
            .then((doc) => {
            if (doc.exists) {
                dispatch(setSnackMessage('Already joined this group'));
                dispatch(toggleSnackBar());
                return 'exists';
            }
            });
        if (result == 'exists') {
            return;
        }

        groupRef
            .collection('members')
            .where('name', '==', name)
            .get()
            .then(async (snapshot) => {
            if (snapshot.empty) {
                groupName = docSnapshot.data().name;
                
                //updates current user's info
                await userRef.update({
                groupCode: firebase_FieldValue.arrayUnion({
                    groupCode: groupCode,
                    groupName: docSnapshot.data().name,
                }),
                });
                //adds current user to member list
                await groupRef.collection('members').doc(auth.currentUser.uid).set(getDefaultGroupMemberData(name, tentType, 'Member'));
                await userRef.get().then((snapshot) => {
                dispatch(setCurrentUser(snapshot.data()));
                });

                queryClient.invalidateQueries(['groups', auth.currentUser.uid]);
            } else {
                dispatch(toggleSnackBar());
                dispatch(setSnackMessage('Name already taken'));
            }
            });
        return;
        } else {
        console.log('No group exists');
        dispatch(toggleSnackBar());
        dispatch(setSnackMessage("Invalid group code: group doesn't exist"));
        return;
        }
    });
}