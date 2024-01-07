import { ScheduledSlot } from "@/lib/schedulingAlgo/slots/scheduledSlot";
import { TENTER_STATUS_CODES } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { Person } from "@/lib/schedulingAlgo/person";
import { TenterSlot } from "@/lib/schedulingAlgo/slots/tenterSlot";
export class DistributionAnalysis {
    min : number;
    max : number;
    mean : number;
    stdDev : number;


	constructor(min : number, max : number, mean : number, stdDev : number){
        this.min = min;
        this.max = max;
        this.mean = mean;
        this.stdDev = stdDev;
	}

	printAnalysis(caption : string) : string{
		return caption + "\n" + "Minimum: "+this.min+", Maximum: "+this.max+", Mean: "+this.mean.toFixed(2)+", Standard Deviation: "+this.stdDev.toFixed((2)) + "\n";
	}


}

export class AlgoAnalysis {
	dayHoursAnalysis : DistributionAnalysis;
    nightHoursAnalysis : DistributionAnalysis;
    totalHoursAnalysis : DistributionAnalysis;
    runtimeMS : number;
    aoutwPerPerson : number[];
    woutaPerPerson : number[];
    woutaAnalysis : DistributionAnalysis;
    aoutwAnalysis : DistributionAnalysis;

	/**
	 * 
	 * @param {Array<Person>} people 
	 * @param {Array<ScheduledSlot>} scheduledSlots 
	 * @param {Array<Array<TenterSlot>>} tenterSlotsGrid
	 * @param {number} runtimeMS 
	 */
	constructor(people : Person[], scheduledSlots : ScheduledSlot[], tenterSlotsGrid : TenterSlot[][], runtimeMS : number){
		this.dayHoursAnalysis = getDistributionAnalysis(people.map((person) => person.dayScheduled / 2));
        this.nightHoursAnalysis = getDistributionAnalysis(people.map((person) => person.nightScheduled / 2));
        this.totalHoursAnalysis = getDistributionAnalysis(people.map((person) => (person.dayScheduled + person.nightScheduled) / 2));
		this.runtimeMS = runtimeMS;
		this.aoutwPerPerson = [];
		this.woutaPerPerson = [];
		tenterSlotsGrid.forEach((tenterSlots) => {
			let {aoutw, wouta} = getSatisfaction(scheduledSlots, tenterSlots);
			this.aoutwPerPerson.push(aoutw);
			this.woutaPerPerson.push(wouta);
		})
        this.woutaAnalysis = getDistributionAnalysis(this.woutaPerPerson);
        this.aoutwAnalysis = getDistributionAnalysis(this.aoutwPerPerson);



	}

	printAnalysis(caption : string) : string{
        let analysis = caption + "\n";
        analysis += "runtime in ms: " + this.runtimeMS + "\n";
        analysis += this.dayHoursAnalysis.printAnalysis("day hours analysis");
        analysis += this.nightHoursAnalysis.printAnalysis("night hours analysis");
		analysis += this.totalHoursAnalysis.printAnalysis("total hours analysis");
		analysis += this.aoutwAnalysis.printAnalysis("assigned out of wanted analysis");
		analysis += this.woutaAnalysis.printAnalysis("wanted out of assigned analysis");
        return analysis;

	}
}




function getDistributionAnalysis(data : number[]) : DistributionAnalysis {
    let mean = 0;
    let min = data[0];
    let max = data[0];
    let stdDev = 0;
    
    
    for (let ind = 0; ind < data.length; ind++) {
        mean += data[ind];
        min = Math.min(min, data[ind]);
        max = Math.max(max, data[ind]);
    }
    mean = mean/data.length;
    for(let ind = 0; ind<data.length; ind++){
        stdDev += Math.pow((data[ind]-mean),2);
    }
    stdDev /= data.length;
    stdDev = Math.sqrt(stdDev);
    return new DistributionAnalysis(min, max, mean, stdDev);
}



export function getSatisfaction(finalSchedule2 : ScheduledSlot[], pref : TenterSlot[]) : {aoutw : number, wouta : number} {
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


