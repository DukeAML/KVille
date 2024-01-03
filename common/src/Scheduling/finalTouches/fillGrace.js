import { EMPTY, GRACE } from "../slots/tenterSlot";
import { isGrace, scheduleNameForGracePeriod } from "../rules/gracePeriods";

/**
 * Adds in 'Grace Period' to scheduleArr where appropriate
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArr 
 * @returns {void}
 * returns nothing, modifies the grid in place
*/
export function fillGrace(scheduleArr){
    for (var timeIndex = 0; timeIndex < scheduleArr.length; timeIndex++){
        let startDate = scheduleArr[timeIndex].startDate;
        var peopleNeeded = scheduleArr[timeIndex].calculatePeopleNeeded();
        if (peopleNeeded == 0){
            if (isGrace(startDate, false).isGrace){
                let reason = isGrace(startDate, false).reason;
                scheduleArr[timeIndex].ids.push(scheduleNameForGracePeriod(reason));
            } else {
                scheduleArr[timeIndex].ids.push(EMPTY);
            }
        }

    }   
}