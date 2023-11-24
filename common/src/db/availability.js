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
     * @param {boolean} preferred
     */
    constructor(startDate, available, preferred=false){
        this.startDate = startDate;
        this.available = available;
        this.preferred = preferred;
    }
}

/**
 * 
 * @param {String} groupCode 
 * @param {String} userId 
 * @returns {Array<AvailabilitySlot>}
 */
export async function fetchAvailability(groupCode, userId) {
    const db = firestore;
    const userRef = db.collection('groups').doc(groupCode).collection('members').doc(userId);
    const user = await userRef.get();
    if (!user.exists){
        throw new Error(AVAILABILITY_ERROR_CODES.FETCH_ERROR);
    }

    let data = [];
    let availabilityDB = user.data().availability;
    let startDate = getDateRoundedTo30MinSlot( user.data().availabilityStartDate.toDate());

    for (let timeIndex = 0; timeIndex < availabilityDB.length; timeIndex += 1){
        data.push(new AvailabilitySlot(new Date(startDate.getTime() + timeIndex * 30 * 60000), availabilityDB[timeIndex].available, availabilityDB[timeIndex].preferred));
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
    const db = firestore;
    let availabilityDB = [];
    for (let timeIndex = 0; timeIndex < newAvailability.length; timeIndex += 1){
        availabilityDB.push({
            available : newAvailability[timeIndex].available,
            preferred : newAvailability[timeIndex].preferred
        });
    }



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





