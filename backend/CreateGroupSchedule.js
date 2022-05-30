import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export function createGroupSchedule(groupCode, tentType) {
  let numDay;
  let numNight;
  switch (tentType) {
    case "black":
      numDay = 2;
      numNight = 10;
      break;
    case "blue":
      numDay = 1;
      numNight = 6;
    default:
      numDay = 1;
      numNight = 2;
  }

  let memberArr = new Array();
  let groupScheduleArr = new Array(336);

  //sorts member array by total hours in ascending order
  function sortMembers(idx) {
    memberArr.sort((a, b) => a.hours - b.hours);
    memberArr.sort(
      (a, b) => Number(b.availability[idx]) - Number(a.availability[idx])
    );
  }

  //input grace periods in groupScheduleArr, "GRACE" at each index

  //adds each member as an object to the memberArr
  firebase
    .firestore()
    .collection("groupsTest")
    .doc(groupCode)
    .collection("members")
    .get()
    .then((collSnap) => {
      collSnap.forEach((doc) => {
        //array of boolean values indicating availability
        let availability = doc.data().availability;
        let name = doc.data().name;
        let hours = 0;

        //member object
        let current = {
          name,
          hours, //normalized by the half hour
          availability,
        };
        console.log("Current member object", current);
        memberArr.push(current);
      });
      return collSnap;
    })
    .then((collSnap) => {
      //total of 336 half hours in a week
      for (let time = 0; time < 336; time++) {
        sortMembers(time);
        //night time
        if (time % 48 == 2) {
          for (let nightHour = 0; nightHour < 12; nightHour++) {
            for (let memberIdx = 0; memberIdx < numNight; memberIdx++) {
              if (memberIdx == 0 && memberArr[memberIdx].availability[time]) {
                groupScheduleArr[nightHour + time] =
                  memberArr[memberIdx].name + " ";
              } else if (memberArr[memberIdx].availability[time]) {
                groupScheduleArr[nightHour + time] +=
                  memberArr[memberIdx].name + " ";
                memberArr[memberIdx].hours++;
              } else {
                groupScheduleArr[nightHour + time] += "null ";
              }
            }
          }

          time += 12;
          continue;
        }
        //console.log("members array", memberArr);
        if (memberArr[0].availability[time]) {
          groupScheduleArr[time] = memberArr[0].name;
          memberArr[0].hours++;
        } else {
          groupScheduleArr[time] = "null";
        }
        if ((numDay = 2 && memberArr[1].availability[time])) {
          groupScheduleArr[time] += " " + memberArr[1].name;
          memberArr[1].hours++;
        } else if (!memberArr[1].availability[time]) {
          groupScheduleArr[time] += " " + "null";
        }
      }
      for (let i = 0; i < memberArr.length; i++) {
        console.log(memberArr[i].name, memberArr[i].hours);
      }
    });

  return groupScheduleArr;
}
