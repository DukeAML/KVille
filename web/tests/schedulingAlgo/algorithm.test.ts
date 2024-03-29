import { scheduleAlgorithm} from "../../lib/schedulingAlgo/algorithm";
import { Person } from "../../lib/schedulingAlgo/person";
import { TenterSlot, TENTER_STATUS_CODES, EMPTY } from "../../lib/schedulingAlgo/slots/tenterSlot";

import { getDatePlusNumShifts } from "../../lib/calendarAndDatesUtils/datesUtils";
import { TENTING_COLORS } from "../../lib/schedulingAlgo/rules/phaseData";
import { getScheduleDates, CURRENT_YEAR } from "../../lib/schedulingAlgo/rules/scheduleDates";
describe("schedule", () => {
    it("fills out schedule in basic case", () => {
        const p1 = new Person("p1", "p1", 38, 10, 0, 0);
        const p2 = new Person("p2", "p2", 38, 10, 0, 0);
        let people = [p1, p2];
        let startDate = getScheduleDates(CURRENT_YEAR).startOfBlack;
        let PHASE = TENTING_COLORS.BLUE;
        const tenterSlotsGrid : TenterSlot[][] = [[], []];
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
        let startDate = getScheduleDates(CURRENT_YEAR).startOfBlack;
        const tenterSlotsGrid : TenterSlot[][] = [[], []];
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
        let startDate = getDatePlusNumShifts(getScheduleDates(CURRENT_YEAR).endOfTenting, -10);
        const tenterSlotsGrid : TenterSlot[][] = [[], []];
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
        const people : Person[] = [];
        const tenterSlotsGrid = [];
        const TENT_TYPE = TENTING_COLORS.WHITE;
        let startDate = getDatePlusNumShifts(getScheduleDates(CURRENT_YEAR).startOfTenting, 0);
        for (let i = 0; i < 12; i += 1){
            let id = "p" + i.toFixed(0);
            people.push(new Person(id, id, 266, 70, 0, 0 ));
            let availability = [];
            for (let j = 0; j < 336; j += 1){
                availability.push(new TenterSlot(id, getDatePlusNumShifts(startDate, j), TENT_TYPE, TENTER_STATUS_CODES.AVAILABLE, j, i));
            }
            tenterSlotsGrid.push(availability);
        }

        let schedule = scheduleAlgorithm(people, tenterSlotsGrid);
        people.sort((a, b) => a.dayScheduled - b.dayScheduled);
        const dayHoursMinMaxDiffRatio = (people[11].dayScheduled - people[0].dayScheduled) / people[11].dayScheduled;
        expect(dayHoursMinMaxDiffRatio < 0.5).toBe(true);
        for (let i = 0; i < schedule.length; i+=1){
            if (schedule[i].isGrace){
                expect(schedule[i].ids.length).toBe(1);
            } else {
                expect(schedule[i].ids.length).toBe(schedule[i].calculatePeopleNeeded());
            }

        }


    })

})