import {assignTenterToOneSlotAndReturnRemainingSlots, getNumberScheduledAtChosenTime} from "./pickTenterAndFillSlot";
import { TENTER_STATUS_CODES, TenterSlot } from "../slots/tenterSlot";
import { Person } from "../person";

export function assignTenterToEntireNightShiftAndReturnRemainingSlots(chosenTenterSlot : TenterSlot, people : Person[], remainingSlots : TenterSlot[], tenterSlotsGrid : TenterSlot[][]) : TenterSlot[] {
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