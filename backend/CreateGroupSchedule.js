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
      break;
    default:
      numDay = 1;
      numNight = 2;
  }

  let memberArr = new Array();
  let groupScheduleArr = new Array(336);
  let prevMember1 = null;
  let prevMember2 = null;
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
        let consecutive = 0;

        //member object
        let current = {
          name,
          hours, //normalized by the half hour
          availability,
          consecutive,
        };
        console.log("Current member object", current);
        memberArr.push(current);
      });
      return collSnap;
    })
    .then((collSnap) => {
      console.log("tent type", tentType, numDay, numNight);
      //total of 336 half hours in a week
      for (let time = 0; time < 336; time++) {
        //night time
        if (time % 48 == 2) {
          sortMembers(time);
          for (let nightHour = 0; nightHour < 12; nightHour++) {
            for (let memberIdx = 0; memberIdx < numNight; memberIdx++) {
              if (memberIdx == 0 && memberArr[0].availability[time]) {
                groupScheduleArr[nightHour + time] = memberArr[0].name + " ";
                memberArr[0].hours++;
              } else if (memberArr[memberIdx].availability[time]) {
                groupScheduleArr[nightHour + time] +=
                  memberArr[memberIdx].name + " ";
                memberArr[memberIdx].hours++;
              } else {
                groupScheduleArr[nightHour + time] += "null ";
              }
            }
          }

          time += 11;
          continue;
        }

        //deals with blocking

        if (prevMember1 && prevMember2) {
          //switches prev1 and prev2 if first person is not available and second person is for the new time so that only have to consider one case
          if (
            numDay == 2 &&
            !prevMember1.availability[time] &&
            prevMember2.availability[time]
          ) {
            let temp = prevMember1;
            prevMember1 = prevMember2;
            prevMember2 = temp;
          }

          if (prevMember1.availability[time] && prevMember1.consecutive < 8) {
            groupScheduleArr[time] = prevMember1.name + " ";
            prevMember1.hours++;
            prevMember1.consecutive++;
            if (numDay == 2) {
              if (prevMember2.availability[time]) {
                groupScheduleArr[time] += prevMember2.name + " ";
                prevMember2.hours++;
                prevMember2.consecutive++;
              } else {
                sortMembers(time);
                if (memberArr[0] == prevMember1) {
                  if (memberArr[1].availability[time]) {
                    groupScheduleArr[time] += memberArr[1].name + " ";
                    memberArr[1].hours++;
                    memberArr[1].consecutive++;
                  } else {
                    groupScheduleArr[time] += "null ";
                  }
                } else {
                  if (memberArr[0].availability[time]) {
                    groupScheduleArr[time] += memberArr[0].name + " ";
                    memberArr[0].hours++;
                    memberArr[0].consecutive++;
                  } else {
                    groupScheduleArr[time] += "null ";
                  }
                }
              }
            }
            continue;
          }
          prevMember1.consecutive = 0;
        }

        sortMembers(time);
        //console.log("members array", memberArr);
        if (memberArr[0].availability[time]) {
          groupScheduleArr[time] = memberArr[0].name;
          memberArr[0].hours++;
        } else {
          groupScheduleArr[time] = "null";
        }
        if (numDay == 2 && memberArr[1].availability[time]) {
          groupScheduleArr[time] += " " + memberArr[1].name;
          memberArr[1].hours++;
        } else if (!memberArr[1].availability[time]) {
          groupScheduleArr[time] += " " + "null";
        }
        prevMember1 = memberArr[0];
        prevMember2 = memberArr[1];
      }
      for (let i = 0; i < memberArr.length; i++) {
        console.log(memberArr[i].name, memberArr[i].hours);
      }
    });

  return groupScheduleArr;

  //sorts member array by total hours in ascending order
  function sortMembers(idx) {
    memberArr.sort((a, b) => a.hours - b.hours);
    memberArr.sort(
      (a, b) => Number(b.availability[idx]) - Number(a.availability[idx])
    );
  }
}
