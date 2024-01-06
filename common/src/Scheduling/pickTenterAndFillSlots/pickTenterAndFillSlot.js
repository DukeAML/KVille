import { TENTER_STATUS_CODES} from "../slots/tenterSlot";
import { assignTenterToEntireNightShiftAndReturnRemainingSlots } from "./fillNightShift";
import { assignTenterToDaytimeShiftAndReturnRemainingSlots } from "./fillDaytimeShift";
/**
 * Update people, spreadsheet, and remove slots.
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @return {{remainingSlots : Array<import("../slots/tenterSlot").TenterSlot>, chosenPersonIndex : number, chosenTimeIndex : number}} remainingSlots 
 * 
 */
export function pickTenterFillSlotAndReturnRemainingSlots(people, slots, tenterSlotsGrid){
    var chosenTenterSlot = slots[0];
    let remainingSlots = slots;
    if (chosenTenterSlot.isNight){
        return {
            remainingSlots : assignTenterToEntireNightShiftAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid),
            chosenPersonIndex : chosenTenterSlot.personIndex,
            chosenTimeIndex : chosenTenterSlot.timeIndex
        };
    } else {
        return {
            remainingSlots : assignTenterToDaytimeShiftAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid),
            chosenPersonIndex : chosenTenterSlot.personIndex,
            chosenTimeIndex : chosenTenterSlot.timeIndex
        };
    }
}




/**
 * 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} chosenTimeIndex 
 * @returns {number}
 */
export function getNumberScheduledAtChosenTime(tenterSlotsGrid, chosenTimeIndex) {
    var personIndex = 0;
    var numberScheduledAtChosenTime = 0;
    while (personIndex < tenterSlotsGrid.length) {
        if (tenterSlotsGrid[personIndex][chosenTimeIndex].getIsScheduled()){
            numberScheduledAtChosenTime = numberScheduledAtChosenTime + 1;
        }
        personIndex += 1;
    }
    return numberScheduledAtChosenTime;
}



/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot} chosenTenterSlot 
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots 
 * @param {Array<Array<import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @return {Array<import("../slots/tenterSlot").TenterSlot>} remainingSlots
 */
export function assignTenterToOneSlotAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid){
    chosenTenterSlot.status = TENTER_STATUS_CODES.SCHEDULED;
    updateChosenPersonHourNumbers(chosenTenterSlot, people);
    for(let j=0;j<remainingSlots.length;j++){
        if(remainingSlots[j].timeIndex == chosenTenterSlot.timeIndex && remainingSlots[j].personIndex == chosenTenterSlot.personIndex){
            remainingSlots.splice(j,1);
            break;
        }
    }

    var chosenTimeIndex = chosenTenterSlot.timeIndex;
    var numberScheduledAtChosenTime = getNumberScheduledAtChosenTime(tenterSlotsGrid, chosenTimeIndex);
    var peopleNeeded = chosenTenterSlot.calculatePeopleNeeded();
    if (numberScheduledAtChosenTime >= peopleNeeded){
        remainingSlots = remainingSlots.filter((s) => (s.timeIndex != chosenTimeIndex));
        for (let personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex += 1) {
            tenterSlotsGrid[personIndex][chosenTimeIndex].setTimeslotIsFull();
        }
    }
    
    return remainingSlots;
}

/**
 * 
 * @param {import("../slots/tenterSlot").TenterSlot} chosenTenterSlot 
 * @param {Array<import("../person").Person>} people 
 */
function updateChosenPersonHourNumbers(chosenTenterSlot, people){
    var chosenPersonIndex = chosenTenterSlot.personIndex;
    var chosenPerson = people[chosenPersonIndex];

    if (chosenTenterSlot.isNight){
        chosenPerson.nightScheduled += 1;
        chosenPerson.nightFree -= 1;
    }else{
        chosenPerson.dayScheduled += 1;
        chosenPerson.dayFree -= 1;
    }
}