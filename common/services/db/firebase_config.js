import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


//Hide this with environmental variables before publishing
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0',
    authDomain: 'duke-tenting-app-cc15b.firebaseapp.com',
    databaseURL: 'https://duke-tenting-app-cc15b-default-rtdb.firebaseio.com',
    projectId: 'duke-tenting-app-cc15b',
    storageBucket: 'duke-tenting-app-cc15b.appspot.com',
    messagingSenderId: '391061238630',
    appId: '1:391061238630:web:85fbc00e4babf43cdc8ea7',
    measurementId: 'G-6QNGDGFLHZ',
  };
  
  
  if (firebase.apps.length === 0) {
    console.log("trying to initialize fb");
    firebase.initializeApp(firebaseConfig);
  }

  export const firestore = firebase.firestore();
  export const auth = firebase.auth();
  export const firebase_FieldValue = firebase.firestore.FieldValue;
  export const EmailAuthProvider = firebase.auth.EmailAuthProvider;