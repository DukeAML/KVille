import { tryToJoinGroup } from "./groupExistenceAndMembership/joinGroup.js";
import { KTEST1_UID, SMALLER_KTEST_GROUP_CODE, KTEST1_PWD, KTEST1_EMAIL } from "../../tests/db/testUserCredentials.js";
import { tryToLogin } from "./auth/login.js";
import { auth, firestore } from "./firebase_config.js";
import { signOut } from "firebase/auth";
import { tryToRegister } from "./auth/register.js";
import { tryToCreateGroup } from "./groupExistenceAndMembership/createGroup.js";
import { fetchGroups } from "./groupExistenceAndMembership/groupMembership.js";
import { deleteGroup } from "./groupExistenceAndMembership/deleteGroup.js";



const groupCode = await tryToCreateGroup("x", "White", KTEST1_UID);
//await tryToJoinGroup(groupCode, KTEST5_UID);

await deleteGroup(groupCode);
setTimeout(async () => {
    const k1Groups = await fetchGroups(KTEST1_UID);
}, 1000);


