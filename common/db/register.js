import * as Yup from 'yup';
import { firestore, auth } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from 'firebase/auth';


/**
 * @param {String} email
 * @param {String} username
 * @param {String} password
 * @param {(id:String)=>void} onSuccess 
 * @param {(errorMessage:String)=>void} handleFailureMessageIfAny
 * @returns 
 */
export async function tryToRegister(email, username, password, onSuccess, handleFailureMessageIfAny=defaultRegisterFailureHandler){
    let DEFAULT_USER_ID = '';
    let newUserID = DEFAULT_USER_ID;
    try {
        await firestore.runTransaction(async (transaction) => {
            
            const usernameQuerySnapshotIsEmpty = await checkUsernameAvailability(username).catch((error) => {
                throw new Error(error.message);
            });
            if (!usernameQuerySnapshotIsEmpty) {
                throw new Error('Username is taken');
            }
            const {user : newUser} = await createUserWithEmailAndPassword(auth, email, password).catch((error) => {
                throw new Error(error.message)
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
        handleFailureMessageIfAny(error.message);
    } 
    if (newUserID != DEFAULT_USER_ID){
        onSuccess(newUserID);
    }

}

/**
 * 
 * @param {String} username 
 * @returns {boolean}
 */
async function checkUsernameAvailability(username) {
    const usernameQuerySnapshot = await firestore.collection('users').where('username', '==', username).get();
    return usernameQuerySnapshot.empty;

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