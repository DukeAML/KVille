import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getAuth} from 'firebase/auth';
//import dotenv from 'dotenv';

//dotenv.config({ path: './.env' });

// Wrap the Firebase initialization in a function
/**
 * 
 * @returns {firebase.app.App}
 */
const initializeFirebase = () => {
	const firebaseConfig = {
		apiKey: process.env.apiKey,
		authDomain: process.env.authDomain,
		projectId: process.env.projectId,
		storageBucket: process.env.storageBucket,
		messagingSenderId: process.env.messagingSenderId,
		appId: process.env.appId
		//measurementId: process.env.NEXT_PUBLIC_measurementId
	};

	if (firebase.apps.length === 0) {
		return firebase.initializeApp(firebaseConfig);
		// firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
	} else {
		return firebase.app;
	}

};

// Call the function to initialize Firebase after environment variables are loaded
export const firebase_app = initializeFirebase();

// Export other constants here...
export const firestore = firebase.firestore();
export const auth = getAuth();

export const firebase_FieldValue = firebase.firestore.FieldValue;
export const EmailAuthProvider = firebase.auth.EmailAuthProvider;
