import { FETCH_GROUPS_ERRORS, fetchGroups, getGroupMembersByGroupCode, removeUserFromGroup, REMOVE_USER_ERRORS, GET_GROUP_MEMBERS_ERRORS, fetchGroupData } from "../../../src/db/groupExistenceAndMembership/groupMembership";
import { tryToJoinGroup } from "../../../src/db/groupExistenceAndMembership/joinGroup";
import { KTEST1_UID, KTEST5_UID, KTEST_GROUP_CODE, SMALLER_KTEST_GROUP_CODE } from "../testUserCredentials";

describe("fetchGroups", () => {
    it("success case", () => {
        fetchGroups(KTEST1_UID)
            .then((data) => {
                expect(data.length).toBeGreaterThanOrEqual(1);
            })
            .catch((error) => {
                expect(true).toBe(false);
            });
    } );
});

describe("fetchGroupData", () => {
    it("success case", () => {
        fetchGroupData(KTEST_GROUP_CODE)
            .then((data) => {
                expect(data.creator).toEqual(KTEST1_UID);
            })
            .catch((error) => {
                expect(true).toBe(false);
            });
    } );
});

describe("removeUserFromGroup", () => {
    it("throws error when user does not exist", async () => {
        await expect(removeUserFromGroup("BADID", SMALLER_KTEST_GROUP_CODE)).rejects.toThrow(REMOVE_USER_ERRORS.USER_DOES_NOT_EXIST);
    });

    it("throws error when user is not in group", async () => {
        await expect(removeUserFromGroup(KTEST5_UID, SMALLER_KTEST_GROUP_CODE)).rejects.toThrow(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
    });

    it("successfully removes user", async () => {
        await removeUserFromGroup(KTEST1_UID, SMALLER_KTEST_GROUP_CODE);
        const newGroups = await fetchGroups(KTEST1_UID);
        expect(newGroups.filter(group => group.groupCode === SMALLER_KTEST_GROUP_CODE).length).toBe(0);
        const newMembers = await getGroupMembersByGroupCode(SMALLER_KTEST_GROUP_CODE);
        expect(newMembers.filter(member => member.userID === KTEST1_UID).length).toBe(0);
        tryToJoinGroup(SMALLER_KTEST_GROUP_CODE, KTEST1_UID); //clean up
    })

});

describe("getGroupMembersByGroupCode", () => {
    it("works", async () => {
        const members = await getGroupMembersByGroupCode(KTEST_GROUP_CODE);
        expect(members.length).toBe(12);
    });

    it ("throws error when group does not exist", async () => {
        await expect(getGroupMembersByGroupCode("BADCODE")).rejects.toThrow(GET_GROUP_MEMBERS_ERRORS.GROUP_DOES_NOT_EXIST);
 
    })
})
