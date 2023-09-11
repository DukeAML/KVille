import { Algorithm } from "../../src/Scheduling/algorithm";
import { Person } from "../../src/Scheduling/person";
import { TenterSlot, TENTER_STATUS_CODES, EMPTY } from "../../src/scheduling/tenterSlot";
import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils";
import { TENTING_COLORS} from "../../data/phaseData";
describe("schedule", () => {
    it("fills out schedule in basic case", () => {
        const p1 = new Person("p1", "p1", 38, 10, 0, 0);
        const p2 = new Person("p2", "p2", 38, 10, 0, 0);
        let people = [p1, p2];
        let startDate = new Date(2023, 0, 15, 0, 0);
        let PHASE = TENTING_COLORS.BLUE;
        const scheduleGrid = [[], []];
        for (let i = 0; i < 48; i+=1){
            scheduleGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 0);
            scheduleGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 1);
        };

        const schedule = Algorithm.schedule(people, scheduleGrid);
        for (let i = 0; i < schedule.length; i+=1){
            expect(schedule[i].ids.length).toBe(schedule[i].calculatePeopleNeeded());
        }
    });

    it("does not assign slots to people who are unavailable", () => {
        const p1 = new Person("p1", "p1", 0, 0, 0, 0);  
        const p2 = new Person("p2", "p2", 0, 0, 40, 0); 
        const PHASE = TENTING_COLORS.WHITE;
        let people = [p1, p2];
        let startDate = new Date(2023, 0, 16, 12, 0);
        const scheduleGrid = [[], []];
        for (let i = 0; i < 4; i+=1){
            scheduleGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.UNAVAILABLE, i, 0);
            scheduleGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.UNAVAILABLE, i, 1);
        }

        const schedule = Algorithm.schedule(people, scheduleGrid);
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
        let startDate = new Date(2023, 0, 16, 12, 0);
        const scheduleGrid = [[], []];
        for (let i = 0; i < 4; i+=1){
            scheduleGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 0);
            scheduleGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 1);
        }

        const schedule = Algorithm.schedule(people, scheduleGrid);
        for (let i = 0; i < schedule.length; i += 1){
            expect(schedule[i].ids.includes("p1")).toBe(true);
            expect(schedule[i].ids.includes("p2")).toBe(false);
        }
    });

    it("shows more advanced fairness", () => {
        const people = [];
        const scheduleGrid = [];
        const PHASE = TENTING_COLORS.WHITE;
        let startDate = new Date(2023, 0, 17, 0, 0);
        for (let i = 0; i < 12; i += 1){
            let id = "p" + i.toFixed(0);
            people.push(new Person(id, id, 266, 70, 0, 0 ));
            let availability = [];
            for (let j = 0; j < 336; j += 1){
                availability.push(new TenterSlot(id, getDatePlusNumShifts(startDate, j), TENTING_COLORS.WHITE, TENTER_STATUS_CODES.AVAILABLE, j, i));
            }
            scheduleGrid.push(availability);
        }

        const schedule = Algorithm.schedule(people, scheduleGrid);
        people.sort((a, b) => a.dayScheduled < b.dayScheduled);
        const dayHoursMinMaxDiffRatio = (people[11].dayScheduled - people[0].dayScheduled) / people[11].dayScheduled;
        expect(dayHoursMinMaxDiffRatio < 0.5).toBe(true);


    })
})