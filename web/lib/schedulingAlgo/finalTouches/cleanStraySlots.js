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
    var newGrid = [...scheduleArr];
    let strayCount = 0;
    let hadToExtendCount = 0;

    //for now, I am avoiding the annoying edge cases at the beginning and end
    for (var timeIndex = 1; timeIndex < scheduleArr.length - 1; timeIndex++){
        var currTenters = newGrid[timeIndex].ids;
        for (var tenterIndex = 0; tenterIndex < currTenters.length; tenterIndex += 1){

            var tenter = currTenters[tenterIndex];
            var tenterIndexInGrid = -1;
            for (var p = 0; p < people.length; p++){
                if (people[p].id == tenter)
                    tenterIndexInGrid = p;
            }
            

            if (tenterIsInStraySlotAndShouldBeReplaced(tenter, newGrid, timeIndex)){
                strayCount += 1;
                //try to schedule someone from above into the current slot
                if (findTenterAboveToEdit(tenterSlotsGrid, timeIndex) != null){
                    var indexAbove = findTenterAboveToEdit(tenterSlotsGrid, timeIndex);
                    swapScheduledTenters(people, tenterSlotsGrid, newGrid, tenterIndexInGrid, indexAbove, timeIndex);
                    break;
                }

                //if that hasn't worked, try to schedule someone from below into the current slot
                if (findTenterBelowToEdit(tenterSlotsGrid, timeIndex)){
                    var indexBelow = findTenterBelowToEdit(tenterSlotsGrid, timeIndex);
                    swapScheduledTenters(people, tenterSlotsGrid, newGrid, tenterIndexInGrid, indexBelow, timeIndex);
                    break;
                }
                hadToExtendCount += 1;

                //if that hasn't worked, try to schedule stray tenter in the above time slot
                if ((tenterSlotsGrid[tenterIndexInGrid][timeIndex-1].getIsEligibleForAssignment(false)) && !(tenterSlotsGrid[tenterIndexInGrid][timeIndex-1].isNight)){
                    if (findTenterAboveToEdit(tenterSlotsGrid, timeIndex) != null){
                        var indexToRemove = findTenterAboveToEdit(tenterSlotsGrid, timeIndex);
                        swapScheduledTenters(people, tenterSlotsGrid, newGrid, indexToRemove, tenterIndexInGrid, timeIndex-1);
                        break;
                    } 
                }

                //if that doesn't work, try to schedule stray tenter in the below slot
                if ((tenterSlotsGrid[tenterIndexInGrid][timeIndex+1].getIsEligibleForAssignment(false)) && !(tenterSlotsGrid[tenterIndexInGrid][timeIndex-1].isNight)){
                    if (findTenterBelowToEdit(tenterSlotsGrid, timeIndex) != null){
                        var indexToRmv = findTenterBelowToEdit(tenterSlotsGrid, timeIndex);
                        swapScheduledTenters(people, tenterSlotsGrid, newGrid, indexToRmv, tenterIndexInGrid, timeIndex+1);
                        break;
                    }
                }
            

            }

        }
    }   

    return newGrid;
}

/**
 * 
 * @param {string} tenter 
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} newGrid 
 * @param {number} timeIndex
 * @returns {boolean}
 */
function tenterIsInStraySlotAndShouldBeReplaced(tenter, newGrid, timeIndex){
    if (tenter == EMPTY || tenter == GRACE)
        return false;
    var previousTenters = newGrid[timeIndex-1].ids;
    var nextTenters = newGrid[timeIndex+1].ids;
    if (previousTenters.includes(tenter) || nextTenters.includes(tenter)){
        //this tenter is fine, they're scheduled for a shift either before or after this one
        return false;
    }
    return true;
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

export function swapScheduledTenters(people, tenterSlotsGrid, newGrid, IndexToRemove, newTenterIndex, timeslot){
    var personToRemove = people[IndexToRemove];
    personToRemove.dayScheduled -= 1;
    people[newTenterIndex].dayScheduled += 1;
    tenterSlotsGrid[IndexToRemove][timeslot].status = TENTER_STATUS_CODES.AVAILABLE;
    tenterSlotsGrid[newTenterIndex][timeslot].status = TENTER_STATUS_CODES.SCHEDULED;

    var newSlotIDs = [people[newTenterIndex].id];
    for (var scheduledTenterIndex = 0; scheduledTenterIndex < newGrid[timeslot].ids.length; scheduledTenterIndex++){
        if (newGrid[timeslot].ids[scheduledTenterIndex] == people[IndexToRemove].id)
            continue;
        else
            newSlotIDs.push(newGrid[timeslot].ids[scheduledTenterIndex])
    }

    newGrid[timeslot].ids = newSlotIDs;
}

/**
 * Helper method for cleanStraySlots()
 * pick someone scheduled in the prior timeslot who is not scheduled for this timeslot
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} timeslot 
 * @returns {number | null}
*/
function findTenterAboveToEdit(tenterSlotsGrid, timeslot){
    if (timeslot <= 0){
        return null;
    }
    for (var personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex++){
        if ((tenterSlotsGrid[personIndex][timeslot-1].status == TENTER_STATUS_CODES.SCHEDULED) && (tenterSlotsGrid[personIndex][timeslot].getIsEligibleForAssignment(false))){
            return personIndex;
        }
    }
    return null;

}

/**
 * Helper method for cleanStraySlots()
 * pick someone scheduled in the next timeslot who is not scheduled for this timeslot
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} timeslot 
 * @returns {number | null}
 */
function findTenterBelowToEdit(tenterSlotsGrid, timeslot){
    
    if (timeslot >= tenterSlotsGrid[0].length -1){
        return null;
    }
    for (var personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex++){
        if ((tenterSlotsGrid[personIndex][timeslot+1].status == TENTER_STATUS_CODES.SCHEDULED) && (tenterSlotsGrid[personIndex][timeslot].getIsEligibleForAssignment(false))){
            return personIndex;
        }
    }
    return null;

}