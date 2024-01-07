import { ensureFairness } from "./finalTouches/fairness";
import {TENTER_STATUS_CODES} from "@/lib/schedulingAlgo/slots/tenterSlot";
import {ScheduledSlot} from "@/lib/schedulingAlgo/slots/scheduledSlot";
import {cleanStraySlots} from "./finalTouches/cleanStraySlots";
import {fillEmptySpots} from "./finalTouches/fillEmptySpots";
import {fillGrace} from "./finalTouches/fillGrace";
import {reorganizeGrid} from "./finalTouches/reorganizeGrid";
import {prioritizeFairness } from "./weights/prioritizeFairness";
import { prioritizeDaytimeContinuity, prioritizeContinuityForNightSlots} from "./weights/prioritizeContinuity";
import {prioritizeToughTimes} from "./weights/prioritizeToughTimes";
import {prioritizePickiness} from "./weights/prioritizePickiness";
import { pickTenterFillSlotAndReturnRemainingSlots } from "./pickTenterAndFillSlots/pickTenterAndFillSlot";
import {tryToEliminateStraySlotAtEdgesOfShift} from "./pickTenterAndFillSlots/tryToeliminateStraySlotAtEdgesOfShift";



/**
 * Scheduling Algo
 * @param {Array<Person>} peopl@/lib/schedulingAlgo/slots/tenterSlot.js
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
        prioritizeToughTimes(eligibleNightSlots, scheduleLength); //could be optimized by only updating the time slots that were part of the last shift created
        eligibleNightSlots.sort((a, b) => b.getWeight() - a.getWeight());
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
        prioritizeDaytimeContinuity(slots, tenterSlotsGrid); //this takes up half the time of the algo and could definitely be optimized. 
        prioritizeToughTimes(slots, scheduleLength); //could also be optimized for speed
        slots.sort( (a, b) => (b.getWeight() - a.getWeight()));
        let {remainingSlots, chosenPersonIndex, chosenTimeIndex} = pickTenterFillSlotAndReturnRemainingSlots(people, slots, tenterSlotsGrid);
        remainingSlots = tryToEliminateStraySlotAtEdgesOfShift(tenterSlotsGrid, people, remainingSlots, chosenPersonIndex, chosenTimeIndex);
        slots = remainingSlots
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



