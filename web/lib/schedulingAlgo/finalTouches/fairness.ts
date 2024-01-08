import { olsonParams } from "../../data/olsonParams";
import { TENTER_STATUS_CODES, TenterSlot } from "../slots/tenterSlot";
import { swapScheduledTenters } from "./cleanStraySlots";
import { ScheduledSlot } from "../slots/scheduledSlot";
import { Person } from "../person";

export function ensureFairness(scheduleArr : ScheduledSlot[], people : Person[], tenterSlotsGrid : TenterSlot[][]){
    var sorted_people = [...people];

    var i = 0;
    while ((i < 30) && (maxHourRatio(people) > olsonParams.MAX_HOUR_RATIO)){
        //find a shift to give from the person with most hours to person with least hours
        sorted_people = sorted_people.sort(hoursRank);
        var recipients = [findNumID(sorted_people[0], tenterSlotsGrid),findNumID(sorted_people[1], tenterSlotsGrid)];
        for (var rank = 0; rank < 2; rank++){
            var donor_person = sorted_people[sorted_people.length - rank - 1];
            var donor = findNumID(donor_person, tenterSlotsGrid);
            if (findAndDonateShift(donor, recipients, tenterSlotsGrid, scheduleArr, people))
                break;  
        }
        i += 1;
    }

}


function findAndDonateShift(donor : number, recipients : number[], tenterSlotsGrid : TenterSlot[][], scheduleArr : ScheduledSlot[], people : Person[]) : boolean{
    //find a day shift of 1.5hours or more that can be given from donor to recipient
    var contiguous_slots = 0;
    for (var timeIndex = 0; timeIndex < tenterSlotsGrid[0].length; timeIndex++){
        if ((tenterSlotsGrid[donor][timeIndex].status == TENTER_STATUS_CODES.SCHEDULED) && !(tenterSlotsGrid[donor][timeIndex].isNight)){
            contiguous_slots += 1;

        } else{

            if (contiguous_slots >= 3){
                //check if a recipient can take this slot
                for (var r = 0; r < recipients.length; r++){
                    var recipient = recipients[r];
                    var recipientSlotsArr = tenterSlotsGrid[recipient];
                    if (canScheduleSlot(recipientSlotsArr, timeIndex - contiguous_slots, timeIndex-1)){
                        for (var time = timeIndex - contiguous_slots; time < timeIndex; time++){
                            swapScheduledTenters(people, tenterSlotsGrid, scheduleArr, donor, recipient, time);
                        }
                        return true;
                    }
                }
            }
            contiguous_slots = 0;
        }
    }
    return false;
}


function canScheduleSlot(recipientSlotsArr : TenterSlot[], beginningTimeIndex : number, endTimeIndex : number) : boolean{
    if (!checkIfRecipientIsFreeFromBeginningToEnd(recipientSlotsArr, beginningTimeIndex, endTimeIndex)){
        return false;
    }

    if (checkIfRecipientIsScheduledForNearbySlots(recipientSlotsArr, beginningTimeIndex, endTimeIndex)){
        return false;
    }

    return true;
}


function checkIfRecipientIsFreeFromBeginningToEnd(recipientSlotsArr : TenterSlot[], beginningTimeIndex : number, endTimeIndex : number) : boolean{
    for (var time = beginningTimeIndex; time <= endTimeIndex; time++){
        if (!(recipientSlotsArr[time].getIsEligibleForAssignment())){
            return false;
        }
    }
    return true;
}

/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} recipientSlotsArr 
 * @param {number} beginningTimeIndex 
 * @param {number} endTimeIndex 
 * @returns {boolean}
 */
function checkIfRecipientIsScheduledForNearbySlots(recipientSlotsArr : TenterSlot[], beginningTimeIndex : number, endTimeIndex : number){
    for (var time = beginningTimeIndex; time >= Math.max(beginningTimeIndex - 4, 0); time--){
        if ((recipientSlotsArr[time].status == TENTER_STATUS_CODES.SCHEDULED) && !(recipientSlotsArr[time].isNight)){
            return true;
        }
    }
    for (var time2 = endTimeIndex; time2 < Math.min(endTimeIndex + 5, recipientSlotsArr.length); time2++){
        if ((recipientSlotsArr[time2].status == TENTER_STATUS_CODES.SCHEDULED) && !(recipientSlotsArr[time2].isNight)){
            return true;
        }
    }
    return false;
}


function maxHourRatio(people : Person[]) : number{
    var maxHours = 0;
    var minHours = 999999;
    for (var i = 0; i < people.length; i++){
        var hours = (people[i].dayScheduled + people[i].nightScheduled) /2;
        if (hours > maxHours){
            maxHours = hours;
        } 
        if (hours < minHours){
            minHours = hours;
        }
    }
    return (1 + ((maxHours - minHours)/maxHours));
}


function hoursRank(p1 : Person, p2 : Person) : number {
    return (p2.dayScheduled + p2.nightScheduled - p1.dayScheduled - p1.nightScheduled);
}


function findNumID(person : Person, tenterSlotsGrid : TenterSlot[][]) : number{
    for (var personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex++){
        if (tenterSlotsGrid[personIndex][0].personID === person.id){
            return personIndex;
        }
    }
    return -1;
}