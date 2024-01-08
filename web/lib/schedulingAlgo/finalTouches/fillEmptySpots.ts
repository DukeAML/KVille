import { ScheduledSlot } from "../slots/scheduledSlot";
import { EMPTY } from "../slots/tenterSlot";


export function fillEmptySpots(scheduleArr : ScheduledSlot[]){
    for (var timeIndex = 0; timeIndex < scheduleArr.length; timeIndex++){
        var peopleNeeded = scheduleArr[timeIndex].calculatePeopleNeeded();
        while (scheduleArr[timeIndex].ids.length < peopleNeeded){
            scheduleArr[timeIndex].ids.push(EMPTY);
        }

    }
}