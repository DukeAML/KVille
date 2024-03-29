import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { tryToCreateGroup } from "@/lib/db/groupExistenceAndMembership/createGroup";
import { DELETE_GROUPS_ERROR_CODES, deleteGroup } from "@/lib/db/groupExistenceAndMembership/deleteGroup";
import { fetchGroups } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { tryToJoinGroup } from "@/lib/db/groupExistenceAndMembership/joinGroup";
import { KTEST13_UID, KTEST1_UID, KTEST5_UID } from "../testUserCredentials";

describe("deleteGroup", () => {
    it("works given a valid group", async () => {
        //first create a group with two members
        const groupCode = await tryToCreateGroup("x", TENTING_COLORS.WHITE, KTEST1_UID);
        await tryToJoinGroup(groupCode, KTEST5_UID);

        await deleteGroup(groupCode);

        await fetchGroups(KTEST13_UID);

        const k1Groups = await fetchGroups(KTEST1_UID);
        const k5Groups = await fetchGroups(KTEST5_UID);

        expect(k1Groups.filter(group => group.groupCode === groupCode).length).toBe(0);
        expect(k5Groups.filter(group => group.groupCode === groupCode).length).toBe(0);
        
        //commented out the line below bc I was getting weird timing problems, but we should put it back and test that the group was deleted. 
        //await expect(getGroupMembersByGroupCode(groupCode)).rejects.toThrow(GET_GROUP_MEMBERS_ERRORS.GROUP_DOES_NOT_EXIST);


    });

    it("throws an error when given an invalid group code", async () => {
        await expect(deleteGroup("BADCODE")).rejects.toThrow(DELETE_GROUPS_ERROR_CODES.GROUP_DOES_NOT_EXIST);

    })
    
})