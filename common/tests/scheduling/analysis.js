export class Analysis {

	/**
	 * 
	 * @param {String} dnt 
	 * @param {number} minHr is the minimum
	 * @param {number} maxHr is the maximum... profound
	 * @param {number} meanHr 
	 * @param {number} stdDevHr 
	 */
	constructor(dnt, minHr, maxHr, meanHr, stdDevHr){
		this.dnt = dnt;
        this.minHr = minHr;
        this.maxHr = maxHr;
        this.meanHr = meanHr;
        this.stdDevHr = stdDevHr;
	}


}


