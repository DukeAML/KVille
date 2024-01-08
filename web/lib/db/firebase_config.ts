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
		apiKey: "AIzaSyDHG7w0mFtObImLCcJoZuaLrcbjZPISGJ0",
		authDomain: "shift-scheduler-prod-81457.firebaseapp.com",
		projectId: "shift-scheduler-prod-81457",
		storageBucket: "shift-scheduler-prod-81457.appspot.com",
		messagingSenderId: "447120219257",
		appId: "1:447120219257:web:9b7e768576507b4aa048a8",
		measurementId: "G-P03HY49GNB"
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
