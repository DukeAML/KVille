import {HOURS_ERROR_CODES, fetchHoursPerPerson, fetchHoursPerPersonInDateRange} from "../../src/db/hours.js";
import { getGroupMembersByGroupCode } from "../../src/db/groupExistenceAndMembership/groupMembership.js";
import {KTEST1_UID, KTEST_GROUP_CODE} from "./testUserCredentials.js";
describe("fetchHoursPerPersonInDateRange", () => {
    it("succeeds on normal case", async() => {
        fetchHoursPerPersonInDateRange(KTEST_GROUP_CODE, new Date(2023, 0, 15), new Date(2023, 0, 21))
            .then((data) => {
                expect(data.dayHoursPerPersonInRange[KTEST1_UID]).toBeGreaterThanOrEqual(0);
                expect(data.nightHoursPerPersonInRange[KTEST1_UID]).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                expect(true).toBe(false);;
            });
        
    })

    it("should throw error when given bad group code", async () => {
        fetchHoursPerPersonInDateRange("BADGROUPCODE", new Date(2023, 7, 21), new Date(2023, 7, 23))
            .then((data) => {
                
                expect(false).toBe(true);
            })
            .catch((error) => {
                expect(error.message).toEqual(HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST);
            })
    });
});

describe("fetchHoursPerPerson", () => {
    it("succeeds on normal case", async() => {
        fetchHoursPerPerson(KTEST_GROUP_CODE)
            .then((data) => {
                expect(data.dayHoursPerPerson[KTEST1_UID]).toBeGreaterThanOrEqual(0);
                expect(data.nightHoursPerPerson[KTEST1_UID]).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                expect(true).toBe(false);;
            });
        
    })

    it("should throw error when given bad group code", async () => {
        fetchHoursPerPerson("BADGROUPCODE")
            .then((data) => {
                expect(true).toBe(false);;
            })
            .catch((error) => {
                expect(error.message).toEqual(HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST);
            })
    });
});


