import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export function createTestCases() {
  function availability() {
    let arr = new Array();
    let num =1;
    for (let i = 0; i < 336; i++) {
      //num = Math.floor(Math.random() * 2);
      arr.push(num == 0 ? false : true);
    }
    return arr;
  }

  firebase
    .firestore()
    .collection("groupsTest")
    .doc("BtycLIprkN3EmC9wmpaE")
    .collection("members")
    .add({ availability: availability(), name: "TrueAlways"});
/*    for (let i = 0; i < 12; i++) {
     firebase
       .firestore()
       .collection("groupsTest")
       .doc("BtycLIprkN3EmC9wmpaE")
       .collection("members")
       .add({ availability: availability(), name: "poop" + i, scheduledHrs: 0});
   } */
}
