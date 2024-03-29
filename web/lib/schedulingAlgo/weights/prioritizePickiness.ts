import { TenterSlot } from "../slots/tenterSlot";


export function prioritizePickiness(tenterSlotsGrid : TenterSlot[][]){
    for (let personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex +=1 ){
        let numSlotsAvailable = 0;
        let slotsForThisTenter = tenterSlotsGrid[personIndex];
        for (let timeIndex = 0; timeIndex < slotsForThisTenter.length; timeIndex += 1){
            let currentSlot = slotsForThisTenter[timeIndex];
            if (currentSlot.getIsEligibleForAssignment()){
                numSlotsAvailable += 1;
            }
        }
        updateWeightsForTenterGivenNumEligibleSlot(numSlotsAvailable, slotsForThisTenter);
    }
}


function updateWeightsForTenterGivenNumEligibleSlot(numSlotsAvailable : number, slotsForThisTenter : TenterSlot[]){
    slotsForThisTenter.forEach((slot) => {
        slot.pickinessScore = 100.00 / (0.1 + numSlotsAvailable);
    })
}