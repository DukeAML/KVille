import { firestore, auth } from "../firebase_config";
import { deleteUser } from "firebase/auth";

/**
 * Currently this is just used to clean up the register test, so it does not remove them from groups!
 * 
 */
export async function deleteLoggedInUser() {
    //TODO: ensure that either both operations go through, or neither
    if (auth && auth.currentUser){
        const id = auth.currentUser.uid;
        deleteUser(auth.currentUser);
        firestore.collection("users").doc(id).delete();
    }



}