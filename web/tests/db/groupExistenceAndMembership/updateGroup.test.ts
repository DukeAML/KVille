import { updateGroupName } from "@/lib/db/groupExistenceAndMembership/updateGroup";
import { UPDATE_TEST_GROUP_CODE } from "../testUserCredentials";
import { fetchGroupData } from "@/lib/db/groupExistenceAndMembership/groupMembership";

describe("Try to update group", ()=>{
    it("New name successfully entered", async () => {
        let groupName = Math.random().toString(20).substring(2, 10);
        await updateGroupName(groupName, UPDATE_TEST_GROUP_CODE);
        await fetchGroupData(UPDATE_TEST_GROUP_CODE).then((data) => {
            expect(data.groupName === groupName);
        })
    });
})