import { olsonParams } from "../../data/olsonParams";
import { TENTER_STATUS_CODES, TenterSlot } from "../slots/tenterSlot";
import { PREFERRED_WEIGHT_FACTOR } from "../slots/tenterSlot";


function gridLimits(row : number, rowLength : number) : boolean[]{
    return [((row - 1) < 0), ((row +1) > (rowLength - 1))];
}


export function prioritizeContinuityForNightSlots(tenterSlotsGrid : TenterSlot[][]){
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
                //timeIndex += 40;

            } else {
                continue;
            }

        }
    }
}


function deprioritizeAllSlotsInNightShiftForTenter(slotsForThisTenter : TenterSlot[], startTimeIndex : number){
    let currentSlot = slotsForThisTenter[startTimeIndex];
    let currentTimeIndex = startTimeIndex;
    while (currentTimeIndex < slotsForThisTenter.length && currentSlot.isNight){
        currentSlot = slotsForThisTenter[currentTimeIndex] 
        currentSlot.continuityScore = 0.0000001;
        currentTimeIndex += 1; 
    }
}


export function prioritizeDaytimeContinuity(allRemainingTenterSlots : TenterSlot[], tenterSlotsGrid : TenterSlot[][]){
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

        var weightMultiplier = getBasicWeightMultiplier(scheduledForPriorDaytime, scheduledForNextDaytime, availableForNextTime, availableForPriorTime);
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
function prioritizeIdealDayShiftLength(numScheduledAbove : number, numScheduledBelow : number, numEligibleAdjacent : number, 
    weightMultiplier : number, availableForPriorTime : boolean, priorIsNight : boolean, availableForNextTime : boolean, nextIsNight : boolean) : number{
    var newDayLength = numScheduledAbove + numScheduledBelow + 1;
    const IDEAL_DAY_SHIFT_LENGTH = olsonParams.IDEAL_DAY_SHIFT_LENGTH;
    let newWeightMultiplier = weightMultiplier;

    if (numEligibleAdjacent < IDEAL_DAY_SHIFT_LENGTH){
        newWeightMultiplier *= Math.pow((1 / PREFERRED_WEIGHT_FACTOR), (IDEAL_DAY_SHIFT_LENGTH - numEligibleAdjacent));
    }
    return newWeightMultiplier;
}


function deprioritizeThoseWithLotsOfShiftsThisDay(numScheduledToday : number, weightMultiplier : number) : number {
    var index = 0;
    let newWeightMultiplier = weightMultiplier;
    while (index < numScheduledToday) {
        newWeightMultiplier *= 0.95;
        index += 1;
    }
    return newWeightMultiplier;
}


function deprioritizeThoseWithLotsOfShiftsNearby(numShiftsInSurrounding5HrsHrs : number, weightMultiplier : number) : number{
    let newWeightMultiplier = weightMultiplier;
    for (let i = 0; i < numShiftsInSurrounding5HrsHrs; i += 1){
        newWeightMultiplier *= 0.25;
    }
    return newWeightMultiplier;
}


function getBasicWeightMultiplier(scheduledForPriorDaytime : boolean, scheduledForNextDaytime : boolean, availableForNextTime : boolean, 
    availableForPriorTime : boolean) : number {
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


interface NumScheduledSurroundingInterface {
    numScheduledToday : number;
    numScheduledInSurrounding5Hrs : number;
}
function getNumScheduledInSurrounding24Hrs(currentTimeIndex : number, allSlotsForThisPeson : TenterSlot[]) : NumScheduledSurroundingInterface {
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


interface NumScheduledAdjacentInterface {
    numScheduledAbove : number;
    numScheduledBelow : number;
}
function getNumberSlotsScheduledAdjacent(currentTimeIndex : number, allSlotsForThisPeson : TenterSlot[]) : NumScheduledAdjacentInterface {
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


function getNumberSlotsEligibleAdjacent(currentTimeIndex : number, allSlotsForThisPeson : TenterSlot[]) : number {
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


interface StatusAtAdjacentTimesInterface{
    scheduledForPriorDaytime : boolean;
    scheduledForNextDaytime : boolean;
    availableForNextTime : boolean;
    availableForPriorTime : boolean;
}
function getStatusAtAdjacentTimes(skipAboveRow : boolean, allSlotsForThisPeson : TenterSlot[], priorTimeIndex : number, 
    skipBelowRow : boolean, nextTimeIndex : number) :  StatusAtAdjacentTimesInterface{
    let priorSlot = allSlotsForThisPeson[Math.max(0, priorTimeIndex)];
    let nextSlot = allSlotsForThisPeson[nextTimeIndex];
    var scheduledForPriorDaytime = !skipAboveRow && !priorSlot.isNight && priorSlot.status === TENTER_STATUS_CODES.SCHEDULED;
    var scheduledForNextDaytime = !skipBelowRow && !priorSlot.isNight && nextSlot.status === TENTER_STATUS_CODES.SCHEDULED;
    var availableForPriorTime = !skipAboveRow && priorSlot.getIsEligibleForAssignment();
    var availableForNextTime = !skipBelowRow && nextSlot.getIsEligibleForAssignment();
    return { scheduledForPriorDaytime, scheduledForNextDaytime, availableForNextTime, availableForPriorTime };
}


interface TimeAndPersonIndicesInterface{
    currentPersonIndex : number;
    currentTimeIndex : number;
    priorTimeIndex : number;
    nextTimeIndex : number;
}
function getRelevantTimeAndPersonIndices(allRemainingTenterSlots : TenterSlot[], slotIndex : number) : TimeAndPersonIndicesInterface {
    var currentTimeIndex = allRemainingTenterSlots[slotIndex].timeIndex;
    var currentPersonIndex = allRemainingTenterSlots[slotIndex].personIndex;

    var priorTimeIndex = currentTimeIndex - 1;
    var nextTimeIndex = currentTimeIndex + 1;
    return { currentPersonIndex, currentTimeIndex, priorTimeIndex, nextTimeIndex };
}
