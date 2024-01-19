import { KTEST1_UID, KTEST5_UID, KTEST13_UID, KTEST_GROUP_CODE, SMALLER_KTEST_GROUP_CODE } from "../testUserCredentials";
import { tryToJoinGroup } from "@/lib/db/groupExistenceAndMembership/joinGroup";
import { JOIN_GROUP_ERROR_CODES } from "@/lib/controllers/groupMembershipAndExistence/joinGroupController";
import { getGroupMembersByGroupCode } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { fetchGroups } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { removeMemberFromGroupByID } from "@/lib/db/groupExistenceAndMembership/removeMemberFromGroup";

describe("tryToJoinGroup", () => {
    it("succeeds in normal case", async () => {
        await tryToJoinGroup(SMALLER_KTEST_GROUP_CODE, KTEST5_UID);
        const newGroups = await fetchGroups(KTEST5_UID);
        const newGroupAddedToUser = newGroups.filter((group) => group.groupCode === SMALLER_KTEST_GROUP_CODE).length > 0;

        let groupMembers = await getGroupMembersByGroupCode(SMALLER_KTEST_GROUP_CODE);
        let groupMemberIDs = groupMembers.map((member) => member.userID);
        expect(groupMemberIDs.includes(KTEST5_UID)).toBe(true);
        expect(newGroupAddedToUser).toBe(true);
        removeMemberFromGroupByID(KTEST5_UID, SMALLER_KTEST_GROUP_CODE); //clean up

    });
    

    it("throws error when group does not exist", async () => {
        await expect(tryToJoinGroup("BADGROUPCODE", KTEST13_UID)).rejects.toThrow(JOIN_GROUP_ERROR_CODES.GROUP_DOES_NOT_EXIST);
    });

    it("throws error when you've already joined this group", async () => {
        await expect(tryToJoinGroup(SMALLER_KTEST_GROUP_CODE, KTEST1_UID)).rejects.toThrow(JOIN_GROUP_ERROR_CODES.ALREADY_IN );
    });

    it("throws error when group is full", async () => {
        await expect(tryToJoinGroup(KTEST_GROUP_CODE, KTEST13_UID)).rejects.toThrow(JOIN_GROUP_ERROR_CODES.GROUP_IS_FULL);
    })
})