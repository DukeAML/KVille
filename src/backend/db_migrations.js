
const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/firestore');
const scheduleDates = require("../data/scheduleDates.json");
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



/**
 * Formats the date into a string like "2023-01-15-12-00"
 * @param {Date} date 
 */
const dateToId = (date) => {
    let year = date.getFullYear().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hour = date.getHours().toString().padStart(2, '0');
    let minute = date.getMinutes().toString().padStart(2, '0');
    let id = year + "-" + month + "-" + day + "-" + hour + "-" + minute;
    return id;
}


async function migrate_availability(groupCode){

    
    const db = firebase.firestore();
    const startDate = Helpers.getTentingStartDate("Black");
    const endDate = Helpers.getTentingEndDate();
    const numSlots = (endDate.getTime() - startDate.getTime()) / (30*60000);
    console.log(numSlots);
    var member_collection = db.collection('groups').doc(groupCode).collection('members');
    member_collection.get()
      .then((result) => {
        result.forEach((member) => {

          console.log("member " + member.id);
          var member_ref = member_collection.doc(member.id);
          const availability = member.data().availability;
          while (availability.length < numSlots){
            availability.push(false);
          }
          member_ref.update({availability: availability})
        })
      })
      .catch((error) => {
        console.error('Error getting documents:', error);
      });
  }

async function migrate_schedule(groupCode){
    const db = firebase.firestore();
    const startDate = Helpers.getTentingStartDate("Black");
    const endDate = Helpers.getTentingEndDate();
    const numSlots = (endDate.getTime() - startDate.getTime()) / (30*60000);
    var group_ref = db.collection('groups').doc(groupCode);
    group_ref.get()
    .then((result) => {
        const sched = result.data().groupSchedule;
        while(sched.length < numSlots){
          sched.push("empty");
          

        }
        group_ref.update({groupSchedule: sched})
        
    }).catch((error) => {
        console.log(error);
    })
}

async function addShiftsToTest(groupCode){
  const groupRef = firebase.firestore().collection('groups').doc(groupCode);
  let shifts = new Array(336).fill(true);
  for (let i = 30; i < 60; i += 1){
    shifts[i] = false;
  }
  await groupRef.collection('members').doc('hWMs9HK5qROXWdUaEmzyFjhBKVo1').update({shifts})
}


addShiftsToTest(GROUP_CODE);