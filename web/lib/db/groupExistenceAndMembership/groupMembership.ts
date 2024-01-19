import { GroupDescription, GET_GROUP_MEMBERS_ERRORS } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { firestore } from "../firebase_config";
import firebase from 'firebase/compat/app';

export async function fetchGroups(userID : string) : Promise<GroupDescription[]> {
	let allGroups = await fetchAllGroups();
	let usersGroups = [];
	for (let groupIndex = 0; groupIndex < allGroups.length; groupIndex +=1 ){
		let currentGroup = allGroups[groupIndex];
		for (let idIndex = 0; idIndex < currentGroup.memberIDs.length ; idIndex += 1){
			if (currentGroup.memberIDs[idIndex] === userID){
				usersGroups.push(currentGroup.groupDescription);
			}
		}
	}
	return usersGroups;
}

interface GroupDescriptionWithMembers{
	groupDescription : GroupDescription;
	memberIDs : string[];
}
async function fetchAllGroups() : Promise<GroupDescriptionWithMembers[]> {
  return new Promise((resolve, reject) => {
    firestore.collection('groups').get()
      .then((querySnapshot) => {
        const groupPromises : Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>[] = [];

        querySnapshot.forEach((groupDoc) => {
          const membersRef = groupDoc.ref.collection('members').get();
          groupPromises.push(membersRef);
        });

        Promise.all(groupPromises)
          .then((groupSnapshots) => {
            const groupsData : GroupDescriptionWithMembers[] = [];

            groupSnapshots.forEach((membersQuerySnapshot, index) => {
              const groupCode = querySnapshot.docs[index].id;
              const memberIDs = membersQuerySnapshot.docs.map((memberDoc) => memberDoc.id);
              let groupData = querySnapshot.docs[index].data();
              groupsData.push({ groupDescription: new GroupDescription(groupCode, groupData.name, groupData.tentType, groupData.creator), memberIDs });
            });

            resolve(groupsData); // Resolve the Promise with the array of group data
          })
          .catch((error) => {
            reject(error); // Reject the Promise if there's an error
          });
      })
      .catch((error) => {
        reject(error); // Reject the Promise if there's an error
      });
  });
}



export async function fetchGroupData(groupCode : string) : Promise<GroupDescription> {
  const description = await firestore
      .collection("groups")
      .doc(groupCode)
      .get()
      .then((groupSnapshot) => {
        let groupData = groupSnapshot.data();
        if (groupData !== undefined){
          return new GroupDescription(groupCode, groupData.name, groupData.tentType, groupData.creator)
        } else {
          throw new Error("Error")
        }
        
      })
  return description;
}

export interface GroupMemberUserID{
	userID : string;
}
export async function getGroupMembersByGroupCode(groupCode : string) : Promise<GroupMemberUserID[]> {
  const groupRef = firestore
    .collection("groups")
    .doc(groupCode)
    .collection("members");
  let memberDocs = await groupRef.get();
  if (memberDocs.empty) {
    throw new Error(GET_GROUP_MEMBERS_ERRORS.GROUP_DOES_NOT_EXIST);
  }
  return memberDocs.docs.map((doc) => {
    return { userID: doc.id};
  });
}

export async function checkIfMemberIsInGroup(groupCode : string, userID : string) : boolean {
  const groupMembers = await getGroupMembersByGroupCode(groupCode);
  if (!groupMembers.map((member) => member.userID).includes(userID)){
    return false;
  } else {
    return true;
  }
}