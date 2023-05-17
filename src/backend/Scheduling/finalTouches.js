const Helpers = require( "./helpers");
const Weight = require("./weight");

class FinalTouches{
    
/**
 * Adds in 'Grace' to combinedGrid where appropriate
 * @param {*} combinedGrid 
 * returns nothing, modifies the grid in place
 */
  static fillGrace(combinedGrid){
    for (var i = 0; i < combinedGrid.length; i++){
      var peopleNeeded = Helpers.calculatePeopleNeeded(Helpers.isSlotNight(i), combinedGrid[i].phase, i);
      if (peopleNeeded == 0){
        combinedGrid[i].ids.push('Grace');
      }

    }   
  }

 
  /**
   * add 'empty to id arrays to ensure the array length equals the number of people needed
   * @param {*} combinedGrid 
   * returns nothing, modifies the grid in place
   */
  static fillEmptySpots(combinedGrid){
    for (var i = 0; i < combinedGrid.length; i++){
      var peopleNeeded = Helpers.calculatePeopleNeeded(Helpers.isSlotNight(i), combinedGrid[i].phase, i);
      while (combinedGrid[i].ids.length < peopleNeeded){
        combinedGrid[i].ids.push('empty');
      }

    }
  }

/**
 * There will be some poorly scheduled shifts where a tenter is there for just 30 minutes. 
 * This method tries to remove those by extending the next tenter or prior tenter's shift
 * @param {*} combinedGrid is a 1d array of objects that each have an array of ids corresponding to the tenters for that shift
 * @param {*} people is same as defined in the method schedule()
 * @param {*} scheduleGrid is same as defined in the method schedule()
 * returns a modified copy of combinedGrid (DOES NOT MODIFY combinedGrid IN PLACE, but does modify everything else in place)
 */
static cleanStraySlots(combinedGrid, people, scheduleGrid){
  var newGrid = [];
  for (var i =0; i < combinedGrid.length; i++){
    var row = combinedGrid[i];
    newGrid.push(row);
  }

  //for now, I am avoiding the annoying edge cases at the beginning and end

  for (var i = 1; i < combinedGrid.length - 1; i++){
    var currTenters = newGrid[i].ids;
    for (var tenterIndex = 0; tenterIndex < currTenters.length; tenterIndex += 1){
      //check if this person is also in the slot above/below
      var loneShift = true;
      var tenter = currTenters[tenterIndex];
      if (tenter == "empty" || tenter == "Grace")
        continue;
      var previousTenters = newGrid[i-1].ids;
      var nextTenters = newGrid[i+1].ids;
      var tenterIDNum = -1;
      for (var p = 0; p < people.length; p++){
        if (people[p].id == tenter)
          tenterIDNum = p;
      }
      if ((Helpers.inArray(tenter, previousTenters) >= 0) || (Helpers.inArray(tenter, nextTenters) >= 0)){
        //this tenter is fine, they're scheduled for a shift either before or after this one
        loneShift = false;
        continue;
      }

      if (loneShift){
        //if neither worked, try to schedule someone from above into the current slot
        if (this.findTenterAboveToEdit(scheduleGrid, i) != null){
          var [indexAbove, idAbove] = this.findTenterAboveToEdit(scheduleGrid, i);
          this.shiftReplacement(people, scheduleGrid, newGrid, tenterIDNum, indexAbove, i);
          break;
        }

        //if that hasn't worked, try to schedule someone from below into the current slot
        if (this.findTenterBelowToEdit(scheduleGrid, i)){
          var [indexBelow, idBelow] = this.findTenterBelowToEdit(scheduleGrid, i);
          this.shiftReplacement(people, scheduleGrid, newGrid, tenterIDNum, indexBelow, i);
          break;
        }

        //first try to schedule tenter in the above time slot
        if ((scheduleGrid[tenterIDNum][i-1].status == "Available") && !(scheduleGrid[tenterIDNum][i-1].isNight)){
          if (this.findTenterAboveToEdit(scheduleGrid, i) != null){
            var [indexToRemove, IDToRemove] = this.findTenterAboveToEdit(scheduleGrid, i);
            this.shiftReplacement(people, scheduleGrid, newGrid, indexToRemove, tenterIDNum, i-1);
            break;
          } 
        }

        //if that doesn't work, try to schedule tenter in the below slot
        if ((scheduleGrid[tenterIDNum][i+1].status == "Available") && !(scheduleGrid[tenterIDNum][i-1].isNight)){
          if (this.findTenterBelowToEdit(scheduleGrid, i) != null){
            var [indexToRemove, IDToRemove] = this.findTenterBelowToEdit(scheduleGrid, i);
            this.shiftReplacement(people, scheduleGrid, newGrid, indexToRemove, tenterIDNum, i+1);
            break;
          }
        }
        

        

      }

    }
  }

return newGrid;
}

/**
 * replaces the tenter identified by IndexToRemove with the tenter identified by newTenterIndex at a given time
 * @param {*} people (array of Person objects)
 * @param {*} scheduleGrid (array of arrays of Slot objects)
 * @param {*} newGrid is a 1d array of objects that each have an array of ids corresponding to the tenters for that shift
 * @param {*} IndexToRemove (int) is the person's index in scheduleGrid, i.e. scheduleGrid[IndexToRemove] is their slots
 * @param {*} newTenterIndex (int) same kind of thing as IndexToRemove
 * @param {*} timeslot (int)
 */
static shiftReplacement(people, scheduleGrid, newGrid, IndexToRemove, newTenterIndex, timeslot){
  var personToRemove = people[IndexToRemove];
  personToRemove.dayScheduled -= 1;
  people[newTenterIndex].dayScheduled += 1;
  scheduleGrid[IndexToRemove][timeslot].status = "Available";
  scheduleGrid[newTenterIndex][timeslot].status = "Scheduled";

  var newSlotIDs = [people[newTenterIndex].id];
  for (var i = 0; i < newGrid[timeslot].ids.length; i++){
    if (newGrid[timeslot].ids[i] == people[IndexToRemove].id)
      continue;
    else
      newSlotIDs.push(newGrid[timeslot].ids[i])
  }

  newGrid[timeslot].ids = newSlotIDs;
}


/**
 * Helper method for cleanStraySlots()
 * pick someone scheduled in the slot above timeslot who is not scheduled for this timeslot
 * @param {*} scheduleGrid 
 * @param {*} timeslot 
 * @returns [index, ID], or null if there is no such person
 */
static findTenterAboveToEdit(scheduleGrid, timeslot){
  if (timeslot <= 0){
    return null;
  }
  for (var i = 0; i < scheduleGrid.length; i++){
    if ((scheduleGrid[i][timeslot-1].status == "Scheduled") && (scheduleGrid[i][timeslot].status == "Available")){
      return [i, scheduleGrid[i][timeslot-1].personID];
    }
  }
  return null;

}

/**
 * Helper method for cleanStraySlots()
 * pick someone scheduled in the slot below timeslot who is not scheduled for this timeslot
 * @param {*} scheduleGrid 
 * @param {*} timeslot 
 * @returns [index, ID], or null if there is no such person
 */
static findTenterBelowToEdit(scheduleGrid, timeslot){
  if (timeslot >= scheduleGrid[0].length -1){
    return null;
  }
  for (var i = 0; i < scheduleGrid.length; i++){
    if ((scheduleGrid[i][timeslot+1].status == "Scheduled") && (scheduleGrid[i][timeslot].status == "Available")){
      return [i, scheduleGrid[i][timeslot+1].personID];
    }
  }
  return null;

}

/**
 * Helper method at the end of schedule(). This is purely for visualization purposes. 
 * It makes the person's name aligned on the final grid
 * @param {} grid 
 */
static reorganizeGrid(grid){
  for (var i = 1; i < grid.length; i++){
    var currIDs = grid[i].ids;
    var prevIDs = grid[i-1].ids;

    if (prevIDs.length != currIDs.length)
      continue;

    var newIDList = new Array(currIDs.length);
    var emptiesAdded = 0;
    for (var j = 0; j < prevIDs.length; j++){
      if (Helpers.inArray(prevIDs[j], currIDs) >= 0){
        newIDList[j] = prevIDs[j];
        if (prevIDs[j] == "empty")
          emptiesAdded += 1;
      }
    }

    var emptiesInCurrent = 0;
    for (var j = 0; j < currIDs.length; j++){
      if (currIDs[j] == "empty")
        emptiesInCurrent += 1;
    }
    for (var j = 0; j < currIDs.length; j++){
      if ((currIDs[j] != "empty") && (Helpers.inArray(currIDs[j], newIDList) >= 0))
        continue;
      else{
        //find somewhere to insert it
        for (var k = 0; k < newIDList.length; k++){
          if (newIDList[k] == null){
            newIDList[k] = currIDs[j];
            break;
          }
        }
        if (currIDs[j] == "empty")
          emptiesAdded += 1;
      }
    }

    grid[i].ids = newIDList;
  }

}





}

module.exports = FinalTouches;