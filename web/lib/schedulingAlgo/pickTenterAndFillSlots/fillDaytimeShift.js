import { assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime } from "./pickTenterAndFillSlot";
import { TENTER_STATUS_CODES } from "../slots/tenterSlot";
import { olsonParams } from "../../data/olsonParams";

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
    var slotsForThisTenter = tenterSlotsGrid[chosenPersonIndex];
    var { possibleShiftRangeStartTimeIndex, possibleShiftRangeEndTimeIndex } = getStartAndEndOfPossibleDaytimeRange(chosenTimeIndex, slotsForThisTenter, tenterSlotsGrid);
    remainingSlots = fillDaytimeShiftAndReturnRemainingSlots(possibleShiftRangeEndTimeIndex, possibleShiftRangeStartTimeIndex, remainingSlots, tenterSlotsGrid, chosenPersonIndex, people, slotsForThisTenter);
    return remainingSlots;
}


/**
 * 
 * @param {number} possibleShiftRangeEndTimeIndex 
 * @param {number} possibleShiftRangeStartTimeIndex 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} chosenPersonIndex 
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slotsForThisTenter 
 * @param {number} chosenTimeIndex
 * @returns {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots
 */
function fillDaytimeShiftAndReturnRemainingSlots(possibleShiftRangeEndTimeIndex, possibleShiftRangeStartTimeIndex, remainingSlots, tenterSlotsGrid, chosenPersonIndex, people, slotsForThisTenter) {
    let {optimalStartTimeIndex, optimalEndTimeIndex} = findOptimalStartAndEndTimeIndicesForShift(slotsForThisTenter, possibleShiftRangeStartTimeIndex, possibleShiftRangeEndTimeIndex);
    for (let timeIndex = optimalStartTimeIndex; timeIndex <= optimalEndTimeIndex; timeIndex += 1){
        remainingSlots = assignTenterToOneSlotAndReturnRemainingSlots(slotsForThisTenter[timeIndex], people, remainingSlots, tenterSlotsGrid);
    }
    return remainingSlots;
}



/**
 * 
 * @param {number} possibleShiftRangeEndTimeIndex 
 * @param {number} possibleShiftRangeStartTimeIndex 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slotsForThisTenter 
 * @returns {{optimalStartTimeIndex : number, optimalEndTimeIndex : number}} remainingSlots
 */
function findOptimalStartAndEndTimeIndicesForShift(slotsForThisTenter, possibleShiftRangeStartTimeIndex, possibleShiftRangeEndTimeIndex){
    if (possibleShiftRangeEndTimeIndex - possibleShiftRangeStartTimeIndex < olsonParams.IDEAL_DAY_SHIFT_LENGTH){
        return {optimalStartTimeIndex : possibleShiftRangeStartTimeIndex, optimalEndTimeIndex : possibleShiftRangeEndTimeIndex};
    }

    let valueOfShiftStartingAtIndexOffset = new Array((1 + possibleShiftRangeEndTimeIndex - possibleShiftRangeStartTimeIndex) - (olsonParams.IDEAL_DAY_SHIFT_LENGTH -1)).fill(0);
    for (let startIndexOffset = 0; (startIndexOffset + possibleShiftRangeStartTimeIndex + olsonParams.IDEAL_DAY_SHIFT_LENGTH -1) <= possibleShiftRangeEndTimeIndex; startIndexOffset += 1){
        let value = 0;
        for (let i = 0; i < olsonParams.IDEAL_DAY_SHIFT_LENGTH; i += 1){
            value += slotsForThisTenter[possibleShiftRangeStartTimeIndex + startIndexOffset + i].getWeight();
            valueOfShiftStartingAtIndexOffset[startIndexOffset] = value;
        }
    }

    
    let maxValue = 0;
    let optimalIndexOffset = 0;
    for (let startIndexOffset = 0; startIndexOffset < valueOfShiftStartingAtIndexOffset.length; startIndexOffset += 1){
        if (valueOfShiftStartingAtIndexOffset[startIndexOffset] > maxValue){
            optimalIndexOffset = startIndexOffset;
            maxValue = valueOfShiftStartingAtIndexOffset[startIndexOffset];
        }
    }
    return {optimalStartTimeIndex: optimalIndexOffset + possibleShiftRangeStartTimeIndex, optimalEndTimeIndex : possibleShiftRangeStartTimeIndex + optimalIndexOffset + olsonParams.IDEAL_DAY_SHIFT_LENGTH -1};
}

/**
 * 
 * @param {number} chosenTimeIndex 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slotsForThisTenter 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @returns {{possibleShiftRangeStartTimeIndex : number, possibleShiftRangeEndTimeIndex : number}}
 */
export function getStartAndEndOfPossibleDaytimeRange(chosenTimeIndex, slotsForThisTenter, tenterSlotsGrid) {
    var minShiftRangeStartTimeIndex = Math.max(0, chosenTimeIndex - 3); //bc edge case
    var maxShiftRangeEndTimeIndex = Math.min(slotsForThisTenter.length - 1, chosenTimeIndex + 3); //check 3 before + 3 after

    //check for one big consecutive block within the workHere from checkStart-checkEnd
    var possibleShiftRangeStartTimeIndex = minShiftRangeStartTimeIndex; //may not remain the same
    var possibleShiftRangeEndTimeIndex = maxShiftRangeEndTimeIndex; //actually possible Start/End indices

    for (let i = minShiftRangeStartTimeIndex; i <= maxShiftRangeEndTimeIndex; i++) {
        let timeIsFilled = getNumberScheduledAtChosenTime(tenterSlotsGrid, i) >= slotsForThisTenter[i].calculatePeopleNeeded();
        if (!slotsForThisTenter[i].getIsEligibleForAssignment() || timeIsFilled || slotsForThisTenter[i].isNight) {
            //cut this part off, either from left or right(whichever side it's on)
            //making sure to include the chosen slot
            //is it to the left or to the right? which will create less harm 
            if (i < chosenTimeIndex){
                possibleShiftRangeStartTimeIndex = i + 1; //will only increase
            } 
            if (i > chosenTimeIndex) {
                possibleShiftRangeEndTimeIndex = i - 1; //up to and including
                break; //there's no pt checking after this
            }
        }
    }
    return { possibleShiftRangeStartTimeIndex, possibleShiftRangeEndTimeIndex };
}