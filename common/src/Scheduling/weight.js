

import { Helpers } from "./helpers.js";
import {olsonParams} from "../../data/olsonParams.js"; 
import { TenterSlot, TENTER_STATUS_CODES } from "./tenterSlot.js";


export class Weight{

    /**
     * 
     * @param {Array<TenterSlot>} slots 
     * @returns {Array<TenterSlot>} same as the input, but with all weights set to 1
     */
    static weightReset(slots){
        for (var i = 0; i < slots.length; i++){
            var currentSlot = slots[i];
            currentSlot.weight = 1;
        }
        return slots;
    }


    /**
     * Weight Balance - prioritize people with fewer scheduled shifts
     * @param {Array<People>} people 
     * @param {Array<TenterSlot>} slots has 1 entry for each time slot for each person
     * @returns [people, slots]
     */
    static weightBalance(people, slots){
        for (var i = 0; i < slots.length; i++){
            var currentSlot = slots[i];

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
        return [people, slots];
    }

    static gridLimits(row, rowLength){
        return [((row - 1) < 0), ((row + 1) > (rowLength - 1))];
    }

    
    /**
     * Weight Contiguous - prioritize people to stay in the tent more time at once.
     * @param {Array<TenterSlot>} slots 
     * @param {Array<Array<TenterSlot>>} scheduleGrid 
     * @returns [slot, ScheduleGrid]
     */
    static weightContiguous(slots, scheduleGrid){
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
            var allSlots = scheduleGrid[currentCol];
            var slotsLength = allSlots.length;

            // find what to skip
            var [skipAboveRow, skipBelowRow] = Weight.gridLimits(currentRow, slotsLength);

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
            
            

            // Occurance of Somewhat Available
            if (slots[i].status == "Somewhat")
                multi *= 0.5;
            

            slots[i].weight = slots[i].weight*multi;
            i += 1;
    
        }

        return [slots, scheduleGrid];
    }

    
    /**
     *  Weight Tough Time - prioritize time slots with few people available. 
     * @param {Array<TenterSlot>} slots 
     * @param {int} scheduleLength 
     * @returns {Array<TenterSlot>}
     */
    static weightToughTime(slots, scheduleLength){

        // Set up counterArray (Rows that are filled).
        var counterArray = new Array(scheduleLength + 1).fill(0);

        // Fill counterArray.
        for(var i = 0; i < slots.length; i++){
            var currentSlot = slots[i];
            var currentRow = currentSlot.row;
            counterArray[currentRow] = counterArray[currentRow] + 1;
        }
        

        // Update Weights.
        for (var i = 0; i < slots.length; i++){
            var currentSlot = slots[i];
            var currentRow = currentSlot.row;
            var currentPhase = currentSlot.phase;
            var nightBoolean = currentSlot.isNight;
        
            var peopleNeeded = currentSlot.calculatePeopleNeeded();
            
            var numFreePeople = counterArray[currentRow];
            var newWeight = currentSlot.weight*(12/(numFreePeople + 0.01))*peopleNeeded;
            
            currentSlot.weight = newWeight;
        }

        return slots;
    }

   
    /**
     * Update people, spreadsheet, and remove slots.
     * @param {Array<Person>} people 
     * @param {Array<TenterSlot>} slots 
     * @param {Array<int>} graveyard 
     * @param {Array<Array<TenterSlot>>} scheduleGrid 
     * @returns 4 things
     */
    static weightPick(people, slots, graveyard, scheduleGrid){
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
        scheduleGrid[currentCol][currentRow].status = TENTER_STATUS_CODES.SCHEDULED;

        // Count number of scheduled tenters during winner slot.
        var i = 0;
        while (i < scheduleGrid.length){
            if (scheduleGrid[i][currentRow].status == TENTER_STATUS_CODES.SCHEDULED);
                tentCounter = tentCounter + 1;
            i += 1;
        }

        // Determine how many people are needed.
        var peopleNeeded = winner.calculatePeopleNeeded();

        // Update Slots and Graveyard
        if (tentCounter >= peopleNeeded){
            graveyard[currentRow] = 1;
            var j = 0;
            var tempSlots = [];
            while (j < slots.length){
                var tempRow = slots[j].row;
                if (tempRow != currentRow)
                    tempSlots.push(slots[j]);
                j += 1;
            }
            slots = tempSlots;
        }

        return [people, slots, graveyard, scheduleGrid];
    
    }
}
