export const nightData = {nightStartHour: 2, nightEndHour: 7}

/**
 * @param {Date} date
 * @returns {boolean} true iff this date corresponds to the start of a night shift slot
 */
export const isNight2023 = (date) => {
    let hour = date.getHours();
    if (hour >= 1.99 && hour < 6.99){
        return true;
    } else {
        return false;
    }
}