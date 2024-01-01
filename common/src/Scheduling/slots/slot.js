import {nightData, isNight as checkIfNight} from "../../../data/nightData.js" 
import {graceData} from "../../../data/gracePeriods.js"
import { phaseData, TENTING_COLORS } from "../../../data/phaseData.js";
import { scheduleDates } from "../../../data/scheduleDates.js";
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
		this.phase = Slot.getPhase(startDate);
		this.isNight = checkIfNight(startDate);
		this.isGrace = Slot.checkGrace(startDate);
    }

	/**
	 * 
	 * @param {Date} startDate 
	 */
	static getPhase(startDate){
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
  

    /**
     * Determine if this slot is in a grace period
     * @param {Date} startDate the starting date for this time slot
     * @returns {boolean} true iff this slot is during a grace period
     */
    static checkGrace(startDate){
		var gracePeriods = graceData.gracePeriods;
		for (var gracePeriodIndex = 0; gracePeriodIndex < gracePeriods.length; gracePeriodIndex += 1){
			var gracePeriod = gracePeriods[gracePeriodIndex];
			var graceStartDate = gracePeriod.startDate;
			var graceEndDate = gracePeriod.endDate;
	
			
			if ((startDate >= graceStartDate) && (startDate < graceEndDate)){
				return true;
			} 
		}
		return false;
    }

    /**
     * 
     * @returns {boolean}
     */
    checkGrace(){
		return Slot.checkGrace(this.startDate);
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

