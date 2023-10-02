import { scheduleAlgorithm} from "../../src/scheduling/algorithm.js";
import { Person } from "../../src/scheduling/person.js";
import { TenterSlot, TENTER_STATUS_CODES } from "../../src/scheduling/slots/tenterSlot.js";

import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils.js";
import { TENTING_COLORS} from "../../data/phaseData.js";
import { Analysis } from "./analysis.js";
import { ScheduledSlot } from "../../src/scheduling/slots/scheduledSlot.js";
describe("result tests", () => {
    it("", () => {
        const people = [];
        const tenterSlotsGrid = [];
        const PHASE = TENTING_COLORS.WHITE;
        let startDate = new Date(2023, 0, 17, 0, 0);
        let wanted = [];
        for (let i = 0; i < 12; i += 1){
            let id = "p" + i.toFixed(0);
            people.push(new Person(id, id, 266, 70, 0, 0 ));
            let availability = [];
            for (let j = 0; j < 336; j += 1){
                if(i%2==0) availability.push(new TenterSlot(id, getDatePlusNumShifts(startDate, j), PHASE, TENTER_STATUS_CODES.PREFERRED, j, i));
                else availability.push(new TenterSlot(id, getDatePlusNumShifts(startDate, j), PHASE, TENTER_STATUS_CODES.AVAILABLE, j, i));
            }
            tenterSlotsGrid.push(availability);
            //each loop is a person's info, save availability to reference person's original status
            wanted.push(availability);
            
        }
        
        const finalSchedule = scheduleAlgorithm(people, tenterSlotsGrid); 
        people.sort((a, b) => a.dayScheduled < b.dayScheduled);
        //compare expected(the array<tenterSlot> wanted) with assigned(in tenterSlotsGrid)
        for(let i=0; i<wanted.length; i++){
            getSatisfaction(finalSchedule, wanted[i]);
            //
        }
        //getAnalysisResults(people, (person) => person.dayScheduled);//example
    })
})

/**
 * @param {Array<ScheduledSlot>} finalSchedule2// is this the right type? final schedule
 * @param {Array<TenterSlot>} pref//person's original preferred schedule(an object variable)
 */
function getSatisfaction(finalSchedule2, pref){
    let numassigned = 0;//how many timeslots person is assigned
    let numpref = 0;//how many timeslots the person wanted
    let numboth = 0;//how many timeslots were wanted and assigned
    //iterate through scheduled slots in final schedule, check to see if pref's name is in the ids at the corresponding time
    for(let tmslot = 0; tmslot<finalSchedule2.length; tmslot++){
        //check if person's name is in the scheduledSlot.ids(checking they are assigned)
        let personRN = pref[tmslot].personID;
        if(finalSchedule2[tmslot].ids.includes(personRN)){
            numassigned++;
            //check if they wanted this timeslot
            if(pref[tmslot].ogStatus === TENTER_STATUS_CODES.PREFERRED){
                //wanted and got it
                numpref++;
                numboth++;
            }
        }
        else if(pref[tmslot].ogStatus === TENTER_STATUS_CODES.PREFERRED){
            //wanted but did not get
            numpref++;
        }
    }
    //percent for how many slots they were assigned out of total wanted
    let aoutw = ((numboth/(numpref+0.001))*100);
    //percent for how many slots they wanted out of total assigned
    let wouta = ((numboth/(numassigned+0.001))*100);
    console.log(aoutw.toFixed(2)+"% slots assigned out of total slots preferred");
    console.log(wouta.toFixed(2)+"% slots preferred out of total slots assigned");
    return;//void
}




