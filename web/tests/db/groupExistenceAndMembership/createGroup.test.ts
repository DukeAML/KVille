import { tryToCreateGroup } from "@/lib/db/groupExistenceAndMembership/createGroup";
import { CREATE_GROUP_ERROR_CODES } from "@/lib/controllers/groupMembershipAndExistence/createGroupController";
import { KTEST1_UID, KTEST_GROUP_NAME } from "../testUserCredentials";
import { fetchGroups } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { firestore } from "@/lib/db/firebase_config";
import { deleteGroup } from "@/lib/db/groupExistenceAndMembership/deleteGroup";
import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
describe("tryToCreateGroup", () => {
    it("should fail when group name is taken", async () => {
        await expect(tryToCreateGroup(KTEST_GROUP_NAME, TENTING_COLORS.WHITE, KTEST1_UID)).rejects.toThrow(CREATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN)
    });

    it("success case", async () => {
        let groupName = "JestCreateGroupTest";
        const groupCode = await tryToCreateGroup(groupName, TENTING_COLORS.WHITE, KTEST1_UID);
        const kTest1Groups = await fetchGroups(KTEST1_UID);
        let groupAddedToUser = kTest1Groups.filter((groupDescription) => (groupDescription.groupName === groupName));
        expect(groupAddedToUser.length).toBe(1);
        deleteGroup(groupCode);
    })
})