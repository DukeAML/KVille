import { firestore } from "../firebase_config.js";

export class GroupDescription {
  /**
   *
   * @param {String} groupCode
   * @param {String} groupName
   * @param {String} tentType
   * @param {String} creator
   */
  constructor(groupCode, groupName, tentType, creator="") {
    this.groupCode = groupCode;
    this.groupName = groupName;
    this.tentType = tentType;
    this.creator = creator;
  }
}

export const FETCH_GROUPS_ERRORS = {};


export const GET_GROUP_MEMBERS_ERRORS = {
  GROUP_DOES_NOT_EXIST: "Group does not exist",
};

/**
 * @param {String} userID
 * @returns {Promise<GroupDescription[]>}
 */
export async function fetchGroups(userID) {
  let allGroups = [];
  let allGroupCodes = [];
  await firestore
    .collection("users")
    .doc(userID)
    .get()
    .then((doc) => {
      let groupsInDB = doc.data().groups;
      //console.log("Current user's groups", currGroup);
      groupsInDB.forEach((group) => {
        allGroupCodes.push(group.groupCode);
      });
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  for (let i = 0; i < allGroupCodes.length; i += 1) {
    let groupCode = allGroupCodes[i];
    try{
      const groupData = await fetchGroupData(groupCode);
      if (groupData === undefined){
        continue;
      } else {
        allGroups.push(groupData);
      }
    } catch {
      console.log("this code block shoudl not be possible!!");
    }
  }
  return allGroups;
}

/**
 * 
 * @param {String} groupCode
 * @returns {Promise<GroupDescription>} 
 */
export async function fetchGroupData(groupCode){

  const description = await firestore
      .collection("groups")
      .doc(groupCode)
      .get()
      .then((groupSnapshot) => {
        let groupData = groupSnapshot.data();
        return new GroupDescription(groupCode, groupData.name, groupData.tentType, groupData.creator)
    
      })

  return description;

}



/**
 *
 * @param {String} groupCode
 * @returns {Promise<{userID : String, username : String}[]>} userIDs
 */
export async function getGroupMembersByGroupCode(groupCode) {
  const groupRef = firestore
    .collection("groups")
    .doc(groupCode)
    .collection("members");
  let memberDocs = await groupRef.get();
  if (memberDocs.empty) {
    throw new Error(GET_GROUP_MEMBERS_ERRORS.GROUP_DOES_NOT_EXIST);
  }
  return memberDocs.docs.map((doc) => {
    return { userID: doc.id, username: doc.data().name };
  });
}
