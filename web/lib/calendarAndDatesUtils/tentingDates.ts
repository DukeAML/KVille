import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { getScheduleDates, CURRENT_YEAR } from "@/lib/schedulingAlgo/rules/scheduleDates";


export function getTentingStartDate(tentType : string, year=CURRENT_YEAR) : Date{
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