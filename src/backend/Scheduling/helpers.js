const nightData = require("../../data/nightData.json");
const graceData = require("../../data/gracePeriods.json");
const phaseData = require("../../data/phaseData.json");
const Slot = require("./slot");
class Helpers {
  static weekNum = 1;
  /**
   * Calculate how many people are needed during this shift
   * @param {*} nightBoolean 
   * @param {*} phase 
   * @param {*} timeIndex a number from 0-335, assuming a 30 minute chunk for each part of the week
   * @returns number of people needed
   */
    static calculatePeopleNeeded(nightBoolean, phase, timeIndex=0) {
      //first check if there's grace
      if (this.isGrace(timeIndex, "week"+this.weekNum)){
        return 0;
      }

      if (phase == "Black") {
        if (nightBoolean)
          return phaseData["Black"]["night"];
        else
          return phaseData["Black"]["day"];
        
      }
      if (phase == "Blue"){
        if (nightBoolean)
          return phaseData["Blue"]["night"];
        else
          return phaseData["Blue"]["day"];
      }
      if (phase == "White"){
        if (nightBoolean)
          return phaseData["White"]["night"];
        else
          return phaseData["White"]["day"];
      }
    }

    /**
     * Checks if this time slot corresponds to a grace period. 
     * THIS CURRENT APPROACH SHOULD BE CHANGED. IT IS NOT FLEXIBLE.
     * @param {*} timeIndex (int) specifies the half hour slot
     * @param {*} weekStr (int) specifies which week it is
     * @returns true iff this slot corresponds to a grace period
     */
    static isGrace(timeIndex, weekStr){
      var entries = graceData[weekStr];
      for (const [start, end] of Object.entries(entries)){
        if ((timeIndex >= Number(start)) && (timeIndex <= end)){
          return true;
        }
      }

      return false;

    }

    /**
     * Return true if the slotIndex corresponds to a night shift
     * @param {*} slotIndex is an int from 0 to 335, i.e. 0 represents 12:00am on Sunday, 
     *    30 represents 3:00am on Monday, etc...
     */
    static isSlotNight(slotIndex){
      var mod48 = slotIndex % 48;
      if ((mod48 >= nightData.nightStart) && (mod48 < nightData.nightEnd)){
        return true;
      } else{
        return false;
      }

    }



    /**
     * Return an array of length 2, whose first element is the number of day slots they are free,
     *    and the second element is the number of night slots where they are free. 
     * @param {*} availabilities an array of booleans, 336 of them if it is for one week 
     */
    static dayNightFree(availabilities){
      var dayFree = 0;
      var nightFree = 0;
      for (var index = 0; index < availabilities.length; index++){
        if (availabilities[index] == true){
          if (this.isSlotNight(index)){
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
     * @param {*} personID (integer?) is the id of the user whose availabilities are passed in as an argument
     * @param {*} availabilities an array of booleans, 336 booleans if it is for one week
     * @param {*} phase a string, either "Black", "Blue", or "White"
     * @param {*} userCount an integer. When you're calling this method on the ith member of the group, 
     *      userCount should be i. 0 for the first member, 1 for the second, etc...
     */
    static availabilitiesToSlots(personID, availabilities, phase, userCount){
      var slots = [];
      for (var index = 0; index < availabilities.length; index++){
        var status = "Available";
        if (availabilities[index] == false){
          status = "Unavailable";
        }
        var slot = new Slot(personID, index, index+1, phase, this.isSlotNight(index), status, index, userCount);
        slots.push(slot);
      }

      return slots;

    }

    /**
     * check if an item == any element in the array
     * @param {*} item 
     * @param {*} arr 
     * @returns -1 if the item is not in arr, or returns i s.t. (arr[i] == item) if item is in arr
     */
    static inArray(item, arr){
      for (var i = 0; i < arr.length; i++){
        if (arr[i] == item)
          return i;
      }

      return -1;
    }
  
  }

module.exports = Helpers;
  