import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { createGroupSchedule } from "@/lib/schedulingAlgo/externalInterface/createGroupSchedule";
import {KTEST_GROUP_CODE} from "../db/testUserCredentials";
import { ScheduleData } from "@/lib/controllers/scheduleData";
import { getCurrentDate } from "@/lib/calendarAndDatesUtils/datesUtils";
describe("createGroupSchedule", () => {

    it("works in basic end to end case", async () => {
        let schedule = await createGroupSchedule(KTEST_GROUP_CODE, TENTING_COLORS.BLACK, new Date(2023, 0, 20, 0, 0), new Date(2023, 0, 21, 0, 0), new ScheduleData([], getCurrentDate(), new  Map()));
        expect(schedule.length).toBe(48);
        expect(schedule[0].length).toBe(2);
    })
})