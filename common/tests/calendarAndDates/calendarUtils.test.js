
const {getCalendarColumnTitles} = require("../../src/calendarAndDates/calendarUtils.js");
const Monday = new Date(2023, 7, 21, 0, 0);
const Wednesday = new Date(2023, 7, 23, 0, 0);
describe('getCalendarColumnTitles', () => {
    it('getCalendarColumnTitles With 1 Day', () => {
        const result = getCalendarColumnTitles(Monday, Monday);
        expect(result).toEqual(["Mon. 8/21"]);
    });

    it ('getColumnTitlesMultDays', () => {
        const result = getCalendarColumnTitles(Monday, Wednesday);
        expect(result.length).toEqual(3);
    })
})
