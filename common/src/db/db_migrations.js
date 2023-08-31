/*
const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/firestore');
const scheduleDates = require("./data/scheduleDates.json");
const GROUP_CODE = 'xgVV5gyv';
const  Helpers = require("./Scheduling/helpers");

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

  
const app = firebase.initializeApp(firebaseConfig);

*/

import { firestore } from "./firebase_config.js";

firestore.collection('users').get().then((docs) => {
  docs.forEach((doc) => {

    const oldData = doc.data();
    const newData = {
      email : oldData.email,
      username : oldData.username,
      groups : oldData.groupCode
    }
    doc.ref.set(newData);
    

    
    
  })
})