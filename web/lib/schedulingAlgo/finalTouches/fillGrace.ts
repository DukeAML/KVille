import { EMPTY, GRACE } from "../slots/tenterSlot";
import { isGrace, scheduleNameForGracePeriod } from "../rules/gracePeriods";
import { ScheduledSlot } from "../slots/scheduledSlot";

export function fillGrace(scheduleArr : ScheduledSlot[]){
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