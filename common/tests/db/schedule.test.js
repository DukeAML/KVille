import {fetchGroupSchedule, setGroupScheduleInDB, FETCH_SCHEDULE_ERROR_CODES, SET_SCHEDULE_ERROR_CODES} from "../../src/db/schedule/schedule";
import { KTEST_GROUP_CODE, SMALLER_KTEST_GROUP_CODE } from "./testUserCredentials.js";

describe("fetchGroupSchedule", () => {
    it("throws error when group code is invalid", async () => {
        await expect(fetchGroupSchedule("qowrieuoiqweuroipqweur")).rejects.toThrow(FETCH_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    });

    it("works in success case", async () => {
        fetchGroupSchedule(KTEST_GROUP_CODE)
            .then((groupData) => {
                expect(groupData.schedule.length).toBeGreaterThan(0);
            })
            .catch((error) => {
                expect(true).toBe(false);
            })
    });
});

describe("setGroupScheduleInDB", () => {
    it("throws error when groupCode is invalid", async () => {
        await expect(setGroupScheduleInDB("qewurpqwueroiqweuiro", [])).rejects.toThrow(SET_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);

    });

    it("succeeds given good arguments", async () => {
        const oldSchedule = await fetchGroupSchedule(SMALLER_KTEST_GROUP_CODE);
        const newSchedule = {...oldSchedule};
        newSchedule.schedule[0] = "TEST";

        await setGroupScheduleInDB(SMALLER_KTEST_GROUP_CODE, newSchedule.schedule);
        const updatedSchedule = await fetchGroupSchedule(SMALLER_KTEST_GROUP_CODE);
        expect(updatedSchedule.startDate.getTime()).toEqual(oldSchedule.startDate.getTime());
        expect(updatedSchedule.schedule[0] === newSchedule.schedule[0]).toBe(true);
        setGroupScheduleInDB(SMALLER_KTEST_GROUP_CODE, oldSchedule.schedule); //rolling back our changes

    })

})