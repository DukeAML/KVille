import {assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime} from "./pickTenterAndFillSlot";

/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot[][]} tenterSlotsGrid 
 * @param {import("../person").Person[]} people
 * @param {import("../slots/tenterSlot").TenterSlot[]} remainingSlots
 * @param {number} chosenTimeIndex 
 * @param {number} chosenPersonIndex 
 * @returns {import("../slots/tenterSlot").TenterSlot[]} remainingSlots
 */
export function tryToEliminateStraySlotAtEdgesOfShift(tenterSlotsGrid, people, remainingSlots, chosenPersonIndex, chosenTimeIndex){
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

/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot[][]} tenterSlotsGrid 
 * @param {import("../person").Person[]} people
 * @param {import("../slots/tenterSlot").TenterSlot[]} remainingSlots
 * @param {number} timeIndex 
 * @returns {import("../slots/tenterSlot").TenterSlot[]} remainingSlots
 */
function tryToFillTimeSlot(tenterSlotsGrid, people, remainingSlots, timeIndex){
    let slotsToChooseFrom = getEligibleTenterSlotsForTimeIndexWhereTenterIsScheduledAboveOrBelow(tenterSlotsGrid, timeIndex);
    if (slotsToChooseFrom.length > 0){
        slotsToChooseFrom.sort((a, b) => b.getWeightWithoutContinuityScore() - a.getWeightWithoutContinuityScore());
        let chosenSlot = slotsToChooseFrom[0];
        return assignTenterToOneSlotAndReturnRemainingSlots(chosenSlot, people, remainingSlots, tenterSlotsGrid);
    } else {
        return remainingSlots;
    }

}

/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot[][]} tenterSlotsGrid 
 * @param {number} timeIndex 
 * @returns {import("../slots/tenterSlot").TenterSlot[]}
 */
function getEligibleTenterSlotsForTimeIndexWhereTenterIsScheduledAboveOrBelow(tenterSlotsGrid, timeIndex){
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

/**
 * 
 * @param {number} chosenTimeIndex 
 * @param {number} chosenPersonIndex 
 * @param {import("../slots/tenterSlot").TenterSlot[][]} tenterSlotsGrid 
 * @returns {number}
 */
function getFirstTimeIndexOfShift(chosenTimeIndex, chosenPersonIndex, tenterSlotsGrid){
    let firstTimeIndexOfShift = chosenTimeIndex;
    while (tenterSlotsGrid[chosenPersonIndex][firstTimeIndexOfShift].getIsScheduled()){
        firstTimeIndexOfShift -= 1;
        if (firstTimeIndexOfShift < 0){
            break;
        }
    }
    return firstTimeIndexOfShift + 1;
}

/**
 * 
 * @param {number} chosenTimeIndex 
 * @param {number} chosenPersonIndex 
 * @param {import("../slots/tenterSlot").TenterSlot[][]} tenterSlotsGrid 
 * @returns {number}
 */
function getLastTimeIndexOfShift(chosenTimeIndex, chosenPersonIndex, tenterSlotsGrid){
    let lastTimeIndexOfShift = chosenTimeIndex;
    while (tenterSlotsGrid[chosenPersonIndex][lastTimeIndexOfShift].getIsScheduled()){
        lastTimeIndexOfShift += 1;
        if (lastTimeIndexOfShift >= tenterSlotsGrid[chosenPersonIndex].length){
            break;
        }
    }
    return lastTimeIndexOfShift - 1;
}

/**
 * 
 * @param {number} timeIndex 
 * @param {import("../slots/tenterSlot").TenterSlot[][]} tenterSlotsGrid 
 * @returns {boolean}
 */
function checkIfStraySlotIsPossibleAtIndex(timeIndex, tenterSlotsGrid){
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

}

