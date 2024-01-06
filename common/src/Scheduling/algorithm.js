import { ensureFairness } from "./finalTouches/fairness.js";
import {TENTER_STATUS_CODES} from "./slots/tenterSlot.js";
import {ScheduledSlot} from "./slots/scheduledSlot.js";
import {cleanStraySlots} from "./finalTouches/cleanStraySlots.js";
import {fillEmptySpots} from "./finalTouches/fillEmptySpots.js";
import {fillGrace} from "./finalTouches/fillGrace.js";
import {reorganizeGrid} from "./finalTouches/reorganizeGrid.js";
import { prioritizeFairness } from "./weights/prioritizeFairness.js";
import { prioritizeDaytimeContinuity, prioritizeContinuityForNightSlots} from "./weights/prioritizeContinuity.js";
import { prioritizeToughTimes } from "./weights/prioritizeToughTimes.js";
import { prioritizePickiness } from "./weights/prioritizePickiness.js";
import { pickTenterFillSlotAndReturnRemainingSlots } from "./pickTenterAndFillSlots/pickTenterAndFillSlot.js";
import {tryToEliminateStraySlotAtEdgesOfShift} from "./pickTenterAndFillSlots/tryToeliminateStraySlotAtEdgesOfShift.js";



/**
 * Scheduling Algo
 * @param {Array<Person>} people 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid is an array of arrays of Tenter slots
 *    For instance, tenterSlotsGrid[0] corresponds to slots for the person identified by people[0]. 
 *    There is a slot for EVERY TIME. The slot object says whether or not the person is available.
 * @returns {Array<ScheduledSlot>} 
 */
export function scheduleAlgorithm(people, tenterSlotsGrid){
    prioritizePickiness(tenterSlotsGrid);
    assignNightShifts(people, tenterSlotsGrid);
    assignDayShifts(people, tenterSlotsGrid);

    var scheduleArr = formatTo1DSchedule(people, tenterSlotsGrid);
    //ensureFairness(scheduleArr, people, tenterSlotsGrid);
    fillGrace(scheduleArr);
    fillEmptySpots(scheduleArr);
    scheduleArr = cleanStraySlots(scheduleArr, people, tenterSlotsGrid);
    
    
    reorganizeGrid(scheduleArr);
    return scheduleArr;
}

/**
 * Scheduling Algo
 * @param {Array<Person>} people 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 */
function assignNightShifts(people, tenterSlotsGrid) {
    let eligibleNightSlots = getEligibleTenterSlots(tenterSlotsGrid, ((s) => s.isNight));
    let scheduleLength = tenterSlotsGrid[0].length;
    prioritizeContinuityForNightSlots(tenterSlotsGrid);
    while (eligibleNightSlots.length > 0){
        prioritizeFairness(people, eligibleNightSlots);
        prioritizeToughTimes(eligibleNightSlots, scheduleLength); //only need to update the time slots that were part of the last person chosen
        eligibleNightSlots.sort((a, b) => (b.getWeight() - a.getWeight()));
        let choosingResult = pickTenterFillSlotAndReturnRemainingSlots(people, eligibleNightSlots, tenterSlotsGrid);
        eligibleNightSlots = choosingResult.remainingSlots;
    }
}

/**
 * 
 * @param {Array<Person>} people 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 */
function assignDayShifts(people, tenterSlotsGrid){
    let slots = getEligibleTenterSlots(tenterSlotsGrid, ((slot) => !slot.isNight));
    let scheduleLength = tenterSlotsGrid[0].length;
    while (slots.length > 0){
        prioritizeFairness(people, slots);
        prioritizeDaytimeContinuity(slots, tenterSlotsGrid); //only need to do this for person who was last chosen. nothing will change for the others
        prioritizeToughTimes(slots, scheduleLength); //only need to update the time slots that were part of the last person chosen
        slots.sort( (a, b) => (b.getWeight() - a.getWeight()));
        let {remainingSlots, chosenPersonIndex, chosenTimeIndex} = pickTenterFillSlotAndReturnRemainingSlots(people, slots, tenterSlotsGrid);
        remainingSlots = tryToEliminateStraySlotAtEdgesOfShift(tenterSlotsGrid, people, remainingSlots, chosenPersonIndex, chosenTimeIndex);
        slots = remainingSlots;
    }

}


/**
 * 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {(slot : import("./slots/tenterSlot").TenterSlot) => boolean} extraSlotCondition
 * @returns {Array<import("./slots/tenterSlot").TenterSlot>}
 */
function getEligibleTenterSlots(tenterSlotsGrid, extraSlotCondition=((slot) => true)){
    let allSlots = [];
    for (let personIndex =0; personIndex < tenterSlotsGrid.length; personIndex += 1){
        for (let timeIndex = 0; timeIndex < tenterSlotsGrid[0].length; timeIndex += 1){
            let slot = tenterSlotsGrid[personIndex][timeIndex];
            if (slot.getIsEligibleForAssignment() && extraSlotCondition(slot)){
                allSlots.push(slot);
            }
        }
    }
    return allSlots;
}







/**
 * 
 * @param {Array<Person>} people 1d array of Person objects
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 2d array of shape (number of people, number of time slots)
 * @returns {Array<ScheduledSlot>} scheduleArr, a 1d array of import("./slots/tenterSlot").TenterSlot objects
 */
function formatTo1DSchedule(people, tenterSlotsGrid){
    var scheduleArr = [];

    // iterating through every timeslot, and adding up all the people scheduled for that time slot
    for (var slotIndex = 0; slotIndex < tenterSlotsGrid[0].length; slotIndex++){
        var slot = new ScheduledSlot(tenterSlotsGrid[0][slotIndex].startDate, tenterSlotsGrid[0][slotIndex].phase);

        // checking every person at that slot for status
        for (var personIndex = 0; personIndex < people.length; personIndex++){
            var person = people[personIndex];
            if (tenterSlotsGrid[personIndex][slotIndex].status == TENTER_STATUS_CODES.SCHEDULED){
                slot.ids.push(person.id);
            }
        }
        scheduleArr.push(slot);
    }
    
    return scheduleArr;
}



