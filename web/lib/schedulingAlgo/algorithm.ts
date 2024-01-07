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
import { Person } from "./person";
import { TenterSlot } from "@/lib/schedulingAlgo/slots/tenterSlot";



export function scheduleAlgorithm(people : Person[], tenterSlotsGrid : TenterSlot[][]) : ScheduledSlot[]{
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


function assignNightShifts(people : Person[], tenterSlotsGrid : TenterSlot[][]) {
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


function assignDayShifts(people : Person[], tenterSlotsGrid : TenterSlot[][]){
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



function getEligibleTenterSlots(tenterSlotsGrid : TenterSlot[][], extraSlotCondition: ((slot : TenterSlot) => boolean)) : TenterSlot[]{
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


function formatTo1DSchedule(people : Person[], tenterSlotsGrid : TenterSlot[][]) : ScheduledSlot[]{
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



