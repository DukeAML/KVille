/**
 * Weight Balance - prioritize people with fewer scheduled shifts
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("../slots/tenterSlot").TenterSlot>} slots has 1 entry for each time slot for each person
 */
export function prioritizeFairness(people, slots){
    for (var slotIndex = 0; slotIndex < slots.length; slotIndex++){
        var currentSlot = slots[slotIndex];

        // Establish variables.
        var currentPersonID = currentSlot.col
        var dayScheduled = people[currentPersonID].dayScheduled
        var nightScheduled = people[currentPersonID].nightScheduled
        var night = currentSlot.isNight;

        var nightMulti = 1;
        var dayMulti = 1;

        // Set multipliers.
        if (nightScheduled != 0)
            nightMulti = 1.0 / (nightScheduled + 1);
        

        if (dayScheduled != 0)
            dayMulti = 1.0 / (dayScheduled + 1);
        

        //Adjust weights with multipliers.
        if (night)
            currentSlot.weight = currentSlot.weight * nightMulti;
        else
            currentSlot.weight = currentSlot.weight * dayMulti;

    }
}

