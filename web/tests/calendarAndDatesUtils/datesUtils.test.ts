import { getDatePlusNumShifts, getDateRoundedTo30MinSlot, getDayAbbreviation, getNumDaysBetweenDates, getNumSlotsBetweenDates } from "../../lib/calendarAndDatesUtils/datesUtils";

let startOfMonday = new Date(2023, 7, 21, 0, 0);
describe('getNumSlotsBetweenDates', () => {
    it('sameDate', () => {
        const numSlots = getNumSlotsBetweenDates(startOfMonday, startOfMonday);
        expect(numSlots).toBe(0);
    });
    it('MonToTues48', () => {
        const startOfTuesday = new Date(2023, 7, 22, 0, 10);
        const numSlots = getNumSlotsBetweenDates(startOfMonday, startOfTuesday);
        expect(numSlots).toBe(48);
    })

})

describe('getDatePlusNumShifts', () => {
    it('plus10Shifts', () => {
        const result = getDatePlusNumShifts(startOfMonday, 10);
        expect(result.getHours()).toBe(5);
        expect(result.getMinutes()).toBe(0);
    })
})

describe('getNumDaysBetweenDates', () => {
    it('sameDate', () => {
        const result = getNumDaysBetweenDates(startOfMonday, startOfMonday);
        expect(result).toBe(1);
    });
    it ('MonToWed', () => {
        const result = getNumDaysBetweenDates(startOfMonday, new Date(2023, 7, 23, 12, 23));
        expect(result).toBe(3);
    })
})

describe('getDateRoundedTo30MinSlot', () => {
    it('alreadyRoundedDate', () => {
        const result = getDateRoundedTo30MinSlot(startOfMonday);
        expect(result.getDate()).toBe(21);
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
    });

    it ('nonRoundedDate', () => {
        const result = getDateRoundedTo30MinSlot(new Date(2023, 7, 21, 12, 37));
        expect(result.getMinutes()).toBe(30);
    })
})

describe('getDayAbbreviation', () => {
    it('Monday', () => {
        const result = getDayAbbreviation(startOfMonday);
        expect(result).toEqual("Mon. 8/21");
    })
})