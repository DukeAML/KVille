import {LOGIN_ERROR_CODES, tryToLogin} from "../../../src/db/auth/login.js";

import { auth } from "../../../src/db/firebase_config.js";
import { signOut } from "firebase/auth";
import { KTEST1_UID } from "../testUserCredentials.js";

describe("tryToLogin", () => {
    beforeAll(async () => await signOut(auth));

    it("fails when given bad email", async () => {
        await expect(tryToLogin("qweroiuqwpoerui", "a")).rejects.toThrow(LOGIN_ERROR_CODES.FAILURE);
    });

    it("logs me in given right username and password", async () => {
        const id = await tryToLogin("kTest1@gmail.com", "kTest1");
        expect(id).toEqual(KTEST1_UID);

    })
})