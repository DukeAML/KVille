import {fetchGroupSchedule, setGroupScheduleInDB} from "@/lib/db/schedule/schedule";
import { FETCH_SCHEDULE_ERROR_CODES, SET_SCHEDULE_ERROR_CODES } from "@/lib/controllers/scheduleController";
import { ScheduleData } from "@/lib/controllers/scheduleData";
import { KTEST_GROUP_CODE, SMALLER_KTEST_GROUP_CODE } from "./testUserCredentials";

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
        const newSched = new ScheduleData([], new Date(Date.now()), new Map());
        await expect(setGroupScheduleInDB("qewurpqwueroiqweuiro", newSched)).rejects.toThrow(SET_SCHEDULE_ERROR_CODES.GROUP_DOES_NOT_EXIST);

    });

    it("succeeds given good arguments", async () => {
        const oldSchedule = await fetchGroupSchedule(SMALLER_KTEST_GROUP_CODE);
        const {schedule, startDate, IDToNameMap} = {...oldSchedule};
        const newSchedule = new ScheduleData(schedule, startDate, IDToNameMap)
        let idToReplace = oldSchedule.getIDsAtTimeIndex(0)[0];
        newSchedule.swapTenterAtIndexByIDs(0, idToReplace, "TEST")

        await setGroupScheduleInDB(SMALLER_KTEST_GROUP_CODE, newSchedule);
        const updatedSchedule = await fetchGroupSchedule(SMALLER_KTEST_GROUP_CODE);
        expect(updatedSchedule.startDate.getTime()).toEqual(oldSchedule.startDate.getTime());
        for (let nameIndex = 0; nameIndex < updatedSchedule.getNamesAtTimeIndex(0).length; nameIndex += 1){
            expect(updatedSchedule.getNamesAtTimeIndex(0)[nameIndex] === newSchedule.getNamesAtTimeIndex(0)[nameIndex]).toBe(true);
        }
        
        newSchedule.swapTenterAtIndexByIDs(0, "TEST", idToReplace);
        setGroupScheduleInDB(SMALLER_KTEST_GROUP_CODE, newSchedule); //rolling back our changes

    })

})