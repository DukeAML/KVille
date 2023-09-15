import { GRACE } from "../slots/tenterSlot";

/**
 * Adds in 'Grace Period' to scheduleArr where appropriate
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr 
 * @returns {void}
 * returns nothing, modifies the grid in place
*/
export function fillGrace(scheduleArr){
    for (var timeIndex = 0; timeIndex < scheduleArr.length; timeIndex++){
        var peopleNeeded = scheduleArr[timeIndex].calculatePeopleNeeded();
        if (peopleNeeded == 0){
            scheduleArr[timeIndex].ids.push(GRACE);
        }

    }   
}