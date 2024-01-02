import {scheduleDates2023} from "./2023/scheduleDates";
import {scheduleDates2024} from "./2024/scheduleDates";


export const CURRENT_YEAR = 2024;

/**
 * 
 * @param {number} year 
 * @returns {{startOfTenting : Date, endOfTenting : Date, startOfBlack : Date, startOfBlue : Date, startOfWhite : Date}}
 */
export const getScheduleDates = (year=CURRENT_YEAR) => {
    if (year < 2023.5) {
        return scheduleDates2023;
    } else {
        return scheduleDates2024;
    }

}