import { scheduleAlgorithm} from "../../src/scheduling/algorithm.js";
import { Person } from "../../src/scheduling/person.js";
import { TenterSlot, TENTER_STATUS_CODES } from "../../src/scheduling/slots/tenterSlot.js";

import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils.js";
import { TENTING_COLORS} from "../../data/phaseData.js";
import { Analysis } from "./analysis.js";
describe("result tests", () => {
    it("", () => {
        const people = [];
        const tenterSlotsGrid = [];
        const PHASE = TENTING_COLORS.WHITE;
        let startDate = new Date(2023, 0, 17, 0, 0);
        for (let i = 0; i < 12; i += 1){
            let id = "p" + i.toFixed(0);
            people.push(new Person(id, id, 266, 70, 0, 0 ));
            let availability = [];
            for (let j = 0; j < 336; j += 1){
                availability.push(new TenterSlot(id, getDatePlusNumShifts(startDate, j), PHASE, TENTER_STATUS_CODES.AVAILABLE, j, i));
            }
            tenterSlotsGrid.push(availability);
        }
        
        scheduleAlgorithm(people, tenterSlotsGrid);
        people.sort((a, b) => a.dayScheduled < b.dayScheduled);
        let dayHours = [];
        let nightHours = [];
        let totalHours = [];
        for(let ind = 0;ind<people.length;ind++) {
            dayHours[ind] = people[ind].dayScheduled/2;//putting in hour units
            nightHours[ind] = people[ind].nightScheduled/2;
            totalHours[ind] = dayHours[ind]+nightHours[ind];
        }
        /*
        getAnalysisResults(people, (person) => person.dayScheduled);
        getAnalysisResults(people, (person) => person.nightScheduled);
        getAnalysisResults(people, (person) => person.dayScheduled+person.nightScheduled);
        */


        //input generator will create new empty TenterSlotsGrid, print out whatever is generated

        //???: tentType != PHASE when making new TenterSlot
        //???: what to do with the percent preferred...
        //???: currently ignoring numOfSlots argument
        //and no array of person is currently returned
        generateInput(12, startDate, 48, TENTING_COLORS.BLACK, .5, 0.4);
    })
})

/**
 * 
 * @param {Array<People>} people 
 * @param {(person : Person) => number} getHoursFromPerson
 */
function getAnalysisResults(people, getHoursFromPerson){
    let info = people.map((person) => getHoursFromPerson(person))
    let meanHours = 0;
    let minHours = info[0];
    let maxHours = info[0];
    let stdDevHours = 0;
    for (let ind = 0; ind < info.length; ind++) {
        meanHours += info[ind];
        minHours = Math.min(minHours, info[ind]);
        maxHours = Math.max(maxHours, info[ind]);
    }
    meanHours = meanHours/info.length;
    for(let ind = 0; ind<info.length; ind++){
        stdDevHours += Math.pow((info[ind]-meanHours),2);
    }
    stdDevHours /= info.length;
    stdDevHours = Math.sqrt(stdDevHours);
    console.log("Minimum hours: "+minHours+", Maximum hours: "+maxHours+", Average hours: "+meanHours.toFixed(2)+", Standard Deviation: "+stdDevHours.toFixed(2))
    return new Analysis(minHours, maxHours, meanHours.toFixed(2), stdDevHours.toFixed(2));
}


/**
 * @param {int} index //how many ppl we need info for, for tenterSlotsGrid[index][...]
 * @param {Date} dayOf 
 * @param {int} numOfSlots
 * @param {String} tentType
 * @param {double} pct_avail //how many slots should be assigned out of total
 * @param {double} pct_pref
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid is an array of arrays of Tenter slots
 *    For instance, tenterSlotsGrid[0] corresponds to slots for the person identified by people[0]. 
 *    There is a slot for EVERY TIME. The slot object says whether or not the person is available.
 */
function generateInput(index, dayOf, numOfSlots, tentType, pct_avail, pct_pref){
    let tenterSlotsGridTemp = new Array(index).fill(new Array(48).fill(""));
    //run loop for each person

    for(let i=1;i<index;i++){
        //for all 2-hour blocks of 30-min slots, run random decimal generator, if < pct_avail, then mark as filled
        let dAvail = 0;
        let nAvail = 0;
        let nightSet = "";
        let randgen = 0;
        let pid = "id_"+i;
        let pname = "name_"+i;
        //loop through every 4 indexes of time slots for day, just one separate generator for night
        for(let t=0;t<48;t+=4){//adjust to become numOfSlots?
            let rn = getDatePlusNumShifts(dayOf, t);

            if(rn.isNight){//if is night, block out 2-7 with the same flag
                if(nightSet.length==0){//hasn't been set yet
                    randgen = Math.random();
                    console.log("IT IS NIGHT");
                    nightSet = TENTER_STATUS_CODES.UNAVAILABLE;//default is no
                    if(randgen<pct_avail) nightSet = TENTER_STATUS_CODES.AVAILABLE;
                }
                tenterSlotsGridTemp[i][t] = new TenterSlot(pid, rn, tentType, nightSet, t, 0);
                if(nightSet==TENTER_STATUS_CODES.AVAILABLE) nAvail++;
            }
            //run random gen
            randgen = Math.random();
            let setTo = TENTER_STATUS_CODES.UNAVAILABLE;//default is no
            if(randgen<pct_avail) {
                setTo = TENTER_STATUS_CODES.AVAILABLE;
            }
            for(let t2=t;t2<t+4;t2++){
                tenterSlotsGridTemp[i][t2] = new TenterSlot(pid, rn, tentType, setTo, t2, 0);
                if(setTo==TENTER_STATUS_CODES.AVAILABLE) dAvail++;
            }
        }
        //create a new person to assign these to
        let new_person = new Person(pid, pname, dAvail, nAvail,0,0);//haven't been scheduled yet
        console.log(new_person);
        //return new_person;
    }
    return tenterSlotsGridTemp;
}