import { Slot } from "../slots/slot";
import { TenterSlot, TENTER_STATUS_CODES } from "../slots/tenterSlot";
import { isNight } from "../rules/nightData";


/**
 * Finds number of slots for which this person is free during day and night each 
 * @param {Array<{available : boolean, preferred : boolean}} availabilities an array of booleans, 336 of them if it is for one week 
 * @param {Date} availabilitiesStartDate the date at which the availabilities array begins
 * @returns {{numFreeDaySlots : number, numFreeNightSlots : number}} 
 */
export function dayNightFree(availabilities, availabilitiesStartDate){
    var numFreeDaySlots = 0;
    var numFreeNightSlots = 0;
    for (var timeIndex = 0; timeIndex < availabilities.length; timeIndex++){
        if (availabilities[timeIndex].available == true){
            var date = new Date(availabilitiesStartDate.getTime() + 30*timeIndex*60000);
            if (isNight(date)){
                numFreeNightSlots += 1;
            } else{
                numFreeDaySlots += 1;
            }
        }
    }
    return {numFreeDaySlots, numFreeNightSlots};
}

/**
 * Take in an array of booleans (availabilities over a time span) and return a corresponding array
 *    of slot objects
 * @param {String} personID is the id of the user whose availabilities are passed in as an argument
 * @param {Array<{available : boolean, preferred : boolean}>} availabilities 
 * @param {Date} availabilitiesStartDate the date at which the availabilities array begins
 * @param {String} tentType a string, either TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, or TENTING_COLORS.WHITE
 * @param {number} userCount an integer. When you're calling this method on the ith member of the group, 
 *      userCount should be i. 0 for the first member, 1 for the second, etc...
 * @returns {Array<TenterSlot>} an array of TenterSlot objects corresponding to each slot given in the availabilities argument
 */
export function availabilitiesToSlots(personID, availabilities, availabilitiesStartDate, tentType, userCount){
    var slots = [];
    for (var timeIndex = 0; timeIndex < availabilities.length; timeIndex++){
        var status = TENTER_STATUS_CODES.AVAILABLE;
        if (availabilities[timeIndex].available == false){
            status = TENTER_STATUS_CODES.UNAVAILABLE;
        } else if (availabilities[timeIndex].available == true && availabilities[timeIndex].preferred == true){
            status = TENTER_STATUS_CODES.PREFERRED;
        }
        var date = new Date(availabilitiesStartDate.getTime() + 30*timeIndex*60000);
        var slot = new TenterSlot(personID, date, tentType, status, timeIndex, userCount, 1);
        
        slots.push(slot);
    }

    return slots;

}