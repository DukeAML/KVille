import { assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime } from "./pickTenterAndFillSlot";
import { TENTER_STATUS_CODES, TenterSlot } from "../slots/tenterSlot";
import { olsonParams } from "../../data/olsonParams";
import { Person } from "../person";


export function assignTenterToDaytimeShiftAndReturnRemainingSlots(chosenTenterSlot : TenterSlot, people : Person[], remainingSlots : TenterSlot[], tenterSlotsGrid : TenterSlot[][]) : TenterSlot[]{
    var chosenTimeIndex = chosenTenterSlot.timeIndex;
    var chosenPersonIndex = chosenTenterSlot.personIndex;
    var slotsForThisTenter = tenterSlotsGrid[chosenPersonIndex];
    var { possibleShiftRangeStartTimeIndex, possibleShiftRangeEndTimeIndex } = getStartAndEndOfPossibleDaytimeRange(chosenTimeIndex, slotsForThisTenter, tenterSlotsGrid);
    remainingSlots = fillDaytimeShiftAndReturnRemainingSlots(possibleShiftRangeEndTimeIndex, possibleShiftRangeStartTimeIndex, remainingSlots, tenterSlotsGrid, chosenPersonIndex, people, slotsForThisTenter);
    return remainingSlots;
}



function fillDaytimeShiftAndReturnRemainingSlots(possibleShiftRangeEndTimeIndex : number, possibleShiftRangeStartTimeIndex : number, remainingSlots : TenterSlot[], 
    tenterSlotsGrid : TenterSlot[][], chosenPersonIndex : number, people : Person[], slotsForThisTenter : TenterSlot[]) : TenterSlot[] {
    let {optimalStartTimeIndex, optimalEndTimeIndex} = findOptimalStartAndEndTimeIndicesForShift(slotsForThisTenter, possibleShiftRangeStartTimeIndex, possibleShiftRangeEndTimeIndex);
    for (let timeIndex = optimalStartTimeIndex; timeIndex <= optimalEndTimeIndex; timeIndex += 1){
        remainingSlots = assignTenterToOneSlotAndReturnRemainingSlots(slotsForThisTenter[timeIndex], people, remainingSlots, tenterSlotsGrid);
    }
    return remainingSlots;
}



interface OptimalStartAndEndTimesInterface{
    optimalStartTimeIndex : number;
    optimalEndTimeIndex : number;
}
function findOptimalStartAndEndTimeIndicesForShift(slotsForThisTenter : TenterSlot[], possibleShiftRangeStartTimeIndex : number, possibleShiftRangeEndTimeIndex : number) : OptimalStartAndEndTimesInterface{
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



interface PossibleStartAndEndTimesInterface{
    possibleShiftRangeStartTimeIndex : number;
    possibleShiftRangeEndTimeIndex : number;
}
export function getStartAndEndOfPossibleDaytimeRange(chosenTimeIndex : number , slotsForThisTenter : TenterSlot[], tenterSlotsGrid : TenterSlot[][]) : PossibleStartAndEndTimesInterface  {
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