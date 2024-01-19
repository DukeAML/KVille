
import { fetchAvailability, setDBAvailability } from "@/lib/db/availability";
import { AVAILABILITY_ERROR_CODES } from "@/lib/controllers/availabilityController";
import { KTEST1_UID, KTEST_GROUP_CODE } from "./testUserCredentials";

describe("fetchAvailability", () => {
    it("success case", async () => {
        const avail = await fetchAvailability(KTEST_GROUP_CODE, KTEST1_UID);
        expect(avail.length).toBeGreaterThan(0);
    });

    it("userNotInGroupShouldThrowError", async () => {
        await expect(fetchAvailability(KTEST_GROUP_CODE, "BAD_ID")).rejects.toThrow(AVAILABILITY_ERROR_CODES.FETCH_ERROR);
    });

    it("badGroupThrowsError", async () => {
        await expect(fetchAvailability("BADGROUP", KTEST1_UID)).rejects.toThrow(AVAILABILITY_ERROR_CODES.FETCH_ERROR);
    })


});

describe("setDBAvilability", () => {
    it("success case", async () => {
        let orig = await fetchAvailability(KTEST_GROUP_CODE, KTEST1_UID);
        let newAvailability = [...orig];
        newAvailability[0].available = !(orig[0].available);
        await setDBAvailability(KTEST_GROUP_CODE, KTEST1_UID, newAvailability);
        let updated = await fetchAvailability(KTEST_GROUP_CODE, KTEST1_UID);
        expect(newAvailability.length).toBe(updated.length);
        expect(newAvailability[0].available).toBe(updated[0].available);
        expect(newAvailability[1].available).toBe(updated[1].available);
        expect(newAvailability[0].startDate.getTime()).toBe(updated[0].startDate.getTime());
    });

    it("user not in group", async () => {
        await expect(setDBAvailability(KTEST_GROUP_CODE, "BAD_ID", [])).rejects.toThrow(AVAILABILITY_ERROR_CODES.UPDATE_ERROR);
    });

    it("bad group code", async () => {
        await expect(setDBAvailability("BAD_GROUP_CODE", KTEST1_UID, [])).rejects.toThrow(AVAILABILITY_ERROR_CODES.UPDATE_ERROR);
    });

});