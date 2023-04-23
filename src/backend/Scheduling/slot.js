class Slot{


    /**
     * startDate and endDate are used as integers from 0-47 (for the 48 30-minute shifts in a day)
     */
    /**
     * 
     * @param {*} personID (integer or String)
     * @param {*} startDate (integer) like 0 for 12:00am on Sunday, 96 for 12:00am on Tuesday, 
     * @param {*} endDate (integer) 
     * @param {*} phase (string) "Black", "Blue", or "White"
     * @param {*} isNight (boolean)
     * @param {*} status (string) "Available" for available, any other string for not available
     * @param {*} row corresponds to startDate
     * @param {*} col corresponds to personID
     * @param {*} weight 
     */
    constructor(personID, startDate, endDate, phase, isNight, status, row, col, weight=1){
      this.personID = personID;
      this.startDate = startDate;
      this.endDate = endDate;
      this.phase = phase;
      this.isNight = isNight;
      this.status = status;
      this.row = row;
      this.col = col;
      this.weight = 1;
      this.ids = [];
    }
  
    to_hash() {
      var hash = {};
      for (const instance_variable in this){
        hash[instance_variable] = this[instance_variable];
      }
      return hash;
    }
  
}

module.exports = Slot;