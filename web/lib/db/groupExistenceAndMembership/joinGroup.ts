import { firestore} from "@/lib/db/firebase_config";
import { GroupDescription } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { getGroupMembersByGroupCode } from "./groupMembership";
import { CURRENT_YEAR, getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { NewGroupData } from "./createGroup";
import firebase from "firebase/compat/app";
import { getErrorMessage } from "../errorHandling";
import { JOIN_GROUP_ERROR_CODES, getDefaultGroupMemberData } from "@/lib/controllers/groupMembershipAndExistence/joinGroupController";

export async function checkIfGroupExistsByGroupCode(groupCode : string) : Promise<boolean> {
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



interface PossibleToJoinGroup{
    canJoinGroup : boolean;
    errorMessage : string;
}
async function checkIfItIsPossibleToJoinGroup(groupCode : string, userID : string) : Promise<PossibleToJoinGroup> {
    let groupExists = await checkIfGroupExistsByGroupCode(groupCode);
    if (!groupExists) {
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.GROUP_DOES_NOT_EXIST};
    }
    let existingGroupMembers = await getGroupMembersByGroupCode(groupCode);
    let existingGroupMemberIDs = existingGroupMembers.map((member) => member.userID);
    if (existingGroupMemberIDs.length >= 12){
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.GROUP_IS_FULL};
    }


    if (existingGroupMemberIDs.includes(userID)){
        return {canJoinGroup : false, errorMessage : JOIN_GROUP_ERROR_CODES.ALREADY_IN};
    }
    return {canJoinGroup : true, errorMessage : "You can join this group"};
}


interface GroupDataForGroupRef{
    groupName : string;
    tentType : string;
    creator : string;
    groupScheduleStartDate : Date;
}
async function getGroupDataForGroupRef(groupRef : firebase.firestore.DocumentReference<firebase.firestore.DocumentData>) : Promise<GroupDataForGroupRef> {
    let groupName = '';
    let tentType = '';
    let creator = '';
    let groupScheduleStartDate = new Date(getScheduleDates(CURRENT_YEAR).startOfBlack);
    await groupRef.get().then((groupSnapshot) => {
        let groupData = groupSnapshot.data();
        if (groupData !== undefined){
            groupName = groupData.name;
            tentType = groupData.tentType;
            creator = groupData.creator;
            groupScheduleStartDate = groupData.groupScheduleStartDate.toDate();
        }
    })
    return {groupName, tentType, creator, groupScheduleStartDate};
}



export async function tryToJoinGroup(groupCode : string, userID : string) : Promise<GroupDescription> {
    const groupRef = firestore.collection('groups').doc(groupCode);
    let {canJoinGroup, errorMessage} = await checkIfItIsPossibleToJoinGroup(groupCode, userID);
    if (!canJoinGroup){
        throw new Error(errorMessage);
    }
    let {groupName, tentType, creator, groupScheduleStartDate} = await getGroupDataForGroupRef(groupRef);
    try {
        await firestore.runTransaction(async (transaction) => {
            let newMemberRef = groupRef.collection('members').doc(userID);
            transaction.set(newMemberRef,  getDefaultGroupMemberData(tentType, groupScheduleStartDate.getFullYear()));
        })
    } catch (error) {
        throw new Error(getErrorMessage(error));
    } 
    return new GroupDescription(groupCode, groupName, tentType, creator);

}


