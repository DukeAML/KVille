

import { Helpers } from "./helpers.js";
import { Person } from "./person.js";
import { ScheduledSlot } from "./scheduledSlot.js";
import { TenterSlot, EMPTY, GRACE, TENTER_STATUS_CODES } from "./tenterSlot.js";



export class FinalTouches{
    
	/**
	 * Adds in 'Grace Period' to combinedGrid where appropriate
	 * @param {Array<ScheduledSlot>} combinedGrid 
	 * returns nothing, modifies the grid in place
	 */
	static fillGrace(combinedGrid){
		for (var i = 0; i < combinedGrid.length; i++){
			var peopleNeeded = combinedGrid[i].calculatePeopleNeeded();
			if (peopleNeeded == 0){
				combinedGrid[i].ids.push(GRACE);
			}

		}   
	}

	
	/**
	 * add 'empty to id arrays to ensure the array length equals the number of people needed
	 * @param {Array<ScheduledSlot>} combinedGrid 
	 * returns nothing, modifies the grid in place
	 */
	static fillEmptySpots(combinedGrid){
		for (var i = 0; i < combinedGrid.length; i++){
			var peopleNeeded = combinedGrid[i].calculatePeopleNeeded();
			while (combinedGrid[i].ids.length < peopleNeeded){
				combinedGrid[i].ids.push(EMPTY);
			}

		}
	}

	/**
	 * There will be some poorly scheduled shifts where a tenter is there for just 30 minutes. 
	 * This method tries to remove those by extending the next tenter or prior tenter's shift
	 * @param {Array<ScheduledSlot>} combinedGrid 
	 * @param {Array<Person>} people is same as defined in the method Algorithm.schedule()
	 * @param {Array<Array<TenterSlot>>} scheduleGrid is same as defined in the method Algorithm.schedule()
	 * @returns {Array<ScheduledSlot>} modified copy of combinedGrid (DOES NOT MODIFY combinedGrid IN PLACE, 
	 *  but does modify everything else in place)
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
				if (tenter == EMPTY || tenter == GRACE)
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
					if ((scheduleGrid[tenterIDNum][i-1].status == TENTER_STATUS_CODES.AVAILABLE) && !(scheduleGrid[tenterIDNum][i-1].isNight)){
					if (this.findTenterAboveToEdit(scheduleGrid, i) != null){
						var [indexToRemove, IDToRemove] = this.findTenterAboveToEdit(scheduleGrid, i);
						this.shiftReplacement(people, scheduleGrid, newGrid, indexToRemove, tenterIDNum, i-1);
						break;
					} 
					}

					//if that doesn't work, try to schedule tenter in the below slot
					if ((scheduleGrid[tenterIDNum][i+1].status == TENTER_STATUS_CODES.AVAILABLE) && !(scheduleGrid[tenterIDNum][i-1].isNight)){
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
	 * @param {Array<Person>} people 
	 * @param {Array<Array<TenterSlot>>} scheduleGrid 
	 * @param {Array<ScheduledSlot>} newGrid 
	 * @param {int} IndexToRemove is the person's index in scheduleGrid, i.e. scheduleGrid[IndexToRemove] is their slots
	 * @param {int} newTenterIndex same kind of thing as IndexToRemove
	 * @param {int} timeslot 
	 */
	static shiftReplacement(people, scheduleGrid, newGrid, IndexToRemove, newTenterIndex, timeslot){
		var personToRemove = people[IndexToRemove];
		personToRemove.dayScheduled -= 1;
		people[newTenterIndex].dayScheduled += 1;
		scheduleGrid[IndexToRemove][timeslot].status = TENTER_STATUS_CODES.AVAILABLE;
		scheduleGrid[newTenterIndex][timeslot].status = TENTER_STATUS_CODES.SCHEDULED;

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
	 * @param {Array<Array<TenterSlot>>} scheduleGrid 
	 * @param {int} timeslot 
	 * @returns [index, ID], or null if there is no such person
	 */
	static findTenterAboveToEdit(scheduleGrid, timeslot){
		if (timeslot <= 0){
			return null;
		}
		for (var i = 0; i < scheduleGrid.length; i++){
			if ((scheduleGrid[i][timeslot-1].status == TENTER_STATUS_CODES.SCHEDULED) && (scheduleGrid[i][timeslot].status == TENTER_STATUS_CODES.AVAILABLE)){
				return [i, scheduleGrid[i][timeslot-1].personID];
			}
		}
		return null;

	}

	/**
	 * Helper method for cleanStraySlots()
	 * pick someone scheduled in the slot below timeslot who is not scheduled for this timeslot
	 * @param {Array<Array<TenterSlot>>} scheduleGrid 
	 * @param {int} timeslot 
	 * @returns [index, ID], or null if there is no such person
	 */
	static findTenterBelowToEdit(scheduleGrid, timeslot){
		if (timeslot >= scheduleGrid[0].length -1){
			return null;
		}
		for (var i = 0; i < scheduleGrid.length; i++){
			if ((scheduleGrid[i][timeslot+1].status == TENTER_STATUS_CODES.SCHEDULED) && (scheduleGrid[i][timeslot].status == TENTER_STATUS_CODES.AVAILABLE)){
				return [i, scheduleGrid[i][timeslot+1].personID];
			}
		}
		return null;

	}

	/**
	 * Helper method at the end of schedule(). This is purely for visualization purposes. 
	 * It makes the person's name aligned on the final grid
	 * @param {Array<ScheduledSlot>} grid 
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
					if (prevIDs[j] == EMPTY)
						emptiesAdded += 1;
				}
			}

			var emptiesInCurrent = 0;
			for (var j = 0; j < currIDs.length; j++){
				if (currIDs[j] == EMPTY)
					emptiesInCurrent += 1;
			}
			for (var j = 0; j < currIDs.length; j++){
				if ((currIDs[j] != EMPTY) && (Helpers.inArray(currIDs[j], newIDList) >= 0))
					continue;
				else{
					//find somewhere to insert it
					for (var k = 0; k < newIDList.length; k++){
						if (newIDList[k] == null){
							newIDList[k] = currIDs[j];
							break;
						}
					}
					if (currIDs[j] == EMPTY)
						emptiesAdded += 1;
				}
			}

			grid[i].ids = newIDList;
		}

	}





}

