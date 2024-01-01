import { firestore, auth } from "../../../src/db/firebase_config.js";
import { deleteLoggedInUser } from "../../../src/db/auth/deleteUser.js";
import { REGISTER_ERROR_CODES, tryToRegister } from "../../../src/db/auth/register.js";
import { KTEST1_USERNAME } from "../testUserCredentials.js";

describe("tryToRegister", () => {
    it("throws error if username is taken", async () => {
        await expect(tryToRegister(KTEST1_USERNAME, "qqweraspdfu")).rejects.toThrow(REGISTER_ERROR_CODES.USERNAME_TAKEN);
    });

    it("creates user in users collection upon success", async () => {
        const id = await tryToRegister( "kTest15", "kTest15");
        const userData = await firestore.collection('users').doc(id).get();
        expect(userData.data().groups.length).toBe(0);
        deleteLoggedInUser();
    });
});