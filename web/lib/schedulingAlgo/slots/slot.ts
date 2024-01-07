import { isNight as checkIfNight } from "../rules/nightData"; 
import { isGrace } from "../rules/gracePeriods";
import { getPhaseData, TENTING_COLORS } from "../rules/phaseData";
import { getScheduleDates } from "../rules/scheduleDates";
import { getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils";



export class Slot{
	startDate : Date;
	endDate : Date;
	tentType : string;
	phase : string;
	isNight : boolean;
	isGrace : boolean;

    constructor(startDate : Date, tentType : string){
		this.startDate = startDate;
		this.endDate = getDatePlusNumShifts(startDate, 1);
		this.tentType = tentType;
		this.phase = getPhaseForSlot(startDate);
		this.isNight = checkIfNight(startDate);
		this.isGrace = isGrace(startDate, false).isGrace;
    }


    calculatePeopleNeeded() : number{
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
		} else {
			return 0;
		}
    }
  
}

const getPhaseForSlot = (startDate : Date) : string => {
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
