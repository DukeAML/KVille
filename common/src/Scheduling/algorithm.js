import { ensureFairness } from "./finalTouches/fairness.js";
import {TENTER_STATUS_CODES} from "./slots/tenterSlot.js";
import {ScheduledSlot} from "./slots/scheduledSlot.js";
import {cleanStraySlots} from "./finalTouches/cleanStraySlots.js";
import {fillEmptySpots} from "./finalTouches/fillEmptySpots.js";
import {fillGrace} from "./finalTouches/fillGrace.js";
import {reorganizeGrid} from "./finalTouches/reorganizeGrid.js";
import { resetWeights } from "./weights/resetWeights.js";
import { prioritizeFairness } from "./weights/prioritizeFairness.js";
import { prioritizeContinuity } from "./weights/prioritizeContinuity.js";
import { prioritizeToughTimes } from "./weights/prioritizeToughTimes.js";
import { pickTenterFillSlotAndReturnRemainingSlots } from "./pickTenterAndFillSlot.js";



/**
 * Scheduling Algo
 * @param {Array<Person>} people 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid is an array of arrays of Tenter slots
 *    For instance, tenterSlotsGrid[0] corresponds to slots for the person identified by people[0]. 
 *    There is a slot for EVERY TIME. The slot object says whether or not the person is available.
 * @returns {Array<ScheduledSlot>} 
 */
export function scheduleAlgorithm(people, tenterSlotsGrid){
    var scheduleLength = tenterSlotsGrid[0].length;
    var slots = getAllTenterSlots(tenterSlotsGrid);
    
    while (slots.length > 0){

        resetWeights(slots);
        prioritizeFairness(people, slots);
        prioritizeContinuity(slots, tenterSlotsGrid);
        prioritizeToughTimes(slots, scheduleLength);
        slots.sort( (a, b) => (b.weight - a.weight));
        slots = pickTenterFillSlotAndReturnRemainingSlots(people, slots, tenterSlotsGrid);
    }


    var scheduleArr = formatTo1DSchedule(people, tenterSlotsGrid);
    ensureFairness(scheduleArr, people, tenterSlotsGrid);
    fillGrace(scheduleArr);
    fillEmptySpots(scheduleArr);
    for (var c = 0; c < 2; c++){
        scheduleArr = cleanStraySlots(scheduleArr, people, tenterSlotsGrid);
    }
    
    reorganizeGrid(scheduleArr);
    return scheduleArr;
}

/**
 * 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @returns {Array<import("./slots/tenterSlot").TenterSlot>}
 */
function getAllTenterSlots(tenterSlotsGrid){
    let allSlots = [];
    for (let personIndex =0; personIndex < tenterSlotsGrid.length; personIndex += 1){
        for (let timeIndex = 0; timeIndex < tenterSlotsGrid[0].length; timeIndex += 1){
            let slot = tenterSlotsGrid[personIndex][timeIndex];
            if (slot.status === TENTER_STATUS_CODES.AVAILABLE){
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



