/**
 *  Weight Tough Time - prioritize time slots with few people available. 
 * @param {Array<import("../slots/tenterSlot")TenterSlot>} slots 
 * @param {number} scheduleLength 
 */
export function prioritizeToughTimes(slots, scheduleLength){

    // Set up counterArray (Rows that are filled).
    var availableTentersAtEachTime = new Array(scheduleLength).fill(0);

    for(var i = 0; i < slots.length; i++){
        var currentSlot = slots[i];
        var currentTimeIndex = currentSlot.timeIndex;
        availableTentersAtEachTime[currentTimeIndex] = availableTentersAtEachTime[currentTimeIndex] + 1;
    }
    

    updateWeightsForEachSlot(slots, availableTentersAtEachTime);
}

/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slots 
 * @param {Array<number>} availableTentersAtEachTime 
 */
function updateWeightsForEachSlot(slots, availableTentersAtEachTime) {
    for (var j = 0; j < slots.length; j++) {
        var currentSlot = slots[j];
        var currentTimeIndex = currentSlot.timeIndex;
        var peopleNeeded = currentSlot.calculatePeopleNeeded();

        var numFreePeople = availableTentersAtEachTime[currentTimeIndex];
        var newWeight = currentSlot.weight * (12 / (numFreePeople + 0.01)) * peopleNeeded;

        currentSlot.weight = newWeight;
    }
}
