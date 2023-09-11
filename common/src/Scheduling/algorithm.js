
import {Helpers} from "./helpers.js";

import {Weight} from "./weight.js";
import {FinalTouches} from "./finalTouches.js";
import {Fairness} from "./fairness.js";
import {TenterSlot, TENTER_STATUS_CODES} from "./tenterSlot.js";
import {ScheduledSlot} from "./scheduledSlot.js";
import {Person} from "./person.js";

export class Algorithm{

    //helper method
    static sign (num){
        if (num > 0)
            return 1;
        else if (num == 0)
            return 0;
        else 
            return -1;
    }


    /**
     * Olson Scheduling Algo
     * @param {Array<Person>} people is an array of Person objects, as defined in person.js
     * @param {Array<Array<TenterSlot>>} scheduleGrid is an array of arrays of Tenter slots (TenterSlot objects in ./tenterSlot). 
     *    For instance, scheduleGrid[0] corresponds to slots for the person identified by people[0]. 
     *    There is a slot for EVERY TIME. The slot object says whether or not the person is available.
     * @returns {Array<ScheduledSlot>} a 1d array of ScheduledSlot objects, defined in ./scheduledSlot
     */
    static schedule(people, scheduleGrid){
        var scheduleLength = scheduleGrid[0].length;

        // Remove all availability slots that are already filled in the schedule.
        var [slots, graveyard, people] = Algorithm.removeFilledSlots(people, scheduleGrid);
        
        console.log("entered the schedule algo at " + new Date(Date.now()));
        //TODO: make this loop faster by only modifying the slots that should be modified
        while (slots.length > 0){
            // Weight Reset - set all weights to 1.
            slots = Weight.weightReset(slots);
            
            // Weight Balance - prioritize people with fewer scheduled shifts.
            [people, slots] = Weight.weightBalance(people, slots);

            // Weight Contiguous - prioritize people to stay in the tent more time at once.
            [slots, scheduleGrid] = Weight.weightContiguous(slots, scheduleGrid);
            
            // Weight Tough Time - prioritize time slots with few people available.
            slots = Weight.weightToughTime(slots, scheduleLength);

            // Sort by Weights
            slots.sort( (a, b) => Algorithm.sign(b.weight - a.weight));

            // Update people, spreadsheet, and remove slots.
            [people, slots, graveyard, scheduleGrid] = Weight.weightPick(people, slots, graveyard, scheduleGrid);
        }
        console.log("finished the loop at " + new Date(Date.now()));

        var combinedGrid = Algorithm.processData(people, scheduleGrid);
        Fairness.ensureFairness(combinedGrid, people, scheduleGrid);
        FinalTouches.fillGrace(combinedGrid);
        FinalTouches.fillEmptySpots(combinedGrid);
        for (var c = 0; c < 2; c++)
          combinedGrid = FinalTouches.cleanStraySlots(combinedGrid, people, scheduleGrid);
        console.log("cleaned stray slots at " + new Date(Date.now()));
        FinalTouches.reorganizeGrid(combinedGrid);
        return combinedGrid;
    }
    


  /**
   * Remove all availability slots that are already filled in the schedule.
   * @param {Array<Person>} people 
   * @param {Array<Array<TenterSlot>>} scheduleGrid 
   * @returns 3 things

   */
    static removeFilledSlots(people, scheduleGrid){

        // Reset Slots Array.
        var slots = [];
        // Set up graveyard (Rows that are compvarely scheduled will go here).
        var graveyard = new Array(scheduleGrid[0].length).fill(null);
        // Set up counterArray (Going to count how scheduled a row is).
        var counterArray = new Array(scheduleGrid[0].length).fill(0);

        // Count number of scheduled tenters during a specific time.
        for (var i = 0; i < scheduleGrid.length; i++){  
            currentPerson = scheduleGrid[i];
            var counter = 0;
            while (counter < currentPerson.length){
                if (currentPerson[counter].status == TENTER_STATUS_CODES.SCHEDULED)
                    counterArray[counter] = counterArray[counter] + 1;
                counter = counter + 1;
            }
        }
        // Iterate through every slot.
        var i = 0;
        while (i < scheduleGrid.length){

            var currentPerson = scheduleGrid[i];
            var counter = 0;

            while (counter < scheduleGrid[i].length){

                // Determine how many people are needed.
                var isNight = currentPerson[counter].isNight;
                var phase = currentPerson[counter].phase;
                var peopleNeeded = currentPerson[counter].calculatePeopleNeeded();
                var numPeople = counterArray[counter];

                var addToSlot =  (currentPerson[counter].status == TENTER_STATUS_CODES.AVAILABLE) || (currentPerson[counter].status == "Somewhat");
                // Only add in slot if necessary.
                if ((numPeople < peopleNeeded) && addToSlot)
                    slots.push(currentPerson[counter]);
                
              
                // Update graveyard
                if (numPeople >= peopleNeeded)
                    graveyard[counter] = 1;
              
                counter = counter + 1
            }
            i = i + 1;
        }
        return [slots, graveyard, people]
    }
  
  /**
   * 
   * @param {Array<Person>} people 1d array of Person objects
   * @param {Array<Array<TenterSlot>>} scheduleGrid 2d array of shape (number of people, number of time slots)
   * @returns {Array<TenterSlot>} combinedGrid, a 1d array of TenterSlot objects
   */
  static processData(people, scheduleGrid){
    // compress data from 2d grid with a single-deminsion of
    // all of the scheduled slots
    var combinedGrid = [];

    // iterating through every unique slot, and
    // checking for any people that are scheduled on that slot as well
    //should be <= in the for ??
    for (var slotIndex = 0; slotIndex < scheduleGrid[0].length; slotIndex++){

     var slot = new ScheduledSlot(scheduleGrid[0][slotIndex].startDate, scheduleGrid[0][slotIndex].phase);


      // checking every person at that slot for status
      for (var personIndex = 0; personIndex < people.length; personIndex++){
        var person = people[personIndex];
        if (scheduleGrid[personIndex][slotIndex].status == TENTER_STATUS_CODES.SCHEDULED){
          slot.ids.push(person.id);
        }
      }
      combinedGrid.push(slot);
    }
    
    return combinedGrid;
  }


}

