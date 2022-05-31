import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export function createGroupSchedule(groupCode, tentType) {
  let numDay;
  let numNight;


  //based on the current tentType, adjust # of people needed in tent for day and night hours
  //correspondingly
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

  //Initialize array of objects (memberArr), group schedule array, and previous members 
  //(members who had the last iteration of shifts)
  let memberArr = new Array();
  let groupScheduleArr = new Array(336);
  let prevMember1 = null;
  let prevMember2 = null;


  //****input grace periods in groupScheduleArr, "GRACE" at each index****



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
          availability, //array of 336 booleans
          consecutive, //# of 30min shifts done consecutively
        };
        //console.log("Current member object", current);
        memberArr.push(current); //add member to array
      });
      return collSnap;
    })
    .then((collSnap) => { //promise to make sure all members are added before trying to read them

      console.log("tent type", tentType, numDay, numNight);

      //** FOR LOOP TO CREATE GROUP SCHEDULE
      //total of 336 half hours in a week (48*7)
      for (let time = 0; time < 336; time++) {    //iterate each half hour index of group schedule


        //**FOR NIGHT TIME SHIFTS ONLY 
        //night time (starts at 1am-7am), so index 2 to 13
        if (time % 48 == 2) { //if night time, add the entire section as a block

          sortMembers(time); //sorts so lowest hours and available members go first

          //indexes for all 12 half hours of night shift (from index 2 to index 13)
          for (let nightHour = 0; nightHour < 12; nightHour++) { 
            
            //depending on how many are needed for each night (10 for 'black', 6 for 'blue', etc), index through each
            for (let memberIdx = 0; memberIdx < numNight; memberIdx++) {
              //if first member in sorted array and is available, set index of group array to that member
              if (memberIdx == 0 && memberArr[0].availability[time]) { 
                groupScheduleArr[nightHour + time] = memberArr[0].name + " ";
                memberArr[0].hours++;
              } else if (memberArr[memberIdx].availability[time]) { //for each next member, if available add to group schedule array
                groupScheduleArr[nightHour + time] +=
                  memberArr[memberIdx].name + " ";
                memberArr[memberIdx].hours++;
              } else { //otherwise, input null to that empty spot
                groupScheduleArr[nightHour + time] += "null ";
              }
            }
          }
          time += 11; //adjust index to move forward to 7am (index 14)
          continue;
        }

        //***ALL REMAINING CODE DEALS WITH DAYTIME SHIFTS ONLY***


        //deals with blocking so members have consecutive shifts of 30 min
        if (prevMember1 && prevMember2) { //if previous shifts were not 'null' continue
          //switches prev1 and prev2 if first person is not available and second person is for the new time so that only have to consider one case
          if (  //If black tent (numDay=2), and previous1 is not available but previous2 is, switch variables so rest of code works
            numDay == 2 &&
            !prevMember1.availability[time] &&
            prevMember2.availability[time]
          ) {
            let temp = prevMember1;
            prevMember1 = prevMember2;
            prevMember2 = temp;
          }

          //if the previous member had the last shift and has not reached a 4hr shift, add them to the current block
          if (prevMember1.availability[time] && prevMember1.consecutive < 8) {
            groupScheduleArr[time] = prevMember1.name + " ";
            prevMember1.hours++;
            prevMember1.consecutive++;
            if (numDay == 2) { //if it is a 'black' tent
              if (prevMember2.availability[time]) { //if previous2 is available, add them to this block as well
                groupScheduleArr[time] += prevMember2.name + " ";
                prevMember2.hours++;
                prevMember2.consecutive++;
              } else { //otherwise, sort array and add next member with least # of hours
                //reset counter for consecutive hours for second member b/c they will not their block
                prevMember2.consecutive = 0; 
                sortMembers(time);
                //if index 0 is equal to the 1st previous member (already added to the schedule for the current block)
                if (memberArr[0] == prevMember1) { 
                  if (memberArr[1].availability[time]) { //if index 1 is available add that instead
                    groupScheduleArr[time] += memberArr[1].name + " ";
                    memberArr[1].hours++;
                    memberArr[1].consecutive++;
                  } else { //otherwise no one is available and add null
                    groupScheduleArr[time] += "null ";
                  }
                } else { //If the first index does not equal the previous1 member
                  if (memberArr[0].availability[time]) { //then add the first index instead
                    groupScheduleArr[time] += memberArr[0].name + " ";
                    memberArr[0].hours++;
                    memberArr[0].consecutive++;
                  } else { //if not available, no one is available so add null
                    groupScheduleArr[time] += "null ";
                  }
                }
              }
            }
            continue; //continue to the next iteration of the large for loop
          }
          prevMember1.consecutive = 0; //reset counter for consecutive hours if no blocks are continued
        }

        sortMembers(time); //sort array by total hours and availability
        //console.log("members array", memberArr);
        if (memberArr[0].availability[time]) { //if first index is available, add to current block in group schedule
          groupScheduleArr[time] = memberArr[0].name;
          memberArr[0].hours++;
        } else { //otherwise, add null
          groupScheduleArr[time] = "null";
        }
        if (numDay == 2 && memberArr[1].availability[time]) { //if black tent, add next available person
          groupScheduleArr[time] += " " + memberArr[1].name;
          memberArr[1].hours++;
        } else if (!memberArr[1].availability[time]) {
          groupScheduleArr[time] += " " + "null";
        }
        prevMember1 = memberArr[0]; //set previous varibles to current block holders before iterating again
        prevMember2 = memberArr[1];
      }

      let equalHours;
      for (let i = 0; i < memberArr.length; i++) { //print hours to check for equal hours
        if (i==0) equalHours = memberArr[0].name + " " + memberArr[0].hours + " | ";
        else equalHours += memberArr[i].name + " " + memberArr[i].hours + " | ";
        //console.log(memberArr[i].name, memberArr[i].hours);
      }
      console.log(equalHours);
    });

  return groupScheduleArr; //return group schedule array

  //FINAL ARRAY TAKES THE FORMAT OF:

  //   ['member1 member2', 'member1 member2',  'member1 member2 member3 member4 member5 member6 member7 ...'] for black tent
  //   ['member1 ', 'member1 ',  'member1 member2 member3 member4 member5 member6 '] for blue tent, etc
  // index of array indicates the half hour block of the week 
      /* (ex.) Index 0 is sunday 12:00 - 12:30am
              Index 165 is Wednesday 10:30-11:am
                  Must do 165%48 = 3, so 4th day and 165%48 = 21 so 21st half hour (10:30am) */
  





  //Helper Methods

  //sorts member array by total hours in ascending order
  //then sorts by availibility, people who are availible go first
  function sortMembers(idx) {
    memberArr.sort((a, b) => a.hours - b.hours);
    memberArr.sort(
      (a, b) => Number(b.availability[idx]) - Number(a.availability[idx])
    );
  }
}
