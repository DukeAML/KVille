import { TenterSlot } from "../slots/tenterSlot";
import {assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime} from "./pickTenterAndFillSlot";
import { Person } from "../person";


export function tryToEliminateStraySlotAtEdgesOfShift(tenterSlotsGrid : TenterSlot[][], people : Person[], remainingSlots : TenterSlot[], chosenPersonIndex : number, chosenTimeIndex : number) : TenterSlot[]{
    let firstTimeIndexBeforeShift = getFirstTimeIndexOfShift(chosenTimeIndex, chosenPersonIndex, tenterSlotsGrid) -1;
    let firstTimeIndexAfterShift = getLastTimeIndexOfShift(chosenTimeIndex, chosenPersonIndex, tenterSlotsGrid) + 1;
    let remainingSlotsAfterStrayCheck = remainingSlots;
    if (checkIfStraySlotIsPossibleAtIndex(firstTimeIndexBeforeShift, tenterSlotsGrid)){
        remainingSlotsAfterStrayCheck = tryToFillTimeSlot(tenterSlotsGrid, people, remainingSlotsAfterStrayCheck, firstTimeIndexBeforeShift);
    }
    if (checkIfStraySlotIsPossibleAtIndex(firstTimeIndexAfterShift, tenterSlotsGrid)){
        remainingSlotsAfterStrayCheck = tryToFillTimeSlot(tenterSlotsGrid, people, remainingSlotsAfterStrayCheck, firstTimeIndexAfterShift);
    }
    return remainingSlotsAfterStrayCheck;
}


function tryToFillTimeSlot(tenterSlotsGrid : TenterSlot[][], people : Person[], remainingSlots : TenterSlot[], timeIndex : number) : TenterSlot[]{
    let slotsToChooseFrom = getEligibleTenterSlotsForTimeIndexWhereTenterIsScheduledAboveOrBelow(tenterSlotsGrid, timeIndex);
    if (slotsToChooseFrom.length > 0){
        slotsToChooseFrom.sort((a, b) => b.getWeightWithoutContinuityScore() - a.getWeightWithoutContinuityScore());
        let chosenSlot = slotsToChooseFrom[0];
        return assignTenterToOneSlotAndReturnRemainingSlots(chosenSlot, people, remainingSlots, tenterSlotsGrid);
    } else {
        return remainingSlots;
    }

}


function getEligibleTenterSlotsForTimeIndexWhereTenterIsScheduledAboveOrBelow(tenterSlotsGrid : TenterSlot[][], timeIndex :  number) : TenterSlot[]{
    let desiredSlots = [];
    for (let personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex += 1){
        if (tenterSlotsGrid[personIndex][timeIndex].getIsEligibleForAssignment()){
            let priorTimeIndex = timeIndex - 1;
            let nextTimeIndex = timeIndex + 1;
            if (priorTimeIndex >= 0){
                if (tenterSlotsGrid[personIndex][priorTimeIndex].getIsScheduled()){
                    desiredSlots.push(tenterSlotsGrid[personIndex][timeIndex]);
                    continue;
                }
            }
            if (nextTimeIndex < tenterSlotsGrid[0].length){
                if (tenterSlotsGrid[personIndex][nextTimeIndex].getIsScheduled()){
                    desiredSlots.push(tenterSlotsGrid[personIndex][timeIndex]);
                }
            }
        }
    }
    return desiredSlots;
}


function getFirstTimeIndexOfShift(chosenTimeIndex : number, chosenPersonIndex :  number, tenterSlotsGrid : TenterSlot[][]) :  number{
    let firstTimeIndexOfShift = chosenTimeIndex;
    while (tenterSlotsGrid[chosenPersonIndex][firstTimeIndexOfShift].getIsScheduled()){
        firstTimeIndexOfShift -= 1;
        if (firstTimeIndexOfShift < 0){
            break;
        }
    }
    return firstTimeIndexOfShift + 1;
}


function getLastTimeIndexOfShift(chosenTimeIndex : number, chosenPersonIndex : number, tenterSlotsGrid : TenterSlot[][]){
    let lastTimeIndexOfShift = chosenTimeIndex;
    while (tenterSlotsGrid[chosenPersonIndex][lastTimeIndexOfShift].getIsScheduled()){
        lastTimeIndexOfShift += 1;
        if (lastTimeIndexOfShift >= tenterSlotsGrid[chosenPersonIndex].length){
            break;
        }
    }
    return lastTimeIndexOfShift - 1;
}


function checkIfStraySlotIsPossibleAtIndex(timeIndex : number, tenterSlotsGrid : TenterSlot[][]) : boolean{
    if (timeIndex < 0 || timeIndex >= tenterSlotsGrid[0].length){
        return false;
    }
    let numNeededAtPriorSlot = 0;
    let priorTimeIndex = timeIndex - 1;
    if (priorTimeIndex >= 0){
        numNeededAtPriorSlot = tenterSlotsGrid[0][priorTimeIndex].calculatePeopleNeeded() - getNumberScheduledAtChosenTime(tenterSlotsGrid, priorTimeIndex);   
    } else {
        numNeededAtPriorSlot = 0;
    }

    let numNeededAtNextSlot = 0;
    let nextTimeIndex = timeIndex + 1;
    if (nextTimeIndex < tenterSlotsGrid[0].length){
        numNeededAtNextSlot = tenterSlotsGrid[0][nextTimeIndex].calculatePeopleNeeded() - getNumberScheduledAtChosenTime(tenterSlotsGrid, nextTimeIndex);

    } else {
        numNeededAtNextSlot = 0;
    }

    let numNeededAtThisSlot = tenterSlotsGrid[0][timeIndex].calculatePeopleNeeded() - getNumberScheduledAtChosenTime(tenterSlotsGrid, timeIndex);
    
    if (numNeededAtPriorSlot == 0){
        if (numNeededAtThisSlot > numNeededAtNextSlot){
            return true;
        }
    } else if (numNeededAtNextSlot == 0){
        if (numNeededAtThisSlot > numNeededAtPriorSlot){
            return true;
        }
    } else {
        return false;
    }
    return false;

}

