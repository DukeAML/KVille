import { auth } from "./firebase_config";
import * as Yup from 'yup';


/**
 * @param {String} password
 * @param {String} email
 * @param {(id:String)=>void} onSuccess 
 * @param {(errorMessage:String)=>void} handleFailureMessageIfAny
 * @returns 
 */
export function tryToLogin(email, password, onSuccess, handleFailureMessageIfAny=defaultLoginFailureHandler){
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        onSuccess(auth.currentUser.uid);

      })
      .catch((error) => {
        handleFailureIfAny(error.message);
      });

}

const defaultLoginFailureHandler = (errorMessage) => {
    console.log(errorMessage);
    let message = 'Login unsuccessful';
    if (errorMessage.includes('The email address is badly formatted')) {
      message = 'Not a valid email';
    }
    if (errorMessage.includes('There is no user record')) {
      message = 'Account does not exist';
    }
    if (errorMessage.includes('The password is invalid')) {
      message = 'Incorrect password';
    }
    
    console.log(message);
    return;
  
}

export const loginValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().required('Required'),
});