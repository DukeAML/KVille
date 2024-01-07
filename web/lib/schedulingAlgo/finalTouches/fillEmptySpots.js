import { EMPTY } from "../slots/tenterSlot";

/**
 * add 'empty to id arrays to ensure the array length equals the number of people needed
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr 
 * returns nothing, modifies the grid in place
*/
export function fillEmptySpots(scheduleArr){
    for (var timeIndex = 0; timeIndex < scheduleArr.length; timeIndex++){
        var peopleNeeded = scheduleArr[timeIndex].calculatePeopleNeeded();
        while (scheduleArr[timeIndex].ids.length < peopleNeeded){
            scheduleArr[timeIndex].ids.push(EMPTY);
        }

    }
}