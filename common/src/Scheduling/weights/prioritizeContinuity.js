import { olsonParams } from "../../../data/olsonParams";
import { TENTER_STATUS_CODES } from "../slots/tenterSlot";
/**
 * 
 * @param {number} row 
 * @param {number} rowLength 
 * @returns {number[]}
 */
function gridLimits(row, rowLength){
    return [((row - 1) < 0), ((row + 1) > (rowLength - 1))];
}

/**
 * Weight Contiguous - prioritize people to stay in the tent more time at once.
 * @param {Array<import("../slots/tenterSlot").import("../slots/tenterSlot").import("../slots/tenterSlot").TenterSlot>} slots 
 * @param {Array<Array<import("../slots/tenterSlot").import("../slots/tenterSlot").import("../slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @returns [slot, ScheduleGrid]
 */
export function prioritizeContinuity(slots, tenterSlotsGrid){
    //length of ideal day shift is 4 slots (i.e. 2 hours)
    const IDEAL_DAY_SHIFT_LENGTH = olsonParams["IDEAL_DAY_SHIFT_LENGTH"];
    var i = 0
    while (i < slots.length){
        // Establish Variables
        var currentRow = slots[i].row;
        var currentCol = slots[i].col;

        var aboveRow = currentRow-1;
        var belowRow = currentRow+1;

        // grab all slots under the same col as the inspected slot in order
        // to get the slots above and below
        var allSlots = tenterSlotsGrid[currentCol];
        var slotsLength = allSlots.length;

        // find what to skip
        var [skipAboveRow, skipBelowRow] = gridLimits(currentRow, slotsLength);

        var currentIsNight = slots[i].isNight;
        var aboveIsNight = !skipAboveRow && allSlots[aboveRow].isNight;
        var belowIsNight = !skipBelowRow && allSlots[belowRow].isNight;

        var aboveTent = !skipAboveRow && allSlots[aboveRow].status == TENTER_STATUS_CODES.SCHEDULED;
        var belowTent = !skipBelowRow && allSlots[belowRow].status == TENTER_STATUS_CODES.SCHEDULED;
        var aboveSome = !skipAboveRow && allSlots[aboveRow].status == "Somewhat";
        var belowSome = !skipBelowRow && allSlots[belowRow].status == "Somewhat";
        var aboveFree = !skipAboveRow && allSlots[aboveRow].status == TENTER_STATUS_CODES.AVAILABLE;
        var belowFree = !skipBelowRow && allSlots[belowRow].status == TENTER_STATUS_CODES.AVAILABLE;

        var numScheduledAbove = 0; //num contiguous day slots directly above already scheduled
        var numScheduledBelow = 0; //num contiguous day slots directly below already scheduled
        var nA = 1;
        while ((currentRow -nA >= 0) && (allSlots[currentRow - nA].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlots[currentRow-nA].isNight)){
            numScheduledAbove += 1;
            nA ++;
        }
        var nB = 1;
        while ((currentRow + nB < allSlots.length) && (allSlots[currentRow + nB].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlots[currentRow+nB].isNight)){
            numScheduledBelow += 1;
            nB ++;
        }

        var numScheduledToday = 0; //num day slots scheduled in the surrounding 24 hours

        nA = 1;
        while ((currentRow -nA >= 0) && (nA < 24)){
            if ((allSlots[currentRow - nA].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlots[currentRow-nA].isNight))
                //Keith: might wanna weight these higher if they are closer to the current slot
                //something like numScheduledToday += 12.0 / (6.0 + nA)
                numScheduledToday += 12.0 / (6.0 + nA);
            nA ++;
        }
        nB = 1;
        while ((currentRow + nB < allSlots.length) && (nB < 24)){
            if ((allSlots[currentRow + nB].status == TENTER_STATUS_CODES.SCHEDULED) && !(allSlots[currentRow+nB].isNight))
                numScheduledToday += 12.0 / (6.0 + nB);
            nB ++;
        }
        

        var multi = 1;

        // Both are scheduled.
        if (aboveTent && belowTent)
            multi = 100;
        
        // Both are not free
        if (!belowTent && !belowFree && !aboveSome && !belowSome && !aboveTent && !aboveFree)
            multi *= 0.25;
        
        // Above is scheduled, below is free.
        if (aboveTent && !belowTent && belowFree)
            multi = 3.25;

        // Below is scheduled, above is free.
        if (belowTent && !aboveTent && aboveFree )
            multi = 3.25;
    

        // Above is scheduled, below is not free.
        if (aboveTent && !belowTent && !belowFree)
            multi = 3;

        // Below is scheduled, above is not free.
        if (belowTent && !aboveTent && !aboveFree)
            multi = 3;

        // Both are free
        if (belowFree && aboveFree)
            multi = 2.75;

        // Above is free, below is not free
        if (aboveFree && !belowTent && !belowFree)
            multi = 1;

        // Below is free, above is not free
        if(belowFree && !aboveTent && !aboveFree)
            multi = 1;

        //deprioritize if they already have a bunch of slots scheduled today, but not necessarily directly above/below this slot
        var index = 0;
        while (index < numScheduledToday){
            multi *= 0.95;
            index += 1;
        }
        
        //Keith: prioritize ideal shift continuity length
        var newDayLength = numScheduledAbove + numScheduledBelow + 1;
        if (newDayLength > IDEAL_DAY_SHIFT_LENGTH){ 
            for (var m = 0; m < (newDayLength - IDEAL_DAY_SHIFT_LENGTH); m++){
                multi /= 8;
            }
        } else {
            //prioritize continuity
            if ((newDayLength > 1) && ((aboveFree && !aboveIsNight) || (belowFree && !belowIsNight)))
                multi = 200;
        }



        //Keith: prioritize continuity at night
        if ((aboveTent && aboveIsNight ) || (belowTent && belowIsNight && currentIsNight))
            multi = 1000;
        
    
        

        slots[i].weight = slots[i].weight*multi;
        i += 1;

    }

    return [slots, tenterSlotsGrid];
}


