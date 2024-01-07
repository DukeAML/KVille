import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { createGroupSchedule } from "@/lib/schedulingAlgo/externalInterface/CreateGroupSchedule";
import {KTEST_GROUP_CODE} from "../db/testUserCredentials";
describe("createGroupSchedule", () => {

    it("works in basic end to end case", async () => {
        let schedule = await createGroupSchedule(KTEST_GROUP_CODE, TENTING_COLORS.BLACK, new Date(2023, 0, 20, 0, 0), new Date(2023, 0, 21, 0, 0));
        expect(schedule.length).toBe(48);
        expect(schedule[0].split(" ").length).toBe(2);
    })
})