export const SATURDAY = 6;
export const SUNDAY = 1;

/**
 * @param {Date} date
 * @returns {boolean} true iff this date corresponds to the start of a night shift slot
 */
export const isNight2024 = (date) => {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    hour = hour + minutes/60;
    let weekday = date.getDay();
    if (weekday === SATURDAY || weekday === SUNDAY){
        if (hour > 2.49 && hour < 6.99){
            //we want to include 2:30am starts and exclude 7am starts, include all in between
            return true;
        } else {
            return false;
        }
    } else {
        if (hour >= 0.99 && hour < 6.99){
            return true;
        }
    }

}
