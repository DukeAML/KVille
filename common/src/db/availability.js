import { firestore } from "./firebase_config.js";

import { getDateRoundedTo30MinSlot} from "../calendarAndDates/datesUtils.js";

export const AVAILABILITY_ERROR_CODES = {
    FETCH_ERROR : "Error Fetching Availability",
    UPDATE_ERROR: "Error Setting Availability"
}

export class AvailabilitySlot {

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
 * @returns {Array<AvailabilitySlot>}
 */
export async function fetchAvailability(groupCode, userId) {
    console.log("fetching availability for group" + groupCode);
    const db = firestore;
    const userRef = db.collection('groups').doc(groupCode).collection('members').doc(userId);
    const user = await userRef.get();
    if (!user.exists){
        throw new Error(AVAILABILITY_ERROR_CODES.FETCH_ERROR);
    }

    let data = [];
    let availabilityDB = user.data().availability;
    let startDate = getDateRoundedTo30MinSlot( user.data().availabilityStartDate.toDate());

    for (let i = 0; i < availabilityDB.length; i += 1){
        data.push(new AvailabilitySlot(new Date(startDate.getTime() + i * 30 * 60000), availabilityDB[i]));
    }
    return data;

}


/**
 * 
 * @param {String} groupCode 
 * @param {String} userId
 * @param {Array<AvailabilitySlot>} newAvailability must be same length as the array in the db
 */
export const setDBAvailability = async (groupCode, userId, newAvailability) => {
    console.log("setting availability in db for " + userId + ", " + groupCode);
    const db = firestore;
    let availabilityDB = [];
    for (let i = 0; i < newAvailability.length; i += 1){
        availabilityDB.push(newAvailability[i].available);
    }

    console.log(availabilityDB);


    const userRef = db.collection('groups').doc(groupCode).collection('members').doc(userId);
    const dbSnapshot = await userRef.get();
    if (dbSnapshot.exists){
        try{
            userRef.update({
                availability: availabilityDB
            });
        } catch (error) {
            throw new Error(AVAILABILITY_ERROR_CODES.UPDATE_ERROR);
        }
    } else {
        throw new Error(AVAILABILITY_ERROR_CODES.UPDATE_ERROR);
    }

}





