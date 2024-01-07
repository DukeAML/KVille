import { TenterSlot } from "../slots/tenterSlot";


export function prioritizeToughTimes(slots : TenterSlot[], scheduleLength : number){
    var availableTentersAtEachTime = new Array(scheduleLength).fill(0);
    for(var i = 0; i < slots.length; i++){
        var currentSlot = slots[i];
        var currentTimeIndex = currentSlot.timeIndex;
        availableTentersAtEachTime[currentTimeIndex] = availableTentersAtEachTime[currentTimeIndex] + 1;
    }
    updateWeightsForEachSlot(slots, availableTentersAtEachTime);
}


function updateWeightsForEachSlot(slots : TenterSlot[], availableTentersAtEachTime : number[]) {
    for (var j = 0; j < slots.length; j++) {
        var currentSlot = slots[j];
        var currentTimeIndex = currentSlot.timeIndex;
        var peopleNeeded = currentSlot.calculatePeopleNeeded();
        var numFreePeople = availableTentersAtEachTime[currentTimeIndex];
        currentSlot.toughTimesScore = (1 / (numFreePeople + 0.01)) * peopleNeeded;
    }
}
