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
        getAnalysisResults(people, (person) => person.dayScheduled);
        getAnalysisResults(people, (person) => person.nightScheduled);
        getAnalysisResults(people, (person) => person.dayScheduled+person.nightScheduled);
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


