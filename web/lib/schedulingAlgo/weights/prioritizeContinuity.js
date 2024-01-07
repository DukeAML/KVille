import { olsonParams } from "../../data/olsonParams";
import { TENTER_STATUS_CODES } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { PREFERRED_WEIGHT_FACTOR } from "@/lib/schedulingAlgo/slots/tenterSlot";
/**
 * 
 * @param {number} row 
 * @param {number} rowLength 
 * @returns {number[]}
 */
function gridLimits(row, rowLength){
    return [((row - 1) < 0), ((row +1) > (rowLength - 1))];
}

/**
 *
 * @param {Array<Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
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
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} slotsForThisTenter 
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
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} allRemainingTenterSlots 
 * @param {Array<Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 */
export function prioritizeDaytimeContinuity(allRemainingTenterSlots, tenterSlotsGrid){
    var slotIndex = 0;
    //TODO: check not just whether they are available, but also whether that timeslot is full!!!!
    while (slotIndex < allRemainingTenterSlots.length){
        var { currentPersonIndex, currentTimeIndex, priorTimeIndex, nextTimeIndex } = getRelevantTimeAndPersonIndices(allRemainingTenterSlots, slotIndex);
        var slotsForThisPeson = tenterSlotsGrid[currentPersonIndex];
        var slotsLength = slotsForThisPeson.length;
        var [skipAboveRow, skipBelowRow] = gridLimits(currentTimeIndex, slotsLength);
        var priorIsNight = !skipAboveRow && slotsForThisPeson[priorTimeIndex].isNight;
        var nextIsNight = !skipBelowRow && slotsForThisPeson[nextTimeIndex].isNight;
        var { scheduledForPriorDaytime, scheduledForNextDaytime, availableForNextTime, availableForPriorTime } = getStatusAtAdjacentTimes(skipAboveRow, slotsForThisPeson, priorTimeIndex, skipBelowRow, nextTimeIndex);
        
        var { numScheduledAbove, numScheduledBelow } = getNumberSlotsScheduledAdjacent(currentTimeIndex, slotsForThisPeson);
        var numEligibleAdjacent = getNumberSlotsEligibleAdjacent(currentTimeIndex, slotsForThisPeson);
        var {numScheduledToday, numScheduledInSurrounding5Hrs} = getNumScheduledInSurrounding24Hrs(currentTimeIndex, slotsForThisPeson);

        var weightMultiplier = getBasicWeightMultiplier(scheduledForPriorDaytime, scheduledForNextDaytime, weightMultiplier, availableForNextTime, availableForPriorTime);
        weightMultiplier = deprioritizeThoseWithLotsOfShiftsThisDay(numScheduledToday, weightMultiplier);
        weightMultiplier = prioritizeIdealDayShiftLength(numScheduledAbove, numScheduledBelow, numEligibleAdjacent, weightMultiplier, availableForPriorTime, priorIsNight, availableForNextTime, nextIsNight);
        weightMultiplier = deprioritizeThoseWithLotsOfShiftsNearby(numScheduledInSurrounding5Hrs, weightMultiplier);

        allRemainingTenterSlots[slotIndex].continuityScore = weightMultiplier;
        slotIndex += 1;
    }
}



/**
 * 
 * @param {number} numScheduledAbove 
 * @param {number} numScheduledBelow 
 * @param {number} numEligibleAdjacent
 * @param {number} weightMultiplier 
 * @param {boolean} availableForPriorTime 
 * @param {boolean} priorIsNight 
 * @param {boolean} availableForNextTime 
 * @param {boolean} nextIsNight 
 * @returns {number}
 */
function prioritizeIdealDayShiftLength(numScheduledAbove, numScheduledBelow, numEligibleAdjacent, weightMultiplier, availableForPriorTime, priorIsNight, availableForNextTime, nextIsNight) {
    var newDayLength = numScheduledAbove + numScheduledBelow + 1;
    const IDEAL_DAY_SHIFT_LENGTH = olsonParams.IDEAL_DAY_SHIFT_LENGTH;
    let newWeightMultiplier = weightMultiplier;
    /*
    if (newDayLength > IDEAL_DAY_SHIFT_LENGTH) {
        for (var m = 0; m < (newDayLength - IDEAL_DAY_SHIFT_LENGTH); m++) {
            newWeightMultiplier /= 8;
        }
    } else {
        //prioritize continuity
        if ((newDayLength > 1) && ((availableForPriorTime && !priorIsNight) || (availableForNextTime && !nextIsNight)))
            newWeightMultiplier = 200;
    }
    */

    if (numEligibleAdjacent < IDEAL_DAY_SHIFT_LENGTH){
        newWeightMultiplier *= Math.pow((1 / PREFERRED_WEIGHT_FACTOR), (IDEAL_DAY_SHIFT_LENGTH - numEligibleAdjacent));
    }
    return newWeightMultiplier;
}

