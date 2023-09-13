import { ScheduledSlot } from "../slots/scheduledSlot";
import { EMPTY } from "../slots/tenterSlot";

/**
 * add 'empty to id arrays to ensure the array length equals the number of people needed
 * @param {Array<ScheduledSlot>} scheduleArr 
 * returns nothing, modifies the grid in place
*/
export function fillEmptySpots(scheduleArr){
    for (var i = 0; i < scheduleArr.length; i++){
        var peopleNeeded = scheduleArr[i].calculatePeopleNeeded();
        while (scheduleArr[i].ids.length < peopleNeeded){
            scheduleArr[i].ids.push(EMPTY);
        }

    }
}