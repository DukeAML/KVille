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

export const REMOVE_USER_ERRORS = {
  USER_DOES_NOT_EXIST: "User does not exist",
  USER_NOT_IN_GROUP: "User is not in group",
  GROUP_DOES_NOT_EXIST: "Group does not exist",
  DEFAULT: "Error removing user",
};

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
      groupsInDB.forEach((group, index) => {
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
      .catch((error) => {
        console.error(error);
      });
  return description;

}

/**
 *
 * @param {String} userID
 * @param {String} groupCode
 */
export async function removeUserFromGroup(userID, groupCode) {
  const userRef = firestore.collection("users").doc(userID);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error(REMOVE_USER_ERRORS.USER_DOES_NOT_EXIST);
  }
  let newUserData = { ...userDoc.data() };
  newUserData.groups = newUserData.groups.filter(
    (group) => group.groupCode !== groupCode
  );
  const userInGroupRef = firestore
    .collection("groups")
    .doc(groupCode)
    .collection("members")
    .doc(userID);
  const userInGroupDoc = await userInGroupRef.get();
  if (!userInGroupDoc.exists) {
    throw new Error(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
  }

  try {
    await firestore.runTransaction(async (transaction) => {
      transaction.delete(userInGroupRef);
      transaction.update(userRef, newUserData);
    });
  } catch (error) {
    throw new Error(REMOVE_USER_ERRORS.DEFAULT);
  }
}

/**
 *
 * @param {String} groupCode
 * @returns {Promise<{userID : String, username : String}[]>} userIDs
 */
export async function getGroupMembersByGroupCode(groupCode) {
  console.log("Fetching for group code " + groupCode);
  const groupRef = firestore
    .collection("groups")
    .doc(groupCode)
    .collection("members");
  let memberDocs = await groupRef.get();
  if (memberDocs.empty) {
    throw new Error(GET_GROUP_MEMBERS_ERRORS.GROUP_DOES_NOT_EXIST);
  }
  return memberDocs.docs.map((doc, index) => {
    return { userID: doc.id, username: doc.data().name };
  });
}
