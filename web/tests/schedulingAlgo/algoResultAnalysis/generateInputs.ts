import { Person } from "../../../lib/schedulingAlgo/person";
import { TenterSlot, TENTER_STATUS_CODES } from "../../../lib/schedulingAlgo/slots/tenterSlot";
import { getDatePlusNumShifts } from "../../../lib/calendarAndDatesUtils/datesUtils";
import { TENTING_COLORS } from "../../../lib/schedulingAlgo/rules/phaseData";
import { examples } from "./exampleAvailability";


export function generateInput(startDate : Date, numDays : number, tentType : string, pct_avail : number, pct_pref : number, numPeople=12) : {people : Person[], tenterSlotsGrid : TenterSlot[][]} {
    let tenterSlotsGrid = [];
    let people = [];
    for (let i =0; i < numPeople; i += 1){
        let {person, slots} = generateInputForOnePerson(i, startDate, numDays, tentType, pct_avail, pct_pref);
        people.push(person);
        tenterSlotsGrid.push(slots);
    }

    
    return {people, tenterSlotsGrid};
}


function generateInputForOnePerson(personNumber : number, startDate : Date, numDays : number, tentType : string, pct_avail : number, pct_pref : number) : {person : Person, slots : TenterSlot[]} {
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