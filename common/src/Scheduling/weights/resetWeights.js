/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slots 
 */
export function resetWeights(slots){
    for (var i = 0; i < slots.length; i++){
        var currentSlot = slots[i];
        currentSlot.weight = 1;
    }
}