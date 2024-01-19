import { fetchGroups, getGroupMembersByGroupCode } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { removeMemberFromGroupByUsername, removeMemberFromGroupByID } from "@/lib/db/groupExistenceAndMembership/removeMemberFromGroup";
import { REMOVE_USER_ERRORS } from "@/lib/controllers/groupMembershipAndExistence/removeMemberController";
import { tryToJoinGroup } from "@/lib/db/groupExistenceAndMembership/joinGroup";
import { KTEST1_UID, KTEST1_USERNAME, KTEST5_UID, KTEST5_USERNAME, KTEST_GROUP_CODE, SMALLER_KTEST_GROUP_CODE } from "../testUserCredentials";

describe("removeMemberFromGroup", () => {
    it("throws error when user does not exist", async () => {
        await expect(removeMemberFromGroupByID("BADID", SMALLER_KTEST_GROUP_CODE)).rejects.toThrow(REMOVE_USER_ERRORS.USER_DOES_NOT_EXIST);
    });

    it("throws error when user is not in group", async () => {
        await expect(removeMemberFromGroupByUsername(KTEST5_USERNAME, SMALLER_KTEST_GROUP_CODE)).rejects.toThrow(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
        //await expect(removeMemberFromGroupByID(KTEST5_UID, SMALLER_KTEST_GROUP_CODE)).rejects.toThrow(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
    });

    it("successfully removes user", async () => {
        await removeMemberFromGroupByUsername(KTEST1_USERNAME, SMALLER_KTEST_GROUP_CODE);
        const newGroups = await fetchGroups(KTEST1_UID);
        expect(newGroups.filter(group => group.groupCode === SMALLER_KTEST_GROUP_CODE).length).toBe(0);
        const newMembers = await getGroupMembersByGroupCode(SMALLER_KTEST_GROUP_CODE);
        expect(newMembers.filter(member => member.userID === KTEST1_UID).length).toBe(0);
        tryToJoinGroup(SMALLER_KTEST_GROUP_CODE, KTEST1_UID); //clean up
    });

});