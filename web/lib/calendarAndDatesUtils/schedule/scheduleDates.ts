import { getCurrentDate, getDatePlusNumShifts } from "../../calendarAndDatesUtils/datesUtils";
import { getScheduleDates, CURRENT_YEAR } from "../../schedulingAlgo/rules/scheduleDates";
import { TENTING_COLORS } from "../../schedulingAlgo/rules/phaseData";
import { ScheduleData } from "@/lib/controllers/scheduleData";



export const getDefaultDisplayDateGivenTentType = (tentType : string, year=CURRENT_YEAR) : Date => {
	let scheduleDates = getScheduleDates(year);
	let startOfTenting = scheduleDates.startOfBlack
	if (tentType === TENTING_COLORS.BLUE){
		startOfTenting = scheduleDates.startOfBlue;
	} else if (tentType === TENTING_COLORS.WHITE){
		startOfTenting = scheduleDates.startOfWhite;
	}
	let currentDate = getCurrentDate();
	if (currentDate < startOfTenting){
		return new Date(startOfTenting.getFullYear(), startOfTenting.getMonth(), startOfTenting.getDate(), 0, 0);
	} else if (currentDate > scheduleDates.endOfTenting){
		return new Date(startOfTenting.getFullYear(), startOfTenting.getMonth(), startOfTenting.getDate(), 0, 0);;
	} else {
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0);
		currentDate.setMilliseconds(0);
		return currentDate;
	}
}