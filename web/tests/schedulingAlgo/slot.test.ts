import {Slot} from "@/lib/schedulingAlgo/slots/slot";
import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { isGrace } from "@/lib/schedulingAlgo/rules/gracePeriods";
import { getGracePeriods2023 } from "@/lib/data/2023/gracePeriods";
import { getGracePeriods2024 } from "@/lib/data/2024/gracePeriods";
import { getScheduleDates, CURRENT_YEAR } from "@/lib/schedulingAlgo/rules/scheduleDates";
import { getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils";
import { isNight } from "@/lib/schedulingAlgo/rules/nightData";

let scheduleDates = getScheduleDates(CURRENT_YEAR);
describe("isNight", () => {
    /**
     * 
     * @param {Date} date 
     * @param {boolean} expected 
     */
    const runNightTest = (date : Date, expected : boolean) => {
        const slot = new Slot(date, TENTING_COLORS.BLACK);
        expect(isNight(date)).toBe(expected);
        expect(slot.isNight).toBe(expected);

    }

    it("checks night correctly during day 2023", () => {
        runNightTest(new Date(2023, 0, 15, 0, 0), false);
    });

    it("checks night correctly in middle of night 2023", () => {
        runNightTest(new Date(2023, 0, 15, 4, 0), true);
    })

    it("checks night correctly at 2am 2023", () => {
        runNightTest(new Date(2023, 0, 15, 2, 0), true);
    })

    it("checks night correctly at 7am 2023", () => {
        runNightTest(new Date(2023, 0, 15, 7, 0), false);
    });

    it("checks night correctly during day 2024", () => {
        runNightTest(new Date(2024, 0, 28, 0, 0), false);
    });

    it("checks night correctly in middle of night 2024", () => {
        runNightTest(new Date(2024, 0, 28, 4, 0), true);
    })

    it("checks night correctly at 1am Monday 2024", () => {
        runNightTest(new Date(2024, 0, 29, 1, 0), true);
    })

    it("checks night correctly at 2am Saturday 2024", () => {
        runNightTest(new Date(2024, 0, 27, 2, 0), false);
    })

    it("checks night correctly at 2am Sunday 2024", () => {
        runNightTest(new Date(2024, 0, 28, 2, 0), false);
    })

    it("checks night correctly at 2:30am Saturday 2024", () => {
        runNightTest(new Date(2024, 0, 27, 2, 30), true);
    })

    it("checks night correctly at 7am 2024", () => {
        runNightTest(new Date(2024, 0, 27, 7, 0), false);
    });
});

describe("checkGrace", () => {
    const runGraceTest = (date : Date, expected : boolean) => {
        const slot = new Slot(date, TENTING_COLORS.BLACK);
        expect(isGrace(date, false).isGrace).toBe(expected);
        expect(slot.isGrace).toBe(expected);
    }

    it("checks grace correctly at beginning of grace period 2023", () => {

        runGraceTest(getGracePeriods2023()[0].startDate, true);
    })

    it("checks grace correctly at end of grace period 2023", () => {
        runGraceTest(getGracePeriods2023()[1].endDate, false);
    })

    it("checks grace correctly at beginning of grace period 2024", () => {

        runGraceTest(getGracePeriods2024()[1].startDate, true);
    })

    it("checks grace correctly at end of grace period 2024", () => {
        runGraceTest(getGracePeriods2024()[0].endDate, false);
    })
});

describe("calculatePeopleNeeded", () => {
    it("works for black day ", () => {
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
        expect(slot.calculatePeopleNeeded()).toBe(1);
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