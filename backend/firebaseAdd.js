import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export function createTestCases() {
  function availability() {
    let arr = new Array();
    let num = 0;
    for (let i = 0; i < 336; i++) {
      num = Math.floor(Math.random() * 2);
      arr.push(num == 0 ? false : true);
    }
    return arr;
  }
  console.log('added test case');

  firebase
    .firestore()
    //.collection("groupsTest")
    //.doc("BtycLIprkN3EmC9wmpaE")
    .collection("groups")
    .doc("0HkG3BO1")
    .collection("members")
    .doc("vkG82NF27fdtLpJPjKziWI4A4O43")
    //.add({ availability: availability(), name: "TrueAlways"});
    .update( {availability: availability()})
/*    for (let i = 0; i < 12; i++) {
     firebase
       .firestore()
       .collection("groupsTest")
       .doc("BtycLIprkN3EmC9wmpaE")
       .collection("members")
       .add({ availability: availability(), name: "poop" + i, scheduledHrs: 0});
   } */
}
