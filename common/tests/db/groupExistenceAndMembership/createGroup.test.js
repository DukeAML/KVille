import { tryToCreateGroup, CREATE_GROUP_ERROR_CODES } from "../../../src/db/groupExistenceAndMembership/createGroup";
import { KTEST1_UID, KTEST_GROUP_NAME } from "../testUserCredentials";
import { GroupDescription, fetchGroups } from "../../../src/db/groupExistenceAndMembership/groupMembership";
import { firestore } from "../../../src/db/firebase_config";
import { deleteGroup } from "../../../src/db/groupExistenceAndMembership/deleteGroup";
import { TENTING_COLORS.WHITE } from "../../../data/phaseData";
describe("tryToCreateGroup", () => {
    it("should fail when group name is taken", async () => {
        await expect(tryToCreateGroup(KTEST_GROUP_NAME, TENTING_COLORS.WHITE, KTEST1_UID)).rejects.toThrow(CREATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN)
    });

    it("success case", async () => {
        let groupName = "JestCreateGroupTest";
        const groupCode = await tryToCreateGroup(groupName, TENTING_COLORS.WHITE, KTEST1_UID);
        const kTest1Groups = await fetchGroups(KTEST1_UID);
        let newGroup = await firestore.collection('groups').doc(groupCode).collection('members').doc(KTEST1_UID).get();
        let isCreator = newGroup.data().groupRole === "Creator";
        let groupAddedToUser = kTest1Groups.filter((groupDescription) => (groupDescription.groupName === groupName));
        expect(isCreator).toBe(true);
        expect(groupAddedToUser.length).toBe(1);
        deleteGroup(groupCode);
    })
})