/**
 * 
 * @param {number} numScheduledToday 
 * @param {number} weightMultiplier 
 * @returns {number}
 */
function deprioritizeThoseWithLotsOfShiftsThisDay(numScheduledToday, weightMultiplier) {
    var index = 0;
    let newWeightMultiplier = weightMultiplier;
    while (index < numScheduledToday) {
        newWeightMultiplier *= 0.95;
        index += 1;
    }
    return newWeightMultiplier;
}

/**
 * 
 * @param {number} numShiftsInSurrounding5HrsHrs 
 * @param {number} weightMultiplier 
 * @returns {number} newWeightMultiplier
 */
function deprioritizeThoseWithLotsOfShiftsNearby(numShiftsInSurrounding5HrsHrs, weightMultiplier){
    let newWeightMultiplier = weightMultiplier;
    for (let i = 0; i < numShiftsInSurrounding5HrsHrs; i += 1){
        newWeightMultiplier *= 0.25;
    }
    return newWeightMultiplier;
}

/**
 * 
 * @param {boolean} scheduledForPriorDaytime 
 * @param {boolean} scheduledForNextDaytime 
 * @param {boolean} availableForNextTime 
 * @param {boolean} availableForPriorTime 
 * @returns {number}
 */
function getBasicWeightMultiplier(scheduledForPriorDaytime, scheduledForNextDaytime, availableForNextTime, availableForPriorTime) {
    var multi = 1;
    if (scheduledForPriorDaytime && scheduledForNextDaytime){
        multi = 100;
    } else if (!scheduledForNextDaytime && !availableForNextTime && !scheduledForPriorDaytime && !availableForPriorTime){
        //free for neither above nor below, and not scheduled for either
        multi = 0.01;
    } else if (scheduledForPriorDaytime && !scheduledForNextDaytime && !availableForNextTime){
        //scheduled above but not below, not free for next time
        multi = 0.1;
    } else if (scheduledForNextDaytime && !scheduledForPriorDaytime && !availableForPriorTime){
        //scheduled below but not schedueld or free above
        multi = 0.1;
    } else if (scheduledForPriorDaytime && !scheduledForNextDaytime && availableForNextTime){
        //scheduled above, free below
        multi = 1 / PREFERRED_WEIGHT_FACTOR;
    } else if (scheduledForNextDaytime && !scheduledForPriorDaytime && availableForPriorTime){
        //scheduled below, free above
        multi = 1 / PREFERRED_WEIGHT_FACTOR;
    }else if (availableForNextTime && availableForPriorTime){
        //free above and below
        multi = 1.1;
    } else if (availableForPriorTime && !scheduledForNextDaytime && !availableForNextTime){
        //available above, not below
        multi = 0.9;
    } else if (availableForNextTime && !scheduledForPriorDaytime && !availableForPriorTime){
        //available below, not above
        multi = 0.9;
    }

    return multi;
}

/**
 * 
 * @param {number} currentTimeIndex 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @returns {{numScheduledToday : number, numScheduledInSurrounding5Hrs : number}}
 */
