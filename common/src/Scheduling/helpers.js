
import {nightData} from "../../data/nightData.js" 
import {phaseData} from "../../data/phaseData.js" 
import {scheduleDates} from "../../data/scheduleDates.js" 
import {getNumSlotsBetweenDates} from "../calendarAndDates/datesUtils.js";
import { Slot } from "./slot.js";
import { TenterSlot } from "./tenterSlot.js";


export class Helpers {



    /**
     * Calculate how many people are needed during this shift
     * @param {Slot} slot is a Slot out of which the phase, isNight, and startDate fields are used here
     * @returns {int} number of people needed
     */
    static calculatePeopleNeeded(slot) {
      //first check if there's grace
      if (slot.isGrace){
        return 0;
      }

      if (slot.phase == "Black") {
        if (slot.isNight)
          return phaseData["Black"]["night"];
        else
          return phaseData["Black"]["day"];
        
      }
      if (slot.phase == "Blue"){
        if (slot.isNight)
          return phaseData["Blue"]["night"];
        else
          return phaseData["Blue"]["day"];
      }
      if (slot.phase == "White"){
        if (slot.isNight)
          return phaseData["White"]["night"];
        else
          return phaseData["White"]["day"];
      }
    }



    /**
     * Finds number of slots for which this person is free during day and night each 
     * @param {Array} availabilities an array of booleans, 336 of them if it is for one week 
     * @param {Date} availabilitiesStartDate the date at which the availabilities array begins
     * @returns {Array<int>} an array of length 2, whose first element is the number of day slots they are free,
     *    and the second element is the number of night slots where they are free. 
     */
    static dayNightFree(availabilities, availabilitiesStartDate){
      var dayFree = 0;
      var nightFree = 0;
      for (var index = 0; index < availabilities.length; index++){
        if (availabilities[index] == true){
          var date = new Date(availabilitiesStartDate.getTime() + 30*index*60000);
          if (Slot.checkNight(date)){
            nightFree += 1;
          } else{
            dayFree += 1;
          }
        }
      }
      return [dayFree, nightFree];
    }

    /**
     * Take in an array of booleans (availabilities over a time span) and return a corresponding array
     *    of slot objects
     * @param {String} personID is the id of the user whose availabilities are passed in as an argument
     * @param {Array} availabilities an array of booleans, 336 booleans if it is for one week
     * @param {Date} availabilitiesStartDate the date at which the availabilities array begins
     * @param {String} phase a string, either "Black", "Blue", or "White"
     * @param {int} userCount an integer. When you're calling this method on the ith member of the group, 
     *      userCount should be i. 0 for the first member, 1 for the second, etc...
     * @returns {Array<TenterSlot>} an array of TenterSlot objects corresponding to each slot given in the availabilities argument
     */
    static availabilitiesToSlots(personID, availabilities, availabilitiesStartDate, phase, userCount){
      var slots = [];
      for (var index = 0; index < availabilities.length; index++){
        var status = "Available";
        if (availabilities[index] == false){
          status = "Unavailable";
        }
        var date = new Date(availabilitiesStartDate.getTime() + 30*index*60000);
        var slot = new TenterSlot(personID, date, phase, status, index, userCount, 1);
        
        slots.push(slot);
      }

      return slots;

    }

    /**
     * check if an item == any element in the array
     * @param {*} item 
     * @param {*} arr 
     * @returns {int} -1 if the item is not in arr, or returns i s.t. (arr[i] == item) if item is in arr
     */
    static inArray(item, arr){
      for (var i = 0; i < arr.length; i++){
        if (arr[i] == item)
          return i;
      }

      return -1;
    }

    /**
     * Check if two Dates are equal
     * @param {Date} date1 
     * @param {Date} date2 
     * @returns {boolean} true iff the two dates refer to the same year, month, day, hour, minute; return false otherwise
     */
    static datesEqual(date1, date2){
      if (date1.getFullYear() != date2.getFullYear()){
        return false;
      } else if (date1.getMonth() != date2.getMonth()){
        return false;
      } else if (date1.getDate() != date2.getDate()){
        return false;
      } else if (date1.getHours() != date2.getHours()){
        return false;
      } else if (date1.getMinutes() != date2.getMinutes()){
        return false;
      } else {
        return true;
      }

    }
  
  /**
   * 
   * @param {String} tentType should be "Black", "Blue", or "White" to denote which type of tent this is
   * @returns {Date} the Date (year, month, day, hour, minutes) on which tenting begings
   */
  static getTentingStartDate(tentType){
    if (tentType == "Black"){
      return this.getBlackTentingStartDate();
    } else if (tentType == "Blue"){
      return this.getBlueTentingStartDate();
    } else if (tentType == "White"){
      return this.getWhiteTentingStartDate();
    } else {
      return this.getBlackTentingStartDate();
    }
  }

  static getBlackTentingStartDate(){
    const data = scheduleDates.startOfBlack;
    const startDate = new Date(data.year, data.monthIndex, data.day, data.hours, data.minutes);
    return startDate;
  }

  static getBlueTentingStartDate(){
    const data = scheduleDates.startOfBlue;
    const startDate = new Date(data.year, data.monthIndex, data.day, data.hours, data.minutes);
    return startDate;
  }

  static getWhiteTentingStartDate(){
    const data = scheduleDates.startOfWhite;
    const startDate = new Date(data.year, data.monthIndex, data.day, data.hours, data.minutes);
    return startDate;
  }

  /**
   * 
   * @param {String} tentType 
   * @returns {Array<String>} an array with an entry for each timeslot, autofilled with "empty"
   */
  static getDefaultSchedule(tentType){
    let startDate = this.getTentingStartDate(tentType);
    let endDate = this.getTentingEndDate();
    let numSlots = getNumSlotsBetweenDates(startDate, endDate);
    return new Array(numSlots).fill("empty");
  }

  /**
   * 
   * @returns {Date} the Date (year, month, day, hour, minutes) on which tenting ends
   */
  static getTentingEndDate(){
    const data = scheduleDates.endOfTenting;
    const endDate = new Date(data.year, data.monthIndex, data.day, data.hours, data.minutes);
    return endDate;
  }
  
  }

//module.exports = Helpers;
  