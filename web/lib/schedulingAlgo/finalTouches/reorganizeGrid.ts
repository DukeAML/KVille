import { ScheduledSlot } from "../slots/scheduledSlot";
import { EMPTY } from "../slots/tenterSlot";


export function reorganizeGrid(scheduleArray : ScheduledSlot[]){
    for (var timeIndex = 1; timeIndex < scheduleArray.length; timeIndex++){
        var currIDs = scheduleArray[timeIndex].ids;
        var prevIDs = scheduleArray[timeIndex-1].ids;

        if (prevIDs.length != currIDs.length)
            continue;

        var newIDList = new Array(currIDs.length);

        addMembersFromPriorSlot(prevIDs, currIDs, newIDList);
        appendMembersNotFromPriorSlot(currIDs, newIDList);
        scheduleArray[timeIndex].ids = newIDList;
    }

}


function appendMembersNotFromPriorSlot(currIDs : string[], newIDList : string[]) {
    for (var tenterIndex = 0; tenterIndex < currIDs.length; tenterIndex++) {
        if ((currIDs[tenterIndex] != EMPTY) && (newIDList.includes(currIDs[tenterIndex])))
            continue;
        else {
            //find somewhere to insert it
            for (var k = 0; k < newIDList.length; k++) {
                if (newIDList[k] == null) {
                    newIDList[k] = currIDs[tenterIndex];
                    break;
                }
            }
        }
    }
}


function addMembersFromPriorSlot(prevIDs : string[], currIDs : string[], newIDList : string[]) {
    for (var tenterIndex = 0; tenterIndex < prevIDs.length; tenterIndex++) {
        if (currIDs.includes(prevIDs[tenterIndex])) {

            newIDList[tenterIndex] = prevIDs[tenterIndex];
        }
    }
}
