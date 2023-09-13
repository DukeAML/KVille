import { TENTER_STATUS_CODES } from "../slots/tenterSlot";
import { EMPTY, GRACE } from "../slots/tenterSlot";
/**
 * There will be some poorly scheduled shifts where a tenter is there for just 30 minutes. 
 * This method tries to remove those by extending the next tenter or prior tenter's shift
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr 
 * @param {Array<import("../person").Person>} people 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @returns {Array<import("../slots/scheduledSlot").ScheduledSlot>} modified copy of scheduleArr (DOES NOT MODIFY scheduleArr IN PLACE, 
 *  but does modify everything else in place)
*/
export function cleanStraySlots(scheduleArr, people, tenterSlotsGrid){
    var newGrid = [];
    for (var i =0; i < scheduleArr.length; i++){
        var row = scheduleArr[i];
        newGrid.push(row);
    }

    //for now, I am avoiding the annoying edge cases at the beginning and end

    for (var i = 1; i < scheduleArr.length - 1; i++){
        var currTenters = newGrid[i].ids;
        for (var tenterIndex = 0; tenterIndex < currTenters.length; tenterIndex += 1){
            //check if this person is also in the slot above/below
            var loneShift = true;
            var tenter = currTenters[tenterIndex];
            if (tenter == EMPTY || tenter == GRACE)
                continue;
            var previousTenters = newGrid[i-1].ids;
            var nextTenters = newGrid[i+1].ids;
            var tenterIDNum = -1;
            for (var p = 0; p < people.length; p++){
                if (people[p].id == tenter)
                    tenterIDNum = p;
            }
            if (previousTenters.includes(tenter) || nextTenters.includes(tenter)){
                //this tenter is fine, they're scheduled for a shift either before or after this one
                loneShift = false;
                continue;
            }

            if (loneShift){
                //if neither worked, try to schedule someone from above into the current slot
                if (findTenterAboveToEdit(tenterSlotsGrid, i) != null){
                    var [indexAbove, idAbove] = findTenterAboveToEdit(tenterSlotsGrid, i);
                    shiftReplacement(people, tenterSlotsGrid, newGrid, tenterIDNum, indexAbove, i);
                    break;
                }

                //if that hasn't worked, try to schedule someone from below into the current slot
                if (findTenterBelowToEdit(tenterSlotsGrid, i)){
                    var [indexBelow, idBelow] = findTenterBelowToEdit(tenterSlotsGrid, i);
                    shiftReplacement(people, tenterSlotsGrid, newGrid, tenterIDNum, indexBelow, i);
                    break;
                }

                //first try to schedule tenter in the above time slot
                if ((tenterSlotsGrid[tenterIDNum][i-1].status == TENTER_STATUS_CODES.AVAILABLE) && !(tenterSlotsGrid[tenterIDNum][i-1].isNight)){
                    if (findTenterAboveToEdit(tenterSlotsGrid, i) != null){
                        var [indexToRemove, IDToRemove] = findTenterAboveToEdit(tenterSlotsGrid, i);
                        shiftReplacement(people, tenterSlotsGrid, newGrid, indexToRemove, tenterIDNum, i-1);
                        break;
                    } 
                }

                //if that doesn't work, try to schedule tenter in the below slot
                if ((tenterSlotsGrid[tenterIDNum][i+1].status == TENTER_STATUS_CODES.AVAILABLE) && !(tenterSlotsGrid[tenterIDNum][i-1].isNight)){
                    if (findTenterBelowToEdit(tenterSlotsGrid, i) != null){
                        var [indexToRemove, IDToRemove] = findTenterBelowToEdit(tenterSlotsGrid, i);
                        shiftReplacement(people, tenterSlotsGrid, newGrid, indexToRemove, tenterIDNum, i+1);
                        break;
                    }
                }
            

            }

        }
    }

    return newGrid;
}

/**
 * replaces the tenter identified by IndexToRemove with the tenter identified by newTenterIndex at a given time
 * @param {Array<import("../person").Person>} people 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} newGrid 
 * @param {number} IndexToRemove is the person's index in tenterSlotsGrid, i.e. tenterSlotsGrid[IndexToRemove] is their slots
 * @param {number} newTenterIndex same kind of thing as IndexToRemove
 * @param {number} timeslot 
*/

export function shiftReplacement(people, tenterSlotsGrid, newGrid, IndexToRemove, newTenterIndex, timeslot){
    var personToRemove = people[IndexToRemove];
    personToRemove.dayScheduled -= 1;
    people[newTenterIndex].dayScheduled += 1;
    tenterSlotsGrid[IndexToRemove][timeslot].status = TENTER_STATUS_CODES.AVAILABLE;
    tenterSlotsGrid[newTenterIndex][timeslot].status = TENTER_STATUS_CODES.SCHEDULED;

    var newSlotIDs = [people[newTenterIndex].id];
    for (var i = 0; i < newGrid[timeslot].ids.length; i++){
        if (newGrid[timeslot].ids[i] == people[IndexToRemove].id)
            continue;
        else
            newSlotIDs.push(newGrid[timeslot].ids[i])
    }

    newGrid[timeslot].ids = newSlotIDs;
}

/**
 * Helper method for cleanStraySlots()
 * pick someone scheduled in the slot above timeslot who is not scheduled for this timeslot
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} timeslot 
 * @returns [index, ID], or null if there is no such person
*/
function findTenterAboveToEdit(tenterSlotsGrid, timeslot){
    if (timeslot <= 0){
        return null;
    }
    for (var i = 0; i < tenterSlotsGrid.length; i++){
        if ((tenterSlotsGrid[i][timeslot-1].status == TENTER_STATUS_CODES.SCHEDULED) && (tenterSlotsGrid[i][timeslot].status == TENTER_STATUS_CODES.AVAILABLE)){
            return [i, tenterSlotsGrid[i][timeslot-1].personID];
        }
    }
    return null;

}

/**
 * Helper method for cleanStraySlots()
 * pick someone scheduled in the slot below timeslot who is not scheduled for this timeslot
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} timeslot 
 * @returns [index, ID], or null if there is no such person
 */
function findTenterBelowToEdit(tenterSlotsGrid, timeslot){
    
    if (timeslot >= tenterSlotsGrid[0].length -1){
        return null;
    }
    for (var i = 0; i < tenterSlotsGrid.length; i++){
        if ((tenterSlotsGrid[i][timeslot+1].status == TENTER_STATUS_CODES.SCHEDULED) && (tenterSlotsGrid[i][timeslot].status == TENTER_STATUS_CODES.AVAILABLE)){
            return [i, tenterSlotsGrid[i][timeslot+1].personID];
        }
    }
    return null;

}