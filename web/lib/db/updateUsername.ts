import { checkUsernameIsTaken } from "./auth/register";
import { firestore } from "./firebase_config";
import { REGISTER_ERROR_CODES } from "../controllers/auth/registerController";
import { getErrorMessage } from "./errorHandling";
export async function updateUsername (userID : string, newUsername : string) : Promise<string> {
    //check if there is already a group with this name!
    let usernameIsTaken = await checkUsernameIsTaken(newUsername);
    if (usernameIsTaken){
        throw new Error(REGISTER_ERROR_CODES.USERNAME_TAKEN);
    }
    try {
        let userRef = firestore.collection('users').doc(userID);
        await userRef.update({
            username: newUsername
        })
        return newUsername;
    } catch (error) {
        console.log(getErrorMessage(error));
        throw new Error("An error occurred");
    }
}