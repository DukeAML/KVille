import { Person } from "../person";
import { ScheduledSlot } from "../slots/scheduledSlot";
import { TENTER_STATUS_CODES, TenterSlot } from "../slots/tenterSlot";
import { EMPTY, GRACE } from "../slots/tenterSlot";

/**
 * There will be some poorly scheduled shifts where a tenter is there for just 30 minutes. 
 * This method tries to remove those by extending the next tenter or prior tenter's shift
 * Returns a modified copy of scheduleArr (DOES NOT MODIFY scheduleArr IN PLACE, 
 *  but does modify everything else in place)
*/
export function cleanStraySlots(scheduleArr : ScheduledSlot[], people : Person[], tenterSlotsGrid : TenterSlot[][]) : ScheduledSlot[]{
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
                let indexAbove = findTenterAboveToEdit(tenterSlotsGrid, timeIndex);
                if (indexAbove != null){
                    swapScheduledTenters(people, tenterSlotsGrid, newGrid, tenterIndexInGrid, indexAbove, timeIndex);
                    break;
                }

                //if that hasn't worked, try to schedule someone from below into the current slot
                let indexBelow = findTenterBelowToEdit(tenterSlotsGrid, timeIndex);
                if (indexBelow != null){
                    swapScheduledTenters(people, tenterSlotsGrid, newGrid, tenterIndexInGrid, indexBelow, timeIndex);
                    break;
                }
                hadToExtendCount += 1;

                //if that hasn't worked, try to schedule stray tenter in the above time slot
                if ((tenterSlotsGrid[tenterIndexInGrid][timeIndex-1].getIsEligibleForAssignment(false)) && !(tenterSlotsGrid[tenterIndexInGrid][timeIndex-1].isNight)){
                    let indexToRemove = findTenterAboveToEdit(tenterSlotsGrid, timeIndex);
                    if (indexToRemove != null){
                        swapScheduledTenters(people, tenterSlotsGrid, newGrid, indexToRemove, tenterIndexInGrid, timeIndex-1);
                        break;
                    } 
                }

                //if that doesn't work, try to schedule stray tenter in the below slot
                if ((tenterSlotsGrid[tenterIndexInGrid][timeIndex+1].getIsEligibleForAssignment(false)) && !(tenterSlotsGrid[tenterIndexInGrid][timeIndex-1].isNight)){
                    let indexToRmv = findTenterBelowToEdit(tenterSlotsGrid, timeIndex);
                    if (indexToRmv != null){
                        swapScheduledTenters(people, tenterSlotsGrid, newGrid, indexToRmv, tenterIndexInGrid, timeIndex+1);
                        break;
                    }
                }
            

            }

        }
    }   

    return newGrid;
}


function tenterIsInStraySlotAndShouldBeReplaced(tenterID : string, newGrid : ScheduledSlot[], timeIndex : number) : boolean{
    if (tenterID == EMPTY || tenterID == GRACE)
        return false;
    var previousTenters = newGrid[timeIndex-1].ids;
    var nextTenters = newGrid[timeIndex+1].ids;
    if (previousTenters.includes(tenterID) || nextTenters.includes(tenterID)){
        //this tenter is fine, they're scheduled for a shift either before or after this one
        return false;
    }
    return true;
}




export function swapScheduledTenters(people : Person[], tenterSlotsGrid : TenterSlot[][], newGrid : ScheduledSlot[], tenterIndexToRemove : number, newTenterIndex : number, timeslot : number) {
    var personToRemove = people[tenterIndexToRemove];
    personToRemove.dayScheduled -= 1;
    people[newTenterIndex].dayScheduled += 1;
    tenterSlotsGrid[tenterIndexToRemove][timeslot].status = TENTER_STATUS_CODES.AVAILABLE;
    tenterSlotsGrid[newTenterIndex][timeslot].status = TENTER_STATUS_CODES.SCHEDULED;

    var newSlotIDs = [people[newTenterIndex].id];
    for (var scheduledTenterIndex = 0; scheduledTenterIndex < newGrid[timeslot].ids.length; scheduledTenterIndex++){
        if (newGrid[timeslot].ids[scheduledTenterIndex] == people[tenterIndexToRemove].id)
            continue;
        else
            newSlotIDs.push(newGrid[timeslot].ids[scheduledTenterIndex])
    }

    newGrid[timeslot].ids = newSlotIDs;
}


function findTenterAboveToEdit(tenterSlotsGrid : TenterSlot[][], timeslot : number) : number | null {
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


function findTenterBelowToEdit(tenterSlotsGrid : TenterSlot[][], timeslot : number) : number | null{
    
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