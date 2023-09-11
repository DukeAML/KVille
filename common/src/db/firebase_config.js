import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getAuth} from 'firebase/auth';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Wrap the Firebase initialization in a function
/**
 * 
 * @returns {firebase.app.App}
 */
const initializeFirebase = () => {
	console.log("api key 1 is " + process.env.API_KEY);
	const firebaseConfig = {
		apiKey: "AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0",
		authDomain: "duke-tenting-app-cc15b.firebaseapp.com",
		databaseURL: "https://duke-tenting-app-cc15b-default-rtdb.firebaseio.com",
		projectId: "duke-tenting-app-cc15b",
		storageBucket: "duke-tenting-app-cc15b.appspot.com",
		messagingSenderId: "391061238630",
		appId: "1:391061238630:web:85fbc00e4babf43cdc8ea7",
		measurementId: "G-6QNGDGFLHZ",
	};

	if (firebase.apps.length === 0) {
		console.log("API key 2 is " + firebaseConfig.apiKey);
		console.log("Trying to initialize Firebase");
		return firebase.initializeApp(firebaseConfig);
		// firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
	} else {
		return firebase.app;
	}
	return firebase.app;

	// Export other constants here...
};

// Call the function to initialize Firebase after environment variables are loaded
export const firebase_app = initializeFirebase();

// Export other constants here...
export const firestore = firebase.firestore();
export const auth = getAuth();

export const firebase_FieldValue = firebase.firestore.FieldValue;
export const EmailAuthProvider = firebase.auth.EmailAuthProvider;
