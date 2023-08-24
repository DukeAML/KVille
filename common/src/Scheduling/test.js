import { auth } from "../db/firebase_config.js";
import {tryToJoinGroup} from "../db/joinGroup.js";

await auth.signInWithEmailAndPassword("kTest12@gmail.com", "kTest12");
tryToJoinGroup("UGitK7RZ")