function getNumScheduledInSurrounding24Hrs(currentTimeIndex, allSlotsForThisPeson) {
    var numScheduledToday = 0; //num day slots scheduled in the surrounding 24 hours
    var numScheduledInSurrounding5Hrs = 0;

    var nA = 1;
    while ((currentTimeIndex - nA >= 0) && (nA < 24)) {
        if ((allSlotsForThisPeson[currentTimeIndex - nA].status === TENTER_STATUS_CODES.SCHEDULED) && !(allSlotsForThisPeson[currentTimeIndex - nA].isNight)){
            //Keith: weight these higher if they are closer to the current slot, rather than just numScheduledToday += 1
            numScheduledToday += 12.0 / (6.0 + nA);
            if (nA < 6){
                numScheduledInSurrounding5Hrs += 1;
            }
        }
        nA++;
    }
    var nB = 1;
    while ((currentTimeIndex + nB < allSlotsForThisPeson.length) && (nB < 24)) {
        if ((allSlotsForThisPeson[currentTimeIndex + nB].status === TENTER_STATUS_CODES.SCHEDULED) && !(allSlotsForThisPeson[currentTimeIndex + nB].isNight)){
            numScheduledToday += 12.0 / (6.0 + nB);
            if (nB < 6){
                numScheduledInSurrounding5Hrs += 1;
            }
        }
        nB++;
    }
    return {numScheduledToday, numScheduledInSurrounding5Hrs};
}

/**
 * 
 * @param {number} currentTimeIndex 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @returns {{numScheduledAbove : number, numScheduledBelow : number}}
 */
function getNumberSlotsScheduledAdjacent(currentTimeIndex, allSlotsForThisPeson) {
    var numScheduledAbove = 0; //num contiguous day slots directly above already scheduled
    var numScheduledBelow = 0; //num contiguous day slots directly below already scheduled
    var nA = 1;
    while ((currentTimeIndex - nA >= 0) && (allSlotsForThisPeson[currentTimeIndex - nA].getIsScheduled()) && !(allSlotsForThisPeson[currentTimeIndex - nA].isNight)) {
        numScheduledAbove += 1;
        nA++;
    }
    var nB = 1;
    while ((currentTimeIndex + nB < allSlotsForThisPeson.length) && (allSlotsForThisPeson[currentTimeIndex + nB].getIsScheduled()) && !(allSlotsForThisPeson[currentTimeIndex + nB].isNight)) {
        numScheduledBelow += 1;
        nB++;
    }
    return { numScheduledAbove, numScheduledBelow };
}

/**
 * 
 * @param {number} currentTimeIndex 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @returns {number} number of eligible adjacent slots for this tenter, capped at a certain limit
 */
function getNumberSlotsEligibleAdjacent(currentTimeIndex, allSlotsForThisPeson) {
    var numEligibleAdjacent = 0;
    var nA = 1;
    while ((currentTimeIndex - nA >= 0) && (nA < 10) && (allSlotsForThisPeson[currentTimeIndex - nA].getIsEligibleForAssignment()) && !(allSlotsForThisPeson[currentTimeIndex - nA].isNight)) {
        numEligibleAdjacent += 1;
        nA++;
    }
    var nB = 1;
    while ((currentTimeIndex + nB < allSlotsForThisPeson.length) && (nB < 10) && (allSlotsForThisPeson[currentTimeIndex + nB].getIsEligibleForAssignment()) && !(allSlotsForThisPeson[currentTimeIndex + nB].isNight)) {
        numEligibleAdjacent += 1;
        nB++;
    }
    return numEligibleAdjacent;
}

/**
 * 
 * @param {boolean} skipAboveRow 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} allSlotsForThisPeson 
 * @param {number} priorTimeIndex
 * @param {boolean} skipBelowRow 
 * @param {number} nextTimeIndex 
 * @returns {{scheduledForPriorDaytime : boolean, scheduledForNextDaytime : boolean, availableForNextTime : boolean, availableForPriorTime : boolean}}
 */
function getStatusAtAdjacentTimes(skipAboveRow, allSlotsForThisPeson, priorTimeIndex, skipBelowRow, nextTimeIndex) {
    let priorSlot = allSlotsForThisPeson[Math.max(0, priorTimeIndex)];
    let nextSlot = allSlotsForThisPeson[nextTimeIndex];
    var scheduledForPriorDaytime = !skipAboveRow && !priorSlot.isNight && priorSlot.status === TENTER_STATUS_CODES.SCHEDULED;
    var scheduledForNextDaytime = !skipBelowRow && !priorSlot.isNight && nextSlot.status === TENTER_STATUS_CODES.SCHEDULED;
    var availableForPriorTime = !skipAboveRow && priorSlot.getIsEligibleForAssignment();
    var availableForNextTime = !skipBelowRow && nextSlot.getIsEligibleForAssignment();
    return { scheduledForPriorDaytime, scheduledForNextDaytime, availableForNextTime, availableForPriorTime };
}

/**
 * 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} allRemainingTenterSlots 
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
