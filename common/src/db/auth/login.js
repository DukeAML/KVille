import { auth } from "../firebase_config.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import * as Yup from 'yup';

export const LOGIN_ERROR_CODES = {
  	FAILURE : "Incorrect email/password"
}

/**
 * @param {String} password
 * @param {String} email
 * @returns {Promise<string>} userID
 */
export async function tryToLogin(email, password){
    let signedInID = undefined;
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


export const loginValidationSchema = Yup.object({
	email: Yup.string().email('Invalid email address').required('Required'),
	password: Yup.string().required('Required'),
});