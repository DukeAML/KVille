import * as Yup from "yup";
import { firestore} from "@/lib/db/firebase_config";
import { getNumSlotsBetweenDates } from "@/lib/calendarAndDatesUtils/datesUtils";
import { GroupDescription } from "./groupMembership";
import { getGroupMembersByGroupCode } from "./groupMembership";
import { CURRENT_YEAR, getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { getTentingStartDate } from "@/lib/calendarAndDatesUtils/tentingDates";
import { AvailabilityStatus } from "../availability";
import { NewGroupData } from "./createGroup";

export const JOIN_GROUP_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST : "Group does not exist",
    GROUP_IS_FULL : "Group is full already",
    ALREADY_IN : "You've already joined this group"
}

export const joinGroupValidationSchema = Yup.object({
    groupCode: Yup.string().required('Required')
});


export function getDefaultGroupMemberData(tentType : string, year=CURRENT_YEAR) : {availability : AvailabilityStatus[], availabilityStartDate : Date} {
    let availabilityStartDate = getTentingStartDate(tentType, year);
    let endDate = getScheduleDates(year).endOfTenting;
    let numSlots = getNumSlotsBetweenDates(availabilityStartDate, endDate);
    let availability = new Array(numSlots).fill({available : false, preferred : false});
    return {availability, availabilityStartDate};
}



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
async function getGroupDataForGroupRef(groupRef) : Promise<GroupDataForGroupRef> {
    let groupName = '';
    let tentType = '';
    let creator = '';
    let groupScheduleStartDate = new Date(getScheduleDates(CURRENT_YEAR).startOfBlack);
    await groupRef.get().then((groupSnapshot) => {
        groupName = groupSnapshot.data().name;
        tentType = groupSnapshot.data().tentType;
        creator = groupSnapshot.data().creator;
        groupScheduleStartDate = groupSnapshot.data().groupScheduleStartDate.toDate();
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
        throw new Error(error.message);
    } 
    return new GroupDescription(groupCode, groupName, tentType, creator);

}