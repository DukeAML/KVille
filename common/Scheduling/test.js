import { auth } from "../db/firebase_config";
import {tryToJoinGroup} from "../db/joinGroup";
auth.signInWithEmailAndPassword("kTest12@gmail.com", "kTest12");
tryToJoinGroup("UGitK7RZ");
