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
	 * @param {ScheduleHoursAnalysis} dayHoursAnalysis 
	 * @param {ScheduleHoursAnalysis} nightHoursAnalysis 
	 * @param {ScheduleHoursAnalysis} totalHoursAnalysis 
	 * @param {number} runtimeMS runtime of the algorithm in milliseconds
	 */
	constructor(dayHoursAnalysis, nightHoursAnalysis, totalHoursAnalysis, runtimeMS){
		this.dayHoursAnalysis = dayHoursAnalysis;
		this.nightHoursAnalysis = nightHoursAnalysis;
		this.totalHoursAnalysis = totalHoursAnalysis;
		this.runtimeMS = runtimeMS;
	}

	printAnalysis(){
		console.log("runtime in ms: " + this.runtimeMS);
		console.log("day time hours:");
		this.dayHoursAnalysis.printAnalysis();
		console.log("night time hours:");
		this.nightHoursAnalysis.printAnalysis();
		console.log("total hours analysis");
		this.totalHoursAnalysis.printAnalysis();
	}
}


