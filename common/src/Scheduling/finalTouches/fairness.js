import { olsonParams } from "../../../data/olsonParams";
import { TENTER_STATUS_CODES } from "../slots/tenterSlot";
import { swapScheduledTenters } from "./cleanStraySlots";
/**
 * This method attempts to ensure fairness by making the difference in hours between the 
 * tenter with the most hours and tenter with the least hours is below the threshold specified in data/olsonParams.json
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr
 * @param {Array<import("../person").Person>} people (array of import("../person").Person objects)
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @returns {void} nothing, modifies everything place. 
 */
export function ensureFairness(scheduleArr, people, tenterSlotsGrid){
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

/**
 * 
 * @param {number} donor (int)
 * @param {number} recipient (int)
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr 
 * @param {Array<import("../person").Person>} people
 */
function findAndDonateShift(donor, recipients, tenterSlotsGrid, scheduleArr, people){
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

/**
 * Helper method
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} recipientSlotsArr 
 * @param {number} beginning 
 * @param {number} end 
 * @returns {boolean}
 */
function canScheduleSlot(recipientSlotsArr, beginning, end){
    if (!checkIfRecipientIsFreeFromBeginningToEnd(recipientSlotsArr, beginning, end)){
        return false;
    }

    if (checkIfRecipientIsScheduledForNearbySlots(recipientSlotsArr, beginning, end)){
        return false;
    }

    return true;
}

/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} recipientSlotsArr 
 * @param {number} beginningIndex 
 * @param {number} endIndex 
 * @returns {boolean}
 */
function checkIfRecipientIsFreeFromBeginningToEnd(recipientSlotsArr, beginningIndex, endIndex){
    for (var time = beginningIndex; time <= endIndex; time++){
        if (!(recipientSlotsArr[time].getIsEligibleForAssignment())){
            return false;
        }
    }
    return true;
}

/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} recipientSlotsArr 
 * @param {number} beginningIndex 
 * @param {number} endIndex 
 * @returns {boolean}
 */
function checkIfRecipientIsScheduledForNearbySlots(recipientSlotsArr, beginningIndex, endIndex){
    for (var time = beginningIndex; time >= Math.max(beginningIndex - 4, 0); time--){
        if ((recipientSlotsArr[time].status == TENTER_STATUS_CODES.SCHEDULED) && !(recipientSlotsArr[time].isNight)){
            return true;
        }
    }
    for (var time2 = endIndex; time2 < Math.min(endIndex + 5, recipientSlotsArr.length); time2++){
        if ((recipientSlotsArr[time2].status == TENTER_STATUS_CODES.SCHEDULED) && !(recipientSlotsArr[time2].isNight)){
            return true;
        }
    }
    return false;
}

/**
 * Finding the ratio of most scheduled hours to least hours across all people
 * @param {Array<import("../person").Person>} people 
 * @returns {number}
 */
function maxHourRatio(people){
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

/**
     * Helper method, returns the difference in scheduled hours between two people
     * @param {import("../person").Person} p1 
     * @param {import("../person").Person} p2 
     * @returns {number}
     */
function hoursRank(p1, p2){
    return (p1.dayScheduled + p1.nightScheduled - p2.dayScheduled - p2.nightScheduled);
}

/**
 * Find which row in the tenterSlotsGrid corresponds to this person
 * @param {import("../person").Person} person 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @returns 
 */
function findNumID(person, tenterSlotsGrid){
    for (var personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex++){
        if (tenterSlotsGrid[personIndex][0].personID == person.id){
            return personIndex;
        }
    }
}