import { updateName, CREATE_GROUP_ERROR_CODES } from "../../../src/db/groupExistenceAndMembership/updateGroup";
import { UPDATE_TEST_GROUP_CODE } from "../testUserCredentials";
import { fetchGroupData, fetchGroups } from "../../../src/db/groupExistenceAndMembership/groupMembership";
import { firestore } from "../../../src/db/firebase_config";
import { deleteGroup } from "../../../src/db/groupExistenceAndMembership/deleteGroup";
import { TENTING_COLORS } from "../../../data/phaseData";

describe("Try to update group", ()=>{
    it("New name successfully entered", async () => {
        let groupName = Math.random().toString(20).substring(2, 10);
        console.log(groupName);
        await updateName(groupName, UPDATE_TEST_GROUP_CODE);
        await fetchGroupData(UPDATE_TEST_GROUP_CODE).then((data) => {
            expect(data.groupName === groupName);
        })
    });
})