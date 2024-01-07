export class Person {

	/**
	 * 
	 * @param {String} id 
	 * @param {String} name 
	 * @param {number} dayFree is the number of slots (or is it minutes?) they are available in the day
	 * @param {number} nightFree is the number of slots (or minutes ? ) they are available in the day
	 * @param {number} dayScheduled is how many day shifts they've been scheduled for already
	 * @param {number} nightScheduled is how many night shifts they've been scheduled for already
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


