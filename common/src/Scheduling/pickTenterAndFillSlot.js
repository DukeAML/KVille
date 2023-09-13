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
    // Remove winner from list.
    var winner = slots.shift(); //remove first element and remove it
    // Update person information.
    var currentPersonID = winner.col;
    var currentTime = winner.isNight;

    if (currentTime){
        people[currentPersonID].nightScheduled += 1;
        people[currentPersonID].nightFree -= 1;
    }else{
        people[currentPersonID].dayScheduled += 1;
        people[currentPersonID].dayFree -= 1;
    }


    // Establish Variables
    var currentRow = winner.row;
    var currentCol = winner.col;
    var tentCounter = 0;

    // Update Data
    tenterSlotsGrid[currentCol][currentRow].status = TENTER_STATUS_CODES.SCHEDULED;

    // Count number of scheduled tenters during winner slot.
    var i = 0;
    while (i < tenterSlotsGrid.length){
        if (tenterSlotsGrid[i][currentRow].status == TENTER_STATUS_CODES.SCHEDULED);
            tentCounter = tentCounter + 1;
        i += 1;
    }

    // Determine how many people are needed.
    var peopleNeeded = winner.calculatePeopleNeeded();
    let remainingSlots = slots;
    if (tentCounter >= peopleNeeded){
        remainingSlots = slots.filter((s) => (s.row != currentRow));
    }
    return remainingSlots;

    

}