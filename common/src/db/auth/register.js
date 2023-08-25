import * as Yup from 'yup';
import { firestore, auth } from "../firebase_config.js";
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const REGISTER_ERROR_CODES = {
    USERNAME_TAKEN : "Username is taken",
    DEFAULT : "An error occurred"
}

/**
 * @param {String} email
 * @param {String} username
 * @param {String} password
 * @returns {Promise<string>} newUserID
 */
export async function tryToRegister(email, username, password){
    let DEFAULT_USER_ID = '';
    let newUserID = DEFAULT_USER_ID;
    try {
        await firestore.runTransaction(async (transaction) => { //TODO: make sure both operations either succeed or fail, this is insufficient currently
            
            const usernameIsTaken = await checkUsernameIsTaken(username).catch((error) => {
                throw new Error(REGISTER_ERROR_CODES.DEFAULT);
            });
            console.log("username is taken ? " + usernameIsTaken);
            if (usernameIsTaken) {
                throw new Error(REGISTER_ERROR_CODES.USERNAME_TAKEN)
            }
            const {user : newUser} = await createUserWithEmailAndPassword(auth, email, password).catch((error) => {
                throw new Error(REGISTER_ERROR_CODES.DEFAULT);
            });
            newUserID = newUser.uid;
            const newUserDocRef = firestore.collection('users').doc(newUserID);
            const newUserData = {
                email : email,
                username : username,
                groupCode : []
            }
            transaction.set(newUserDocRef, newUserData);
        })
    } catch (error) {
        console.log("error from transaction : " + error.message);
        let errorMessage = REGISTER_ERROR_CODES.DEFAULT;
        if (error.message === REGISTER_ERROR_CODES.USERNAME_TAKEN){
            errorMessage = REGISTER_ERROR_CODES.USERNAME_TAKEN;
        }
        throw new Error(errorMessage);
    } 
    if (newUserID != DEFAULT_USER_ID){
        return newUserID;
    }

}

/**
 * 
 * @param {String} username 
 * @returns {Promise<boolean>} usernameIsTaken
 */
async function checkUsernameIsTaken(username) {
    const usernameQuerySnapshot = await firestore.collection('users').where('username', '==', username).get();

    return !usernameQuerySnapshot.empty;

}

/**
 * 
 * @param {String} errorMessage 
 * @returns {void}
 */
const defaultRegisterFailureHandler = (errorMessage) => {
    console.log(error);
    let message = 'Register unsuccessful';
    if (errorMessage.includes('The email address is badly formatted')) {
      message = 'Not a valid email';
    }
    if (errorMessage.includes('There is no user record')) {
      message = 'Account does not exist';
    }
    if (errorMessage.includes('The password is invalid')) {
      message = 'Incorrect password';
    }
    
    return;
  
}

export const loginValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().required('Required'),
});