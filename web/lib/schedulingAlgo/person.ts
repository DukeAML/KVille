export class Person {
	id : string;
	name : string;
	dayFree : number;
	nightFree : number;
	dayScheduled : number;
	nightScheduled : number;

	constructor(id : string, name : string, dayFree : number, nightFree : number, dayScheduled : number, nightScheduled : number){
		this.id = id;
		this.name = name;
		this.dayFree = dayFree;
		this.dayScheduled = dayScheduled;
		this.nightFree = nightFree;
		this.nightScheduled = nightScheduled;

	}


}


