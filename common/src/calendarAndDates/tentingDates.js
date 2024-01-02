import { TENTING_COLORS } from "../scheduling/rules/phaseData";
import { getScheduleDates, CURRENT_YEAR } from "../scheduling/rules/scheduleDates";
/**
 * 
 * @param {String} tentType denote which type of tent this is
 * @param {number} year which year are we in
 * @returns {Date} the Date (year, month, day, hour, minutes) on which tenting begings
 */
export function getTentingStartDate(tentType, year=CURRENT_YEAR){
    let scheduleDates = getScheduleDates(year);
    if (tentType == TENTING_COLORS.BLACK){
        return scheduleDates.startOfBlack;
    } else if (tentType == TENTING_COLORS.BLUE){
        return scheduleDates.startOfBlue;
    } else if (tentType == TENTING_COLORS.WHITE){
        return scheduleDates.startOfWhite;
    } else {
        return scheduleDates.startOfBlack;
    }
}