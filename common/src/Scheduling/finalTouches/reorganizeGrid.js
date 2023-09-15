import { EMPTY } from "../slots/tenterSlot";

/**
 * Helper method at the end of schedule(). This is purely for visualization purposes. 
 * It makes the person's name aligned on the final grid
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} scheduleArray 
*/
export function reorganizeGrid(scheduleArray){
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

/**
 * 
 * @param {Array<String>} currIDs 
 * @param {Array<String>} newIDList 
 */
function appendMembersNotFromPriorSlot(currIDs, newIDList) {
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

/**
 * 
 * @param {Array<String>} prevIDs 
 * @param {Array<String>} currIDs 
 * @param {Array<String>} newIDList 
 */
function addMembersFromPriorSlot(prevIDs, currIDs, newIDList) {
    for (var tenterIndex = 0; tenterIndex < prevIDs.length; tenterIndex++) {
        if (currIDs.includes(prevIDs[tenterIndex])) {

            newIDList[tenterIndex] = prevIDs[tenterIndex];
        }
    }
}
