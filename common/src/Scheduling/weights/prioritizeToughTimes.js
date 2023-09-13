/**
 *  Weight Tough Time - prioritize time slots with few people available. 
 * @param {Array<import("../slots/tenterSlot").import("../slots/tenterSlot").TenterSlot>} slots 
 * @param {number} scheduleLength 
 */
export function prioritizeToughTimes(slots, scheduleLength){

    // Set up counterArray (Rows that are filled).
    var counterArray = new Array(scheduleLength + 1).fill(0);

    // Fill counterArray.
    for(var i = 0; i < slots.length; i++){
        var currentSlot = slots[i];
        var currentRow = currentSlot.row;
        counterArray[currentRow] = counterArray[currentRow] + 1;
    }
    

    // Update Weights.
    for (var j = 0; j < slots.length; j++){   
        var currentSlot = slots[j];
        var currentRow = currentSlot.row; 
        var peopleNeeded = currentSlot.calculatePeopleNeeded();
        
        var numFreePeople = counterArray[currentRow];
        var newWeight = currentSlot.weight*(12/(numFreePeople + 0.01))*peopleNeeded;
        
        currentSlot.weight = newWeight;
    }

}