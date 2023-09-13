import { Slot } from "../slots/slot";
import { TenterSlot, TENTER_STATUS_CODES } from "../slots/tenterSlot";


/**
 * Finds number of slots for which this person is free during day and night each 
 * @param {Array} availabilities an array of booleans, 336 of them if it is for one week 
 * @param {Date} availabilitiesStartDate the date at which the availabilities array begins
 * @returns {Array<int>} an array of length 2, whose first element is the number of day slots they are free,
 *    and the second element is the number of night slots where they are free. 
 */
export function dayNightFree(availabilities, availabilitiesStartDate){
    var dayFree = 0;
    var nightFree = 0;
    for (var index = 0; index < availabilities.length; index++){
        if (availabilities[index] == true){
            var date = new Date(availabilitiesStartDate.getTime() + 30*index*60000);
            if (Slot.checkNight(date)){
                nightFree += 1;
            } else{
                dayFree += 1;
            }
        }
    }
    return [dayFree, nightFree];
}

/**
 * Take in an array of booleans (availabilities over a time span) and return a corresponding array
 *    of slot objects
 * @param {String} personID is the id of the user whose availabilities are passed in as an argument
 * @param {Array} availabilities an array of booleans, 336 booleans if it is for one week
 * @param {Date} availabilitiesStartDate the date at which the availabilities array begins
 * @param {String} phase a string, either TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, or TENTING_COLORS.WHITE
 * @param {int} userCount an integer. When you're calling this method on the ith member of the group, 
 *      userCount should be i. 0 for the first member, 1 for the second, etc...
 * @returns {Array<TenterSlot>} an array of TenterSlot objects corresponding to each slot given in the availabilities argument
 */
export function availabilitiesToSlots(personID, availabilities, availabilitiesStartDate, phase, userCount){
    var slots = [];
    for (var index = 0; index < availabilities.length; index++){
        var status = TENTER_STATUS_CODES.AVAILABLE;
        if (availabilities[index] == false){
            status = TENTER_STATUS_CODES.UNAVAILABLE;
        }
        var date = new Date(availabilitiesStartDate.getTime() + 30*index*60000);
        var slot = new TenterSlot(personID, date, phase, status, index, userCount, 1);
        
        slots.push(slot);
    }

    return slots;

}