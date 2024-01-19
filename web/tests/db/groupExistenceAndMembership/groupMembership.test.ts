import { fetchGroups, getGroupMembersByGroupCode,  fetchGroupData } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { GET_GROUP_MEMBERS_ERRORS } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { KTEST1_UID, KTEST_GROUP_CODE } from "../testUserCredentials";

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



describe("getGroupMembersByGroupCode", () => {
    it("works", async () => {
        const members = await getGroupMembersByGroupCode(KTEST_GROUP_CODE);
        expect(members.length).toBe(12);
    });

    it ("throws error when group does not exist", async () => {
        await expect(getGroupMembersByGroupCode("BADCODE")).rejects.toThrow(GET_GROUP_MEMBERS_ERRORS.GROUP_DOES_NOT_EXIST);
 
    })
})
