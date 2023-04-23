class Person {

    /**
     * 
     * @param {*} id 
     * @param {*} name 
     * @param {*} dayFree is the number of slots (or is it minutes?) they are available in the day
     * @param {*} nightFree is the number of slots (or minutes ? ) they are available in the day
     * @param {*} dayScheduled is how many day shifts they've been scheduled for already
     * @param {*} nightScheduled is how many night shifts they've been scheduled for already
     */
    constructor(id, name, dayFree, nightFree, dayScheduled, nightScheduled){
      this.id = id;
      this.name = name;
      this.dayFree = dayFree;
      this.dayScheduled = dayScheduled;
      this.nightFree = nightFree;
      this.nightScheduled = nightScheduled;

    }


}
module.exports = Person;

