import { isNight as checkIfNight } from "../../../data/nightData.js" 
import { isGrace } from "../../../data/gracePeriods.js"
import { getPhaseData, TENTING_COLORS } from "../../../data/phaseData.js";
import { getScheduleDates } from "../../../data/scheduleDates.js";
import { getDatePlusNumShifts } from "../../calendarAndDates/datesUtils.js";



export class Slot{

    /**
     * Generic slot object
     * @param {Date} startDate a JS Date Object
     * @param {String} tentType 
     */
    constructor(startDate, tentType){
		this.startDate = startDate;
		this.endDate = getDatePlusNumShifts(startDate, 1);
		this.tentType = tentType;
		this.phase = getPhaseForSlot(startDate);
		this.isNight = checkIfNight(startDate);
		this.isGrace = isGrace(startDate, false).isGrace;
    }


    /**
     * Calculate how many people are needed during this shift
     * @returns {number} number of people needed
     */
    calculatePeopleNeeded() {
		//first check if there's grace
		if (this.isGrace){
			return 0;
		}
		let phaseData = getPhaseData(this.startDate.getFullYear());
		if (this.phase == TENTING_COLORS.BLACK) {
			if (this.isNight)
				return phaseData.Black.night
			else
				return phaseData.Black.day;
			
		}
		if (this.phase == TENTING_COLORS.BLUE){
			if (this.isNight)
				return phaseData.Blue.night;
			else
				return phaseData.Blue.day;
		}
		if (this.phase == TENTING_COLORS.WHITE){
			if (this.isNight)
				return phaseData.White.night;
			else
				return phaseData.White.day;
		}
    }
  
}

/**
 * 
 * @param {Date} startDate 
 * @returns {string} phase
 */
const getPhaseForSlot = (startDate) => {
	let scheduleDates = getScheduleDates(startDate.getFullYear());
	if (startDate < scheduleDates.startOfBlack){
		return TENTING_COLORS.BLACK;
	} else if (startDate < scheduleDates.startOfBlue){
		return TENTING_COLORS.BLACK;
	} else if (startDate < scheduleDates.startOfWhite){
		return TENTING_COLORS.BLUE;
	} else {
		return TENTING_COLORS.WHITE;
	}
}
