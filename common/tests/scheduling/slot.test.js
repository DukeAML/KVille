import {Slot} from "../../src/scheduling/slots/slot";
import { TENTING_COLORS } from "../../data/phaseData";

describe("checkNight", () => {
    /**
     * 
     * @param {Date} date 
     * @param {boolean} expected 
     */
    const runNightTest = (date, expected) => {
        const slot = new Slot(date, TENTING_COLORS.BLACK);
        expect(slot.checkNight()).toBe(expected);
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
        runGraceTest(new Date(2023, 0, 17, 16, 0), true);
    })

    it("checks grace correctly at end of grace period", () => {
        runGraceTest(new Date(2023, 0, 17, 18, 0), false);
    })
});

describe("calculatePeopleNeeded", () => {
    it("works for black day", () => {
        const slot = new Slot(new Date(2023, 1, 1, 12, 0), TENTING_COLORS.BLACK);
        expect(slot.calculatePeopleNeeded()).toBe(2);
    });

    it("works for black night", () => {
        const slot = new Slot(new Date(2023, 1, 1, 4, 0), TENTING_COLORS.BLACK);
        expect(slot.calculatePeopleNeeded()).toBe(10);
    });

    it("works for blue day", () => {
        const slot = new Slot(new Date(2023, 1, 1, 12, 0), TENTING_COLORS.BLUE);
        expect(slot.calculatePeopleNeeded()).toBe(2);
    });

    it("works for blue night", () => {
        const slot = new Slot(new Date(2023, 1, 1, 4, 0), TENTING_COLORS.BLUE);
        expect(slot.calculatePeopleNeeded()).toBe(6);
    });

    it("works for white day", () => {
        const slot = new Slot(new Date(2023, 1, 1, 12, 0), TENTING_COLORS.WHITE);
        expect(slot.calculatePeopleNeeded()).toBe(1);
    });

    it("works for white night", () => {
        const slot = new Slot(new Date(2023, 1, 1, 4, 0), TENTING_COLORS.WHITE);
        expect(slot.calculatePeopleNeeded()).toBe(2);
    });
})