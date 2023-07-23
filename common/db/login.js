import { auth } from "./firebase_config";


/**
 * @param {String} password
 * @param {String} email
 * @param {(id:String)=>void} onSuccess 
 * @param {(error:any)=>void} onFailure
 * @returns 
 */
export function tryToLogin(email, password, onSuccess, onFailure=defaultLoginFailureHandler){
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        onSuccess(auth.currentUser.uid);

      })
      .catch((error) => {
        onFailure(error);
      });

}

const defaultLoginFailureHandler = (error) => {
    console.log(error);
    let message = 'Login unsuccessful';
    if (error.message.includes('The email address is badly formatted')) {
      message = 'Not a valid email';
    }
    if (error.message.includes('There is no user record')) {
      message = 'Account does not exist';
    }
    if (error.message.includes('The password is invalid')) {
      message = 'Incorrect password';
    }
    
    return;
  
}