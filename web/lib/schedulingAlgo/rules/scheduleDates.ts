import {scheduleDates2023} from "@/lib/data/2023/scheduleDates";
import {scheduleDates2024} from "@/lib/data/2024/scheduleDates";


export const CURRENT_YEAR = 2024;


interface ScheduleDatesInterface {
    startOfTenting : Date;
    endOfTenting : Date;
    startOfBlack : Date;
    startOfBlue : Date;
    startOfWhite : Date;
}
export const getScheduleDates = (year=CURRENT_YEAR): ScheduleDatesInterface => {
    if (year < 2023.5) {
        return scheduleDates2023;
    } else {
        return scheduleDates2024;
    }

}