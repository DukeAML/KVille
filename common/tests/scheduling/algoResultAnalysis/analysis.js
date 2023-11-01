import { ScheduledSlot } from "../../../src/scheduling/slots/scheduledSlot";
import { TENTER_STATUS_CODES } from "../../../src/scheduling/slots/tenterSlot";
import { Person } from "../../../src/scheduling/person";
import { TenterSlot } from "../../../src/scheduling/slots/tenterSlot";
export class ScheduleHoursAnalysis {

	/**
	 * @param {number} minHr is the minimum
	 * @param {number} maxHr is the maximum... profound
	 * @param {number} meanHr 
	 * @param {number} stdDevHr 
	 */
	constructor(minHr, maxHr, meanHr, stdDevHr){
        this.minHr = minHr;
        this.maxHr = maxHr;
        this.meanHr = meanHr;
        this.stdDevHr = stdDevHr;
	}

	printAnalysis(){
		console.log("Minimum hours: "+this.minHr+", Maximum hours: "+this.maxHr+", Average hours: "+this.meanHr.toString()+", Standard Deviation: "+this.stdDevHr.toString())
	}


}

export class AlgoAnalysis {
	

	/**
	 * 
	 * @param {Array<Person>} people 
	 * @param {Array<ScheduledSlot>} scheduledSlots 
	 * @param {Array<Array<TenterSlot>>} tenterSlotsGrid
	 * @param {number} runtimeMS 
	 */
	constructor(people, scheduledSlots, tenterSlotsGrid, runtimeMS){
		this.dayHoursAnalysis = getHoursDistributionAnalysis(people, (person) => person.dayScheduled / 2);
        this.nightHoursAnalysis = getHoursDistributionAnalysis(people, (person) => person.nightScheduled / 2);
        this.totalHoursAnalysis = getHoursDistributionAnalysis(people, (person) => (person.dayScheduled + person.nightScheduled) / 2);
		this.runtimeMS = runtimeMS;
		this.aoutwPerPerson = [];
		this.woutaPerPerson = [];
		tenterSlotsGrid.forEach((tenterSlots) => {
			let {aoutw, wouta} = getSatisfaction(scheduledSlots, tenterSlots);
			this.aoutwPerPerson.push(aoutw);
			this.woutaPerPerson.push(wouta);
		})



	}

	printAnalysis(){
		console.log("runtime in ms: " + this.runtimeMS);
		/*
		console.log("day time hours:");
		this.dayHoursAnalysis.printAnalysis();
		console.log("night time hours:");
		this.nightHoursAnalysis.printAnalysis();
		*/
		console.log("total hours analysis");
		this.totalHoursAnalysis.printAnalysis();
		console.log("assigned out of wanted per person:");
		console.log(this.aoutwPerPerson.map((val) => val.toFixed(2)));
		console.log("wanted out of assigned per person:");
		console.log(this.woutaPerPerson.map((val) => val.toFixed(2)))

	}
}

/**
 * 
 * @param {Array<Person>} people 
 * @param {(person : Person) => number} getHoursFromPerson
 */
function getHoursDistributionAnalysis(people, getHoursFromPerson){
    let info = people.map((person) => getHoursFromPerson(person))
    let meanHours = 0;
    let minHours = info[0];
    let maxHours = info[0];
    let stdDevHours = 0;
    
    for (let ind = 0; ind < info.length; ind++) {
        meanHours += info[ind];
        minHours = Math.min(minHours, info[ind]);
        maxHours = Math.max(maxHours, info[ind]);
    }
    meanHours = meanHours/info.length;
    for(let ind = 0; ind<info.length; ind++){
        stdDevHours += Math.pow((info[ind]-meanHours),2);
    }
    stdDevHours /= info.length;
    stdDevHours = Math.sqrt(stdDevHours);
    return new ScheduleHoursAnalysis(minHours, maxHours, meanHours, stdDevHours);
}


/**
 * @param {Array<ScheduledSlot>} finalSchedule2// is this the right type? final schedule
 * @param {Array<TenterSlot>} pref//person's original preferred schedule(an object variable)
 */
export function getSatisfaction(finalSchedule2, pref){
    let numassigned = 0;//how many timeslots person is assigned
    let numpref = 0;//how many timeslots the person wanted
    let numboth = 0;//how many timeslots were wanted and assigned
    //iterate through scheduled slots in final schedule, check to see if pref's name is in the ids at the corresponding time
    for(let tmslot = 0; tmslot<finalSchedule2.length; tmslot++){
        //check if person's name is in the scheduledSlot.ids(checking they are assigned)
        let personRN = pref[tmslot].personID;
        if(finalSchedule2[tmslot].ids.includes(personRN)){
            numassigned++;
            //check if they wanted this timeslot
            if(pref[tmslot].ogStatus === TENTER_STATUS_CODES.PREFERRED){
                //wanted and got it
                numpref++;
                numboth++;
            }
        }
        else if(pref[tmslot].ogStatus === TENTER_STATUS_CODES.PREFERRED){
            //wanted but did not get
            numpref++;
        }
    }
    //percent for how many slots they were assigned out of total wanted
    let aoutw = ((numboth/(numpref+0.001))*100);
    //percent for how many slots they wanted out of total assigned
    let wouta = ((numboth/(numassigned+0.001))*100);
    //console.log(aoutw.toFixed(2)+"% slots assigned out of total slots preferred");
    //console.log(wouta.toFixed(2)+"% slots preferred out of total slots assigned");
    return {aoutw, wouta};
}


