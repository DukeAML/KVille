import {assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime} from "./pickTenterAndFillSlot";
import { TENTER_STATUS_CODES } from "../slots/tenterSlot";
/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot} chosenTenterSlot 
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @return {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots} chosenTenterSlot 
 */
export function assignTenterToEntireNightShiftAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid){
    let timeIndex = chosenTenterSlot.timeIndex;
    let personIndex = chosenTenterSlot.personIndex;
    while (timeIndex >= 0 && timeIndex < tenterSlotsGrid[personIndex].length && tenterSlotsGrid[personIndex][timeIndex].isNight){
        let slot = tenterSlotsGrid[personIndex][timeIndex]
        let timeIsFilled = getNumberScheduledAtChosenTime(tenterSlotsGrid, timeIndex) >= slot.calculatePeopleNeeded();
        if (!slot.getIsEligibleForAssignment() || timeIsFilled){
            break;
        }
        remainingSlots = assignTenterToOneSlotAndReturnRemainingSlots(tenterSlotsGrid[personIndex][timeIndex], people, remainingSlots, tenterSlotsGrid);
        timeIndex += 1;
    }
    timeIndex = chosenTenterSlot.timeIndex - 1;
    while (timeIndex >= 0 &&timeIndex < tenterSlotsGrid[personIndex].length && tenterSlotsGrid[personIndex][timeIndex].isNight){
        let slot = tenterSlotsGrid[personIndex][timeIndex]
        let timeIsFilled = getNumberScheduledAtChosenTime(tenterSlotsGrid, timeIndex) >= slot.calculatePeopleNeeded();
        if (!slot.getIsEligibleForAssignment() || timeIsFilled){
            break;
        }
        remainingSlots = assignTenterToOneSlotAndReturnRemainingSlots(tenterSlotsGrid[personIndex][timeIndex], people, remainingSlots, tenterSlotsGrid);
        timeIndex -= 1;
    }
    return remainingSlots;

}