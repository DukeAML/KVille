const Helpers = require( "./helpers");
const Weight = require("./weight");
const FinalTouches = require("./finalTouches");
const Fairness = require("./fairness");
class Algorithm{

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
     * @param {*} people is an array of Person objects, as defined in Olson_Scheduling/person
     * @param {*} scheduleGrid is an array of arrays of slots (Slot objects in the Olson_Scheduling/slot folder). 
     *    For instance, scheduleGrid[0] corresponds to slots for the person identified by people[0]. 
     *    There is a slot for EVERY TIME. The slot object says whether or not the person is available.
     * @param {*} weekNum (int) is the week number (e.g. 1, 2, 3, or 4)
     * @returns a 1d array of objects that each have a "startDate" (int), "endDate"(int), "phase"(String), 
     *    "isNight" (boolean), and "ids"(1d array of integer ids)
     */
    static schedule(people, scheduleGrid, weekNum = 1){
        Helpers.weekNum = weekNum;
        var scheduleLength = scheduleGrid[0].length;

        // Remove all availability slots that are already filled in the schedule.
        var [slots, graveyard, people] = Algorithm.removeFilledSlots(people, scheduleGrid);


        // Remove all availability slots that are already filled in the schedule.
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
            // pp slots

            // Update people, spreadsheet, and remove slots.

            [people, slots, graveyard, scheduleGrid] = Weight.weightPick(people, slots, graveyard, scheduleGrid);

        }

        var combinedGrid = Algorithm.processData(people, scheduleGrid);
        Fairness.ensureFairness(combinedGrid, people, scheduleGrid);
        FinalTouches.fillGrace(combinedGrid);
        FinalTouches.fillEmptySpots(combinedGrid);
        for (var c = 0; c < 2; c++)
          combinedGrid = FinalTouches.cleanStraySlots(combinedGrid, people, scheduleGrid);
          
        FinalTouches.reorganizeGrid(combinedGrid);
        return combinedGrid;
    }
    



  // Remove all availability slots that are already filled in the schedule.
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
                if (currentPerson[counter].status == "Scheduled")
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
                var peopleNeeded = Helpers.calculatePeopleNeeded(isNight, phase, counter);
                var numPeople = counterArray[counter];

                var addToSlot =  (currentPerson[counter].status == "Available") || (currentPerson[counter].status == "Somewhat");
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
   * @param {*} people 1d array of Person objects
   * @param {*} scheduleGrid 2d array of shape (number of people, number of slots), with each entry being 
   *    something similar to a slot object, but not quite the same thing. 
   * @returns combinedGrid, a 1d array of slot objects where each one has ids of the tenters involved,
   */
  static processData(people, scheduleGrid){
    // compress data from 2d grid with a single-deminsion of
    // all of the scheduled slots
    var combinedGrid = [];

    // iterating through every unique slot, and
    // checking for any people that are scheduled on that slot as well
    //should be <= in the for ??
    for (var slotIndex = 0; slotIndex < scheduleGrid[0].length; slotIndex++){
      var slotData = scheduleGrid[0][slotIndex].to_hash();
      var slot = {
        "startDate": slotData["startDate"],
        "endDate": slotData["endDate"],
        "isNight": slotData["isNight"],
        "phase": slotData["phase"],
        "ids": []
      };


      // checking every person at that slot for status
      // should be <= in the for ??
      for (var personIndex = 0; personIndex < people.length; personIndex++){
        var person = people[personIndex];
        if (scheduleGrid[personIndex][slotIndex].status == "Scheduled"){
          slot["ids"].push(person.id);
        }
      }
      combinedGrid.push(slot);
    }
    

    // prints amount of people needed in a slot based on time and phase
    for (var i = 0; i < combinedGrid.length; i++){
      slot = combinedGrid[i]
      var peopleNeeded = Helpers.calculatePeopleNeeded(slot["isNight"], slot["phase"], i);
      var peopleLeft = peopleNeeded - slot["ids"].length;
      slot["peopleLeft"] = peopleLeft;
    }

    //return [combinedGrid, Algorithm.simplifyGrid(combinedGrid)];
    return combinedGrid;
  }


  /**
   * return a copy of the slot object
   * @param {*} slot is NOT an object as defined in slot.js. It has the following format: 
   *      {"startDate": int
   *       "endDate": int
   *       "isNight": boolean
   *       "phase": string
   *       "ids": array
   *      }
   */
  static copySlot(slot){
    var newSlot = {"startDate": slot["startDate"],
              "endDate": slot["endDate"],
              "isNight": slot["isNight"],
              "phase": slot["phase"],
              "ids": slot["ids"]};
    return newSlot;

  }

  
  static isConnectedSlot(slot1, slot2){
    return (Algorithm.slots_have_same_ids(slot1, slot2) && (slot1["phase"] == slot2["phase"]));
  }

  //helper method added by Keith to compare arrays of ints in js
  static slots_have_same_ids(slot1, slot2){
    for (var i = 0; i< slot1["ids"].length; i++){
        var id = slot1["ids"][i];
        if (!(id in slot2["ids"]))
            return false;
    }
    return true;
  }

}

module.exports = Algorithm;