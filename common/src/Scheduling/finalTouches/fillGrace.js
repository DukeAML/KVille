import { GRACE } from "../slots/tenterSlot";

/**
 * Adds in 'Grace Period' to scheduleArr where appropriate
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr 
 * @returns {void}
 * returns nothing, modifies the grid in place
*/
export function fillGrace(scheduleArr){
    for (var i = 0; i < scheduleArr.length; i++){
        var peopleNeeded = scheduleArr[i].calculatePeopleNeeded();
        if (peopleNeeded == 0){
            scheduleArr[i].ids.push(GRACE);
        }

    }   
}