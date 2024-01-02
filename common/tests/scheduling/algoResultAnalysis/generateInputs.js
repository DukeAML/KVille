import { Person } from "../../../src/scheduling/person.js";
import { TenterSlot, TENTER_STATUS_CODES } from "../../../src/scheduling/slots/tenterSlot.js";
import { getDatePlusNumShifts } from "../../../src/calendarAndDates/datesUtils.js";
import { TENTING_COLORS } from "../../../src/scheduling/rules/phaseData.js";
import { examples } from "./exampleAvailability.js";


/** 
 * @param {Date} startDate 
 * @param {int} numDays
 * @param {String} tentType
 * @param {double} pct_avail //how many slots should be assigned out of total
 * @param {double} pct_pref
 * @param {int} numPeople //how many ppl we need info for, for tenterSlotsGrid[index][...]
 * @returns {{people : Array<Person>, tenterSlotsGrid : Array<Array<TenterSlot>>}}
 */
export function generateInput(startDate, numDays, tentType, pct_avail, pct_pref, numPeople=12){
    let tenterSlotsGrid = [];
    let people = [];
    for (let i =0; i < numPeople; i += 1){
        let {person, slots} = generateInputForOnePerson(i, startDate, numDays, tentType, pct_avail, pct_pref);
        people.push(person);
        tenterSlotsGrid.push(slots);
    }

    
    return {people, tenterSlotsGrid};
}

/**
 * 
 * @param {number} personNumber 
 * @param {Date} startDate 
 * @param {number} numDays 
 * @param {String} tentType 
 * @param {number} pct_avail 
 * @param {number} pct_pref
 * @returns {{person : Person, slots : Array<TenterSlot>}} 
 */
function generateInputForOnePerson(personNumber, startDate, numDays, tentType, pct_avail, pct_pref){
    let slots = [];
    let id = personNumber.toString();
    for (let i =0; i < numDays; i +=1 ){
        let options = examples.randoms.black;
        if (tentType == TENTING_COLORS.BLUE){
            options = examples.randoms.blue;
        } else if (tentType == TENTING_COLORS.WHITE){
            options = examples.randoms.white;
        }

        let index = Math.floor(options.length * Math.random());
        
        for (let j = 0; j < 48; j += 1){
            let status = TENTER_STATUS_CODES.UNAVAILABLE;
            if (options[index].availability[j] && options[index].pref[j]){
                status = TENTER_STATUS_CODES.PREFERRED
            } else if (options[index].availability[j]){
                status = TENTER_STATUS_CODES.AVAILABLE;
            }
            slots.push(new TenterSlot(id, getDatePlusNumShifts(startDate, i*48 + j), tentType, status, i * 48 + j, personNumber ))

        }
    }

    let dayFree = slots.filter((slot) => (slot.status != TENTER_STATUS_CODES.UNAVAILABLE) && !(slot.isNight)).length;
    let nightFree = slots.filter((slot) => (slot.status != TENTER_STATUS_CODES.UNAVAILABLE) && (slot.isNight)).length;
    return {person : new Person(id, id, dayFree, nightFree, 0, 0 ), slots : slots}

}