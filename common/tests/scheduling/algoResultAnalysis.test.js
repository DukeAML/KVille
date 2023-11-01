import { scheduleAlgorithm} from "../../src/scheduling/algorithm.js";
import { Person } from "../../src/scheduling/person.js";
import { TenterSlot, TENTER_STATUS_CODES } from "../../src/scheduling/slots/tenterSlot.js";

import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils.js";
import { TENTING_COLORS} from "../../data/phaseData.js";
import { AlgoAnalysis, ScheduleHoursAnalysis } from "./algoResultAnalysis/analysis.js";
import { generateInput } from "./algoResultAnalysis/generateInputs.js";
import { scheduleDates } from "../../data/scheduleDates.js";
describe("result tests", () => {
    it("", () => {
        [TENTING_COLORS.BLACK].forEach((tentType) => {
            let {people, tenterSlotsGrid} = generateInput(scheduleDates.startOfTenting, 7, tentType, 0.5, 0.2);
            let beforeTime = Date.now();
            let scheduledSlots = scheduleAlgorithm(people, tenterSlotsGrid);
            console.log(scheduledSlots.length);
            let afterTime = Date.now();
            let runtimeMS = afterTime - beforeTime;
            let dayHoursAnalysis = getAnalysisResults(people, (person) => person.dayScheduled / 2);
            let nightHoursAnalysis = getAnalysisResults(people, (person) => person.nightScheduled / 2);
            let totalHoursAnalysis = getAnalysisResults(people, (person) => (person.dayScheduled + person.nightScheduled) / 2);
            let algoAnalysis = new AlgoAnalysis(dayHoursAnalysis, nightHoursAnalysis, totalHoursAnalysis, runtimeMS);
            console.log("analysis for algo with " + tentType + " tent type");
            algoAnalysis.printAnalysis();
        })
        
        

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
    return new ScheduleHoursAnalysis(minHours, maxHours, meanHours, stdDevHours);
}

