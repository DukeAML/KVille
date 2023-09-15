import { TENTER_STATUS_CODES} from "./slots/tenterSlot";
/**
 * Update people, spreadsheet, and remove slots.
 * @param {Array<import("./person").Person>} people 
 * @param {Array<import("./slots/tenterSlot").TenterSlot>} slots 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @return {Array<import("./slots/tenterSlot").TenterSlot>} remainingSlots 
 * 
 */
export function pickTenterFillSlotAndReturnRemainingSlots(people, slots, tenterSlotsGrid){
    var chosenTenterSlot = slots.shift(); //remove first element and remove it

    updateChosenPerson(chosenTenterSlot, people);

    var chosenTimeIndex = chosenTenterSlot.row;
    var chosenPersonIndex = chosenTenterSlot.col;
    tenterSlotsGrid[chosenPersonIndex][chosenTimeIndex].status = TENTER_STATUS_CODES.SCHEDULED;

    var numberScheduledAtChosenTime = getNumberScheduledAtChosenTime(tenterSlotsGrid, chosenTimeIndex);

    var peopleNeeded = chosenTenterSlot.calculatePeopleNeeded();
    let remainingSlots = slots;
    if (numberScheduledAtChosenTime >= peopleNeeded){
        remainingSlots = slots.filter((s) => (s.row != chosenTimeIndex));
    }
    return remainingSlots;


}


/**
 * 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} chosenTimeIndex 
 * @returns {number}
 */
function getNumberScheduledAtChosenTime(tenterSlotsGrid, chosenTimeIndex) {
    var personIndex = 0;
    var numberScheduledAtChosenTime = 0;
    while (personIndex < tenterSlotsGrid.length) {
        if (tenterSlotsGrid[personIndex][chosenTimeIndex].status == TENTER_STATUS_CODES.SCHEDULED);
        numberScheduledAtChosenTime = numberScheduledAtChosenTime + 1;
        personIndex += 1;
    }
    return numberScheduledAtChosenTime;
}

/**
 * 
 * @param {import("./slots/tenterSlot").TenterSlot} chosenTenterSlot 
 * @param {Array<import("./person").Person>} people 
 */
function updateChosenPerson(chosenTenterSlot, people){
    var chosenPersonIndex = chosenTenterSlot.col;
    var chosenPerson = people[chosenPersonIndex];
    var currentTime = chosenTenterSlot.isNight;

    if (currentTime){
        chosenPerson.nightScheduled += 1;
        chosenPerson.nightFree -= 1;
    }else{
        chosenPerson.dayScheduled += 1;
        chosenPerson.dayFree -= 1;
    }
}