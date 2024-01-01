import { auth } from "../firebase_config.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { EMAIL_SUFFIX } from "./register.js";


export const LOGIN_ERROR_CODES = {
	FAILURE : "Incorrect username/password"
}

export const INVALID_USER_ID = "";


/**
 * @param {String} password
 * @param {String} username
 * @returns {Promise<string>} userID
 */
export async function tryToLogin(username, password){
    let signedInID = undefined;
	let email = username + EMAIL_SUFFIX;
    await signInWithEmailAndPassword(auth, email, password)
		.then((user) => {
			const id = user?.user?.uid;
			if (id){
			signedInID = id;
			} else {
			throw new Error(LOGIN_ERROR_CODES.FAILURE);
			}

		})
		.catch((error) => {
			throw new Error(LOGIN_ERROR_CODES.FAILURE);
			
		});
    return signedInID;

}
