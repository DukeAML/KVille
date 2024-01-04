import { olsonParams } from "../../../data/olsonParams";
import { TENTER_STATUS_CODES } from "../slots/tenterSlot";
/**
 * 
 * @param {number} row 
 * @param {number} rowLength 
 * @returns {number[]}
 */
function gridLimits(row, rowLength){
    return [((row - 1) < 0), ((row + 1) > (rowLength - 1))];
}

/**
 *
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 */
export function prioritizeContinuityForNightSlots(tenterSlotsGrid){
    for (let tenterIndex = 0; tenterIndex < tenterSlotsGrid.length; tenterIndex += 1){
        let slotsForThisTenter = tenterSlotsGrid[tenterIndex];
        for (let timeIndex = 0; timeIndex < slotsForThisTenter.length; timeIndex += 1){
            let slot = slotsForThisTenter[timeIndex];
            if (slot.isNight){
                let futureIndex = timeIndex;
                while (futureIndex < slotsForThisTenter.length && slotsForThisTenter[futureIndex].isNight){
                    let futureSlot = slotsForThisTenter[futureIndex];
                    if (!futureSlot.getIsEligibleForAssignment()){
                        deprioritizeAllSlotsInNightShiftForTenter(slotsForThisTenter, timeIndex);
                        timeIndex += 30;
                        break;
                    }
                    futureIndex += 1;
                }
                timeIndex += 40;

            } else {
                continue;
            }

        }
    }
}

/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slotsForThisTenter 
 * @param {number} startTimeIndex 
 */
function deprioritizeAllSlotsInNightShiftForTenter(slotsForThisTenter, startTimeIndex){
    let currentSlot = slotsForThisTenter[startTimeIndex];
    let currentTimeIndex = startTimeIndex;
    while (currentTimeIndex < slotsForThisTenter.length && currentSlot.isNight){
        currentSlot.continuityScore = 0.0000001;
        currentTimeIndex += 1; 
    }
}

/**
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} allRemainingTenterSlots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 */
export function prioritizeContinuity(allRemainingTenterSlots, tenterSlotsGrid){
    var slotIndex = 0
    while (slotIndex < allRemainingTenterSlots.length){
        var { currentPersonIndex, currentTimeIndex, priorTimeIndex, nextTimeIndex } = getRelevantTimeAndPersonIndices(allRemainingTenterSlots, slotIndex);
        var allSlotsForThisPeson = tenterSlotsGrid[currentPersonIndex];
        var slotsLength = allSlotsForThisPeson.length;
        var [skipAboveRow, skipBelowRow] = gridLimits(currentTimeIndex, slotsLength);
        var currentIsNight = allRemainingTenterSlots[slotIndex].isNight;
        var priorIsNight = !skipAboveRow && allSlotsForThisPeson[priorTimeIndex].isNight;
        var nextIsNight = !skipBelowRow && allSlotsForThisPeson[nextTimeIndex].isNight;
        var { scheduledForPriorTime, scheduledForNextTime, availableForNextTime, availableForPriorTime } = getStatusAtAdjacentTimes(skipAboveRow, allSlotsForThisPeson, priorTimeIndex, skipBelowRow, nextTimeIndex);
        var { numScheduledAbove, numScheduledBelow } = getNumberSlotsScheduledAdjacent(currentTimeIndex, allSlotsForThisPeson);
        var numScheduledToday = getNumScheduledInSurrounding24Hrs(currentTimeIndex, allSlotsForThisPeson);

        var weightMultiplier = getBasicWeightMultiplier(scheduledForPriorTime, scheduledForNextTime, weightMultiplier, availableForNextTime, availableForPriorTime);
        weightMultiplier = deprioritizeThoseWithLotsOfShiftsThisDay(numScheduledToday, weightMultiplier);
        weightMultiplier = prioritizeIdealDayShiftLength(numScheduledAbove, numScheduledBelow, weightMultiplier, availableForPriorTime, priorIsNight, availableForNextTime, nextIsNight);

        //prioritize continuity at night
        if ((scheduledForPriorTime && priorIsNight ) || (scheduledForNextTime && nextIsNight && currentIsNight))
            weightMultiplier = 10000;    
    
        //allRemainingTenterSlots[slotIndex].weight = allRemainingTenterSlots[slotIndex].weight*weightMultiplier;
        allRemainingTenterSlots[slotIndex].continuityScore = weightMultiplier;
        slotIndex += 1;
    }
}



/**
 * 
 * @param {number} numScheduledAbove 
 * @param {number} numScheduledBelow 
 * @param {number} weightMultiplier 
 * @param {boolean} availableForPriorTime 
 * @param {boolean} priorIsNight 
 * @param {boolean} availableForNextTime 
 * @param {boolean} nextIsNight 
 * @returns {number}
 */
function prioritizeIdealDayShiftLength(numScheduledAbove, numScheduledBelow, weightMultiplier, availableForPriorTime, priorIsNight, availableForNextTime, nextIsNight) {
    var newDayLength = numScheduledAbove + numScheduledBelow + 1;
    const IDEAL_DAY_SHIFT_LENGTH = olsonParams.IDEAL_DAY_SHIFT_LENGTH;
    if (newDayLength > IDEAL_DAY_SHIFT_LENGTH) {
        for (var m = 0; m < (newDayLength - IDEAL_DAY_SHIFT_LENGTH); m++) {
            weightMultiplier /= 8;
        }
    } else {
        //prioritize continuity
        if ((newDayLength > 1) && ((availableForPriorTime && !priorIsNight) || (availableForNextTime && !nextIsNight)))
            weightMultiplier = 200;
    }
    return weightMultiplier;
}

/**
 * 
 * @param {number} numScheduledToday 
 * @param {number} weightMultiplier 
 * @returns {number}
 */
function deprioritizeThoseWithLotsOfShiftsThisDay(numScheduledToday, weightMultiplier) {
    var index = 0;
    while (index < numScheduledToday) {
        weightMultiplier *= 0.95;
        index += 1;
    }
    return weightMultiplier;
}

/**
 * 
 * @param {boolean} scheduledForPriorTime 
 * @param {boolean} scheduledForNextTime 
 * @param {boolean} availableForNextTime 
 * @param {boolean} availableForPriorTime 
 * @returns {number}
 */
function getBasicWeightMultiplier(scheduledForPriorTime, scheduledForNextTime, availableForNextTime, availableForPriorTime) {
    var multi = 1;
    if (scheduledForPriorTime && scheduledForNextTime)
        multi = 100;

    // Both are not free
    if (!scheduledForNextTime && !availableForNextTime && !scheduledForPriorTime && !availableForPriorTime)
        multi *= 0.25;

    // Above is scheduled, below is free.
    if (scheduledForPriorTime && !scheduledForNextTime && availableForNextTime)
        multi = 3.25;

    // Below is scheduled, above is free.
    if (scheduledForNextTime && !scheduledForPriorTime && availableForPriorTime)
        multi = 3.25;


    // Above is scheduled, below is not free.
    if (scheduledForPriorTime && !scheduledForNextTime && !availableForNextTime)
        multi = 3;

    // Below is scheduled, above is not free.
    if (scheduledForNextTime && !scheduledForPriorTime && !availableForPriorTime)
        multi = 3;

    // Both are free
    if (availableForNextTime && availableForPriorTime)
        multi = 2.75;

    // Above is free, below is not free
    if (availableForPriorTime && !scheduledForNextTime && !availableForNextTime)
        multi = 1;

    // Below is free, above is not free
    if (availableForNextTime && !scheduledForPriorTime && !availableForPriorTime)
        multi = 1;
    return multi;
}

/**
 * 
 * @param {number} currentTimeIndex 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @returns {number}
 */
function getNumScheduledInSurrounding24Hrs(currentTimeIndex, allSlotsForThisPeson) {
    var numScheduledToday = 0; //num day slots scheduled in the surrounding 24 hours

    var nA = 1;
    while ((currentTimeIndex - nA >= 0) && (nA < 24)) {
        if ((allSlotsForThisPeson[currentTimeIndex - nA].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlotsForThisPeson[currentTimeIndex - nA].isNight))
            //Keith: weight these higher if they are closer to the current slot, rather than just numScheduledToday += 1
            numScheduledToday += 12.0 / (6.0 + nA);
        nA++;
    }
    var nB = 1;
    while ((currentTimeIndex + nB < allSlotsForThisPeson.length) && (nB < 24)) {
        if ((allSlotsForThisPeson[currentTimeIndex + nB].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlotsForThisPeson[currentTimeIndex + nB].isNight))
            numScheduledToday += 12.0 / (6.0 + nB);
        nB++;
    }
    return numScheduledToday;
}

/**
 * 
 * @param {number} currentTimeIndex 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @returns {{numScheduledAbove : number, numScheduledBelow : number}}
 */
function getNumberSlotsScheduledAdjacent(currentTimeIndex, allSlotsForThisPeson) {
    var numScheduledAbove = 0; //num contiguous day slots directly above already scheduled
    var numScheduledBelow = 0; //num contiguous day slots directly below already scheduled
    var nA = 1;
    while ((currentTimeIndex - nA >= 0) && (allSlotsForThisPeson[currentTimeIndex - nA].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlotsForThisPeson[currentTimeIndex - nA].isNight)) {
        numScheduledAbove += 1;
        nA++;
    }
    var nB = 1;
    while ((currentTimeIndex + nB < allSlotsForThisPeson.length) && (allSlotsForThisPeson[currentTimeIndex + nB].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlotsForThisPeson[currentTimeIndex + nB].isNight)) {
        numScheduledBelow += 1;
        nB++;
    }
    return { numScheduledAbove, numScheduledBelow };
}

/**
 * 
 * @param {boolean} skipAboveRow 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @param {number} priorTimeIndex
 * @param {boolean} skipBelowRow 
 * @param {number} nextTimeIndex 
 * @returns {{scheduledForPriorTime : boolean, scheduledForNextTime : boolean, availableForNextTime : boolean, availableForPriorTime : boolean}}
 */
function getStatusAtAdjacentTimes(skipAboveRow, allSlotsForThisPeson, priorTimeIndex, skipBelowRow, nextTimeIndex) {
    var scheduledForPriorTime = !skipAboveRow && allSlotsForThisPeson[priorTimeIndex].status == TENTER_STATUS_CODES.SCHEDULED;
    var scheduledForNextTime = !skipBelowRow && allSlotsForThisPeson[nextTimeIndex].status == TENTER_STATUS_CODES.SCHEDULED;
    var availableForPriorTime = !skipAboveRow && allSlotsForThisPeson[priorTimeIndex].getIsEligibleForAssignment();
    var availableForNextTime = !skipBelowRow && allSlotsForThisPeson[nextTimeIndex].getIsEligibleForAssignment();
    return { scheduledForPriorTime, scheduledForNextTime, availableForNextTime, availableForPriorTime };
}

/**
 * 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} allRemainingTenterSlots 
 * @param {number} i 
 * @returns {{currentPersonIndex : number, currentTimeIndex : number, priorTimeIndex : number, nextTimeIndex : number}}
 */
function getRelevantTimeAndPersonIndices(allRemainingTenterSlots, i) {
    var currentTimeIndex = allRemainingTenterSlots[i].timeIndex;
    var currentPersonIndex = allRemainingTenterSlots[i].personIndex;

    var priorTimeIndex = currentTimeIndex - 1;
    var nextTimeIndex = currentTimeIndex + 1;
    return { currentPersonIndex, currentTimeIndex, priorTimeIndex, nextTimeIndex };
}
