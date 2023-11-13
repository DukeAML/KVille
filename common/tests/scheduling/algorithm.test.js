import { scheduleAlgorithm} from "../../src/scheduling/algorithm";
import { Person } from "../../src/scheduling/person";
import { TenterSlot, TENTER_STATUS_CODES, EMPTY } from "../../src/scheduling/slots/tenterSlot";

import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils";
import { TENTING_COLORS} from "../../data/phaseData";
import { scheduleDates } from "../../data/scheduleDates";
describe("schedule", () => {
    it("fills out schedule in basic case", () => {
        const p1 = new Person("p1", "p1", 38, 10, 0, 0);
        const p2 = new Person("p2", "p2", 38, 10, 0, 0);
        let people = [p1, p2];
        let startDate = scheduleDates.startOfBlack;
        let PHASE = TENTING_COLORS.BLUE;
        const tenterSlotsGrid = [[], []];
        for (let i = 0; i < 4; i+=1){
            tenterSlotsGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 0);
            tenterSlotsGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 1);
        }

        const schedule = scheduleAlgorithm(people, tenterSlotsGrid);
        for (let i = 0; i < schedule.length; i+=1){
            expect(schedule[i].ids.length).toBe(schedule[i].calculatePeopleNeeded());
            expect(schedule[i].ids.includes(EMPTY)).toBe(false);
        }
    });
    

    it("does not assign slots to people who are unavailable", () => {
        const p1 = new Person("p1", "p1", 0, 0, 0, 0);  
        const p2 = new Person("p2", "p2", 0, 0, 40, 0); 
        const PHASE = TENTING_COLORS.WHITE;
        let people = [p1, p2];
        let startDate = scheduleDates.startOfBlack;
        const tenterSlotsGrid = [[], []];
        for (let i = 0; i < 4; i+=1){
            tenterSlotsGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.UNAVAILABLE, i, 0);
            tenterSlotsGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.UNAVAILABLE, i, 1);
        }

        const schedule = scheduleAlgorithm(people, tenterSlotsGrid);
        for (let i = 0; i < schedule.length; i += 1){
            expect(schedule[i].ids.includes("p1")).toBe(false);
            expect(schedule[i].ids.includes("p2")).toBe(false);
            expect(schedule[i].ids.includes(EMPTY)).toBe(true);
        }
    })
    

    it("shows basic fairness", () => {
        const p1 = new Person("p1", "p1", 4, 0, 0, 0);  //p1 has not been scheduled for any slots yet
        const p2 = new Person("p2", "p2", 4, 0, 40, 0); //p2 has already been scheduled for 40 slots
        const PHASE = TENTING_COLORS.WHITE;
        let people = [p1, p2];
        let startDate = getDatePlusNumShifts(scheduleDates.endOfTenting, -10);
        const tenterSlotsGrid = [[], []];
        for (let i = 0; i < 4; i+=1){
            tenterSlotsGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 0);
            tenterSlotsGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 1);
        }

        const schedule = scheduleAlgorithm(people, tenterSlotsGrid);

        for (let i = 0; i < schedule.length; i += 1){
            expect(schedule[i].ids.includes("p1")).toBe(true);
            expect(schedule[i].ids.includes("p2")).toBe(false);
        }
    });

    it("shows more advanced fairness and assigns correct number of people at each time", () => {
        const people = [];
        const tenterSlotsGrid = [];
        const PHASE = TENTING_COLORS.WHITE;
        let startDate = getDatePlusNumShifts(scheduleDates.endOfTenting, -10);
        for (let i = 0; i < 12; i += 1){
            let id = "p" + i.toFixed(0);
            people.push(new Person(id, id, 266, 70, 0, 0 ));
            let availability = [];
            for (let j = 0; j < 336; j += 1){
                availability.push(new TenterSlot(id, getDatePlusNumShifts(startDate, j), PHASE, TENTER_STATUS_CODES.AVAILABLE, j, i));
            }
            tenterSlotsGrid.push(availability);
        }

        let schedule = scheduleAlgorithm(people, tenterSlotsGrid);
        people.sort((a, b) => a.dayScheduled < b.dayScheduled);
        const dayHoursMinMaxDiffRatio = (people[11].dayScheduled - people[0].dayScheduled) / people[11].dayScheduled;
        expect(dayHoursMinMaxDiffRatio < 0.5).toBe(true);
        for (let i = 0; i < schedule.length; i+=1){
            expect(schedule[i].ids.length).toBe(schedule[i].calculatePeopleNeeded());
        }


    })

})