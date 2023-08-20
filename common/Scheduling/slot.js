import nightData from "../data/nightData.json" assert {type : "json"};
import graceData from "../data/gracePeriods.json" assert {type : "json"};


export class Slot{

    /**
     * Generic slot object
     * @param {Date} startDate a JS Date Object
     * @param {String} phase (string) "Black", "Blue", or "White"
     */
    constructor(startDate, phase){
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 30*60000);
      this.phase = phase;
      this.isNight = Slot.checkNight(startDate);
      this.isGrace = Slot.checkGrace(startDate);
    }
  
    to_hash() {
      var hash = {};
      for (const instance_variable in this){
        hash[instance_variable] = this[instance_variable];
      }
      return hash;
    }

    /**
     * Check if this corresponds to a night slot
     * @param {Date} slotDate is the start date of the slot, as a JS Date object
     * @returns {boolean} true iff this is a night slot, false otherwise
     */
    static checkNight(slotDate){
      var startHour = slotDate.getHours();
      var minutes = slotDate.getMinutes();
      startHour += minutes / 60;

      if ((startHour >= nightData.nightStartHour) && (startHour < nightData.nightEndHour)){
        return true;
      } else {
        return false;
      }
    }

    /**
     * Determine if this slot is in a grace period
     * @param {Date} startDate the starting date for this time slot
     * @returns {boolean} true iff this slot is during a grace period
     */
    static checkGrace(startDate){
      var gracePeriods = graceData.gracePeriods;
      for (var i = 0; i < gracePeriods.length; i += 1){
        var gracePeriod = gracePeriods[i];
        var start = gracePeriod.startDate;
        var end = gracePeriod.endDate;
 
        var graceStartDate = new Date(start.year, start.monthIndex, start.day, start.hours, start.minutes);
        var graceEndDate = new Date(end.year, end.monthIndex, end.day, end.hours, end.minutes);
        
        if ((startDate >= graceStartDate) && (startDate < graceEndDate)){
          return true;
        } 
      }
      return false;
    }
  
}
