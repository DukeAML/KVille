import { firestore, auth } from "./firebase_config.js";

export class GroupDescription{
    /**
     * 
     * @param {String} groupCode 
     * @param {String} groupName 
     * @param {String} tentType}
     */
    constructor(groupCode, groupName, tentType){
        this.groupCode = groupCode;
        this.groupName = groupName;
        this.tentType = tentType;

    }
}

/**
 * @param {String} userID
 * @returns {GroupDescription[]}
 */
export async function fetchGroups(userID) {
    let allGroups = [];
    let allGroupCodes = [];
    await firestore
        .collection('users')
        .doc(userID)
        .get()
        .then((doc) => {
          let groupsInDB = doc.data().groupCode;
          //console.log("Current user's groups", currGroup);
          groupsInDB.forEach((group, index) => {
              allGroupCodes.push(group.groupCode);
              //allGroups.push(new GroupDescription(group.groupCode, group.groupName, group.tentType));
          });
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });

    for (let i = 0; i < allGroupCodes.length; i+= 1){
        let groupCode = allGroupCodes[i];
        await firestore.collection('groups').doc(groupCode).get()
        .then((groupSnapshot) => {
            let groupData = groupSnapshot.data();
            allGroups.push(new GroupDescription(groupCode, groupData.name, groupData.tentType));
        }).catch((error) => {
            console.error(error);
        })

    }
    console.log("returning from fetchGroups");
    return allGroups;
}

  