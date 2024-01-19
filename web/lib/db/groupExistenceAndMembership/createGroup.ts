import { firestore} from "@/lib/db/firebase_config";
import { getDefaultGroupMemberData } from "@/lib/controllers/groupMembershipAndExistence/joinGroupController";
import {generateGroupCode} from "./GroupCode";
import { getTentingStartDate } from "@/lib/calendarAndDatesUtils/tentingDates";
import { CURRENT_YEAR, getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { getDatePlusNumShifts, getNumSlotsBetweenDates } from "@/lib/calendarAndDatesUtils/datesUtils";
import { EMPTY } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { Slot } from "@/lib/schedulingAlgo/slots/slot";
import { isGrace, scheduleNameForGracePeriod } from "@/lib/schedulingAlgo/rules/gracePeriods";
import { CREATE_GROUP_ERROR_CODES, GROUP_CODE_LENGTH } from "@/lib/controllers/groupMembershipAndExistence/createGroupController";

async function getGroupExistsByGroupName(groupName : string) : Promise<boolean> {
    let queryResults = await firestore.collection('groups').where('name', '==', groupName).get();
    if (queryResults.empty){
        return false;
    } else {
        return true;
    }

}



export function getDefaultSchedule(tentType : string, year : number) : string[]{
    let startDate = getTentingStartDate(tentType, year);
    let endDate = getScheduleDates(year).endOfTenting;
    let numSlots = getNumSlotsBetweenDates(startDate, endDate);
    let sched = [];
    for (let i = 0; i < numSlots; i += 1){
        let slot = new Slot(getDatePlusNumShifts(startDate, i), tentType);
        let numPpl = slot.calculatePeopleNeeded();
        if (slot.isGrace){
            let reason = isGrace(slot.startDate).reason;
            sched.push(scheduleNameForGracePeriod(reason));
            continue;
        }
        sched.push(new Array(numPpl).fill(EMPTY).join(" "));
    }
    return sched;
    
}

/**
 * 
 * @param {String} groupName 
 * @param {String} tentType 
 * @param
 * {String} creator
 */

export interface NewGroupData{
    name : string;
    tentType : string;
    groupSchedule : string[];
    groupScheduleStartDate : Date;
    creator : string;
}
function getDefaultNewGroupData(groupName : string, tentType : string, creator : string) : NewGroupData{
    return {
        name : groupName,
        tentType : tentType,
        groupSchedule : getDefaultSchedule(tentType, CURRENT_YEAR),
        groupScheduleStartDate : getTentingStartDate(tentType, CURRENT_YEAR),
        creator : creator
    }
}


export async function tryToCreateGroup(groupName : string, tentType : string, userID : string) : Promise<string> {
    if (await getGroupExistsByGroupName(groupName)){
        throw new Error(CREATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN);
    }
    let groupCode = await generateGroupCode(GROUP_CODE_LENGTH);
    try {
        await firestore.runTransaction(async (transaction) => {
            let groupRef = firestore.collection('groups').doc(groupCode);
            transaction.set(groupRef, getDefaultNewGroupData(groupName, tentType, userID));
            let groupMembersRef = groupRef.collection('members');
            let myGroupMemberRef = groupMembersRef.doc(userID);
            transaction.set(myGroupMemberRef, getDefaultGroupMemberData(tentType, CURRENT_YEAR));
            
        })
    } catch (error) {
        throw new Error(CREATE_GROUP_ERROR_CODES.CREATE_GROUP_FAILURE);
    } 
    return groupCode;
    
}


