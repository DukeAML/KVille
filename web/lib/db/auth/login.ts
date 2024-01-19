import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase_config";
import { EMAIL_SUFFIX } from "@/lib/controllers/auth/registerController";
import { LOGIN_ERROR_CODES } from "@/lib/controllers/auth/loginControllers";



export async function tryToLogin(username: string, password: string): Promise<string> {
	let signedInID = undefined;
	let email = username + EMAIL_SUFFIX;
	const user = await signInWithEmailAndPassword(auth, email, password);
	const id = user?.user?.uid;
	if (id) {
		signedInID = id;
	} else {
		throw new Error(LOGIN_ERROR_CODES.FAILURE);
	}
	return signedInID;
}
