import { assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime } from "./pickTenterAndFillSlot";
import { TENTER_STATUS_CODES } from "../slots/tenterSlot";

/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot} chosenTenterSlot 
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @return {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots} chosenTenterSlot 
 */
export function assignTenterToDaytimeShiftAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid){
    var chosenTimeIndex = chosenTenterSlot.timeIndex;
    var chosenPersonIndex = chosenTenterSlot.personIndex;
    var workHere = tenterSlotsGrid[chosenPersonIndex];//array to work off 
    var { apStart, apEnd } = getStartAndEndOfPossibleDaytimeRange(chosenTimeIndex, workHere, tenterSlotsGrid);
    var stuStart = apStart;//4 set to use in workHere starts at this index
    var stuEnd = apEnd;
    //we only rly need stuStart in the else

    //if consecutive block containing target <= 4 then just assign all
    remainingSlots = fillDaytimeShiftAndReturnRemainingSlots(apEnd, apStart, remainingSlots, tenterSlotsGrid, chosenPersonIndex, people, workHere, stuStart, stuEnd);
    return remainingSlots;
}


/**
 * 
 * @param {number} apEnd 
 * @param {number} apStart 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} chosenPersonIndex 
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} workHere 
 * @param {number} stuStart 
 * @param {number} stuEnd 
 * @returns {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots
 */
function fillDaytimeShiftAndReturnRemainingSlots(apEnd, apStart, remainingSlots, tenterSlotsGrid, chosenPersonIndex, people, workHere, stuStart, stuEnd) {
    if (apEnd - apStart + 1 <= 4) { //bc apEnd is up to and including
        for (let i = apStart; i <= apEnd; i++) {
            remainingSlots = assignTenterToOneSlotAndReturnRemainingSlots(tenterSlotsGrid[chosenPersonIndex][i], people, remainingSlots, tenterSlotsGrid);
        }
    } 

    //else get weights of each time slot in the consecutive block > 4 to figure out which to use
    else {
        var wsum = 0;
        var maxWeight = 0;

        var wsums = [0, 0, 0, 0, 0, 0, 0]; //max poss size needed
        for (let i = apStart; i <= apEnd; i++) { //figure out where the most weighted interval is
            //add weight to wsum, store for future reference
            wsum += workHere[i].weight;
            wsums[i - apStart] = wsum;
            if (i > apStart + 3) {
                if ((wsum - wsums[i - apStart - 4]) > maxWeight) {
                    maxWeight = (wsum - wsums[i - apStart - 4]);
                    stuStart = i;
                }
            }
            if (i == apStart + 3) {
                if (wsum > maxWeight) {
                    maxWeight = wsum;
                    stuStart = i;
                }
            }
        }
        stuEnd = Math.min(stuStart + 3, apEnd);
        for (let i = stuStart; i <= stuEnd; i++) {
            remainingSlots = assignTenterToOneSlotAndReturnRemainingSlots(tenterSlotsGrid[chosenPersonIndex][i], people, remainingSlots, tenterSlotsGrid);
        }
    }
    return remainingSlots;
}

/**
 * 
 * @param {number} chosenTimeIndex 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} workHere 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @returns {{apStart : number, apEnd : number}}
 */
export function getStartAndEndOfPossibleDaytimeRange(chosenTimeIndex, workHere, tenterSlotsGrid) {
    var checkStart = Math.max(0, chosenTimeIndex - 3); //bc edge case
    var checkEnd = Math.min(workHere.length - 1, chosenTimeIndex + 3); //check 3 before + 3 after

    //check for one big consecutive block within the workHere from checkStart-checkEnd
    var apStart = checkStart; //may not remain the same
    var apEnd = checkEnd; //actually possible Start/End indices

    for (let i = checkStart; i <= checkEnd; i++) {
        let timeIsFilled = getNumberScheduledAtChosenTime(tenterSlotsGrid, i) >= workHere[i].calculatePeopleNeeded();
        if (workHere[i].status == TENTER_STATUS_CODES.SCHEDULED || workHere[i].status == TENTER_STATUS_CODES.UNAVAILABLE || timeIsFilled || workHere[i].isNight) {
            //cut this part off, either from left or right(whichever side it's on)
            //making sure to include the chosen slot
            //is it to the left or to the right? which will create less harm 
            if (i < chosenTimeIndex) apStart = i + 1; //will only increase
            if (i > chosenTimeIndex) {
                apEnd = i - 1; //up to and including
                break; //there's no pt checking after this
            }
        }
    }
    return { apStart, apEnd };
}