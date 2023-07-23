import { firestore, auth } from "./firebase_config";

export class GroupDescription{
    /**
     * 
     * @param {String} groupCode 
     * @param {String} groupName 
     */
    constructor(groupCode, groupName){
        this.groupCode = groupCode;
        this.groupName = groupName;

    }
}

/**
 * 
 * @returns {GroupDescription[]}
 */
export async function fetchGroups() {
    let allGroups = [];

    await firestore
      .collection('users')
      .doc(auth.currentUser.uid)
      .get()
      .then((doc) => {
        let groupsInDB = doc.data().groupCode;
        //console.log("Current user's groups", currGroup);
        groupsInDB.forEach((group, index) => {
            allGroups.push(new GroupDescription(group.groupCode, group.groupName));
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return allGroups;
  }

  