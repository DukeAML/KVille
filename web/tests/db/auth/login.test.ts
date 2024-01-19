import { LOGIN_ERROR_CODES, tryToLogin } from "@/lib/controllers/auth/loginControllers";

import { auth } from "../../../lib/db/firebase_config";
import { signOut } from "firebase/auth";
import { KTEST1_UID } from "../testUserCredentials";

describe("tryToLogin", () => {
    beforeAll(async () => await signOut(auth));

    it("fails when given bad email prefix", async () => {
        await expect(tryToLogin("weroiuqw poerui", "a")).rejects.toThrow(LOGIN_ERROR_CODES.FAILURE);
    });

    it("logs me in given right username and password", async () => {
        const id = await tryToLogin("kTest1", "kTest1");
        expect(id).toEqual(KTEST1_UID);

    })
})