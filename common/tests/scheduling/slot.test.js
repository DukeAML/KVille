import {Slot} from "../../src/scheduling/slots/slot";
import { TENTING_COLORS } from "../../data/phaseData";
import { graceData } from "../../data/gracePeriods";
import { scheduleDates } from "../../data/scheduleDates";
import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils";
import { isNight } from "../../data/nightData";

describe("isNight", () => {
    /**
     * 
     * @param {Date} date 
     * @param {boolean} expected 
     */
    const runNightTest = (date, expected) => {
        const slot = new Slot(date, TENTING_COLORS.BLACK);
        expect(isNight(date)).toBe(expected);
        expect(slot.isNight).toBe(expected);

    }

    it("checks night correctly during day", () => {
        runNightTest(new Date(2023, 0, 15, 0, 0), false);
    });

    it("checks night correctly in middle of night", () => {
        runNightTest(new Date(2023, 0, 15, 4, 0), true);
    })

    it("checks night correctly at 2am", () => {
        runNightTest(new Date(2023, 0, 15, 2, 0), true);
    })

    it("checks night correctly at 7am", () => {
        runNightTest(new Date(2023, 0, 15, 7, 0), false);
    });
});

describe("checkGrace", () => {
    const runGraceTest = (date, expected) => {
        const slot = new Slot(date, TENTING_COLORS.BLACK);
        expect(slot.checkGrace()).toBe(expected);
        expect(slot.isGrace).toBe(expected);
    }

    it("checks grace correctly at beginning of grace period", () => {

        runGraceTest(graceData.gracePeriods[0].startDate, true);
    })

    it("checks grace correctly at end of grace period", () => {
        runGraceTest(graceData.gracePeriods[0].endDate, false);
    })
});

describe("calculatePeopleNeeded", () => {
    it("works for black day", () => {
        const slot = new Slot(scheduleDates.startOfBlack, TENTING_COLORS.BLACK);
        expect(slot.calculatePeopleNeeded()).toBe(2);
    });

    it("works for black night", () => {
        let date = scheduleDates.startOfBlack;
        date = getDatePlusNumShifts(date, 48);
        date.setHours(3);
        const slot = new Slot(date, TENTING_COLORS.BLACK);
        expect(slot.calculatePeopleNeeded()).toBe(10);
    });

    it("works for blue day", () => {
        const slot = new Slot(scheduleDates.startOfBlue, TENTING_COLORS.BLUE);
        expect(slot.calculatePeopleNeeded()).toBe(2);
    });

    it("works for blue night", () => {
        let date = scheduleDates.startOfBlue;
        date = getDatePlusNumShifts(date, 48);
        date.setHours(3);
        const slot = new Slot(date, TENTING_COLORS.BLUE);
        expect(slot.calculatePeopleNeeded()).toBe(6);
    });

    it("works for white day", () => {

        const slot = new Slot(scheduleDates.startOfWhite, TENTING_COLORS.WHITE);
        expect(slot.calculatePeopleNeeded()).toBe(1);
    });

    it("works for white night", () => {
        let date = scheduleDates.startOfWhite;
        date = getDatePlusNumShifts(date, 48);
        date.setHours(3);
        const slot = new Slot(date, TENTING_COLORS.WHITE);
        expect(slot.calculatePeopleNeeded()).toBe(2);
    });
})