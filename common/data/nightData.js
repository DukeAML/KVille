import { isNight2024 } from "./2024/nightData";
import { isNight2023 } from "./2023/nightData";
export const nightData = {nightStartHour: 2, nightEndHour: 7}

/**
 * @param {Date} date
 * @returns {boolean} true iff this date corresponds to the start of a night shift slot
 */
export const isNight = (date) => {
    let year = date.getFullYear();
    if (year < 2023.5){
        return isNight2023(date);
    } else {
        return isNight2024(date);
    }

}