import { firestore, auth } from "../firebase_config";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getErrorMessage } from '../errorHandling';
import { EMAIL_SUFFIX, REGISTER_ERROR_CODES } from "@/lib/controllers/auth/registerController";

export async function tryToRegister(username : string, password : string) : Promise<string> {
    let email = username + EMAIL_SUFFIX;
    let DEFAULT_USER_ID = '';
    let newUserID = DEFAULT_USER_ID;

    try {
        await firestore.runTransaction(async (transaction) => { //TODO: make sure both operations either succeed or fail, this is insufficient currently
            const usernameIsTaken = await checkUsernameIsTaken(username).catch((error) => {
                throw new Error(REGISTER_ERROR_CODES.USERNAME_TAKEN);
            });
            if (usernameIsTaken) {
                throw new Error(REGISTER_ERROR_CODES.USERNAME_TAKEN)
            }
            const {user : newUser} = await createUserWithEmailAndPassword(auth, email, password).catch((error) => {
                throw new Error(REGISTER_ERROR_CODES.USERNAME_TAKEN);
            });
            newUserID = newUser.uid;
            const newUserDocRef = firestore.collection('users').doc(newUserID);
            const newUserData = {
                email : email,
                username : username
            }
            transaction.set(newUserDocRef, newUserData);
        })
    } catch (error ) {
        
        let errMsg = getErrorMessage(error);
        if (errMsg === REGISTER_ERROR_CODES.USERNAME_TAKEN){
            errMsg = REGISTER_ERROR_CODES.USERNAME_TAKEN;
        } else{
            errMsg = REGISTER_ERROR_CODES.DEFAULT;
        }
        throw new Error(errMsg);
    } 
    if (newUserID != DEFAULT_USER_ID){
        return newUserID;
    } else {
        throw new Error(REGISTER_ERROR_CODES.DEFAULT);
    }

}

async function checkUsernameIsTaken(username : string) : Promise<boolean> {
    const usernameQuerySnapshot = await firestore.collection('users').where('username', '==', username).get();
    return !usernameQuerySnapshot.empty;
}


