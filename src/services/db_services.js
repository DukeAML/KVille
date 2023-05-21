import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import ScheduleAndStartDate from "../backend/Scheduling/scheduleAndStartDate";

import { useQuery } from 'react-query';
import { getDateRoundedTo30MinSlot, getNumSlotsBetweenDates } from "./dates_services";
const Helpers = require("../backend/Scheduling/helpers");



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


function useSetSchedule(groupCode){



}

function useSetScheduleSlot(groupCode, date, newScheduleSlot){

}


export class DBAvailabilitySlot {

    /**
     * 
     * @param {Date} startDate 
     * @param {boolean} available 
     */
    constructor(startDate, available){
        this.startDate = startDate;
        this.available = available;
    }
}

/**
 * 
 * @param {String} groupCode 
 * @param {String} userId 
 * @returns {Array<DBAvailabilitySlot>}
 */
export async function fetchAvailability(groupCode, userId) {
    console.log("fetching availability");
    const db = firebase.firestore();
    const userRef = db.collection('groups').doc(groupCode).collection('members').doc(userId);
    const user = await userRef.get();

    let data = [];
    let availabilityDB = user.data().availability;
    console.log("availability length is " + availabilityDB.length);
    let startDate = getDateRoundedTo30MinSlot( user.data().availabilityStartDate.toDate());

    for (let i = 0; i < availabilityDB.length; i += 1){
        data.push(new DBAvailabilitySlot(new Date(startDate.getTime() + i * 30 * 60000), availabilityDB[i]));
    }
    return data;

}

/**
 * 
 * @param {String} groupCode 
 * @param {String} userId 
 * @returns 
 */
export const useGetAvailability = (groupCode, userId) => {
    return useQuery(
        ['availability', groupCode, userId],
        fetchAvailability(groupCode, userId)
    )
}

/**
 * 
 * @param {String} groupCode 
 * @param {String} userId
 * @param {Array<DBAvailabilitySlot>} newAvailability must be same length as the array in the db
 */
export const setDBAvailability = (groupCode, userId, newAvailability) => {
    console.log("setting availability in db");
    const db = firebase.firestore();
    let availabilityDB = [];
    for (let i = 0; i < newAvailability.length; i += 1){
        availabilityDB.push(newAvailability[i].available);
    }

    const userRef = db.collection('groups').doc(groupCode).collection('members').doc(userId);
    userRef.update({
        availability: availabilityDB
    });

}





/**
 * 
 * @param {String} groupCode 
 * @returns {{Array<String>, Date}} object containing the schedule as an array of strings, and the start Date of the schedule
 */
export async function fetchGroupSchedule(groupCode) {
    console.log("fetching schedule");
    const db = firebase.firestore();
    const groupRef = db.collection('groups').doc(groupCode);
    const group = await groupRef.get();

    //firebase dates are kinda weird, so we need to make sure it is formatted properly now
    let origDate = group.data().groupScheduleStartDate.toDate();
    let roundedDate = getDateRoundedTo30MinSlot(origDate);



    return {groupSchedule: group.data().groupSchedule, groupScheduleStartDate: roundedDate};
}

async function getNameOfAllTentersInGroup(groupCode){
    let membersRef = firebase.firestore().collection('groups').doc(groupCode).collection('members');
    let allMembers = [];
    await membersRef.get().then((members) => {
        members.forEach((member) => {
            allMembers.push(member.data().name);
        })
    });
    return allMembers;
}


/**
 * 
 * @param {String} groupCode 
 * @param {Date} dateRangeStart 
 * @param {Date} dateRangeEnd 
 * @returns 
 */
export async function fetchHoursPerPersonInDateRange(groupCode, dateRangeStart, dateRangeEnd) {
    let allMembers = await getNameOfAllTentersInGroup(groupCode);
    let groupRef = firebase.firestore().collection('groups').doc(groupCode);
    let dayHoursPerPersonInRange = {};
    let nightHoursPerPersonInRange = {};
    let dayHoursPerPersonEntire = {};
    let nightHoursPerPersonEntire = {};
    await groupRef.get().then((group) => {
      let prevSchedule = group.data().groupSchedule;
      let groupScheduleStartDate = group.data().groupScheduleStartDate.toDate();
      let scheduleAndDateObj = new ScheduleAndStartDate(prevSchedule, groupScheduleStartDate)
      let rangeResult = scheduleAndDateObj.getHoursPerPersonInDateRange(dateRangeStart, dateRangeEnd, allMembers);
      dayHoursPerPersonInRange = rangeResult.dayHoursPerPerson;
      nightHoursPerPersonInRange = rangeResult.nightHoursPerPerson;
  
      let fullResult = scheduleAndDateObj.getHoursPerPersonWholeSchedule(allMembers);
      dayHoursPerPersonEntire = fullResult.dayHoursPerPerson;
      nightHoursPerPersonEntire = fullResult.nightHoursPerPerson;
  
    }
    );

    return {dayHoursPerPersonInRange, nightHoursPerPersonInRange, dayHoursPerPersonEntire, nightHoursPerPersonEntire}
}

/**
 * 
 * @param {String} groupCode 
 * @returns two maps
 */
export async function fetchHoursPerPerson(groupCode){
    let allMembers = await getNameOfAllTentersInGroup(groupCode);
    let groupRef = firebase.firestore().collection('groups').doc(groupCode);
    let dayHoursPerPerson = {};
    let nightHoursPerPerson = {};
    await groupRef.get().then((group) => {
      let prevSchedule = group.data().groupSchedule;
      let groupScheduleStartDate = group.data().groupScheduleStartDate.toDate();
      let scheduleAndDateObj = new ScheduleAndStartDate(prevSchedule, groupScheduleStartDate)
  
      let fullResult = scheduleAndDateObj.getHoursPerPersonWholeSchedule(allMembers);
      dayHoursPerPerson = fullResult.dayHoursPerPerson;
      nightHoursPerPerson = fullResult.nightHoursPerPerson;
  
    }
    );

    return {dayHoursPerPerson, nightHoursPerPerson}

}

/**
 * 
 * @param {String} name 
 * @param {String} tentType 
 * @param {String} groupRole 
 * @returns 
 */
export function getDefaultGroupMemberData(name, tentType, groupRole) {
    let availabilityStartDate = Helpers.getTentingStartDate(tentType);
    let endDate = Helpers.getTentingEndDate();
    let numSlots = getNumSlotsBetweenDates(availabilityStartDate, endDate);
    let availability = new Array(numSlots).fill(false);
    let inTent = false;
    return {availability, availabilityStartDate, name, groupRole, inTent};
}



