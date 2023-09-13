import { TENTING_COLORS } from "../../data/phaseData";
import { scheduleDates } from "../../data/scheduleDates";
/**
 * 
 * @param {String} tentType denote which type of tent this is
 * @returns {Date} the Date (year, month, day, hour, minutes) on which tenting begings
 */
export function getTentingStartDate(tentType){
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