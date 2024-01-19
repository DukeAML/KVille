import { firestore, auth } from "../../../lib/db/firebase_config";
import { deleteLoggedInUser } from "../../../lib/db/auth/deleteUser";
import { tryToRegister } from "../../../lib/db/auth/register";
import { REGISTER_ERROR_CODES } from "@/lib/controllers/auth/registerController";
import { KTEST1_USERNAME } from "../testUserCredentials";

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