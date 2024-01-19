import { firestore } from "./firebase_config";

import { getDateRoundedTo30MinSlot} from "../calendarAndDatesUtils/datesUtils";
import { AvailabilitySlot, AVAILABILITY_ERROR_CODES } from "../controllers/availabilityController";

export async function fetchAvailability(groupCode : string, userID : string) : Promise<AvailabilitySlot[]> {
    const db = firestore;
    const userRef = db.collection('groups').doc(groupCode).collection('members').doc(userID);
    const user = await userRef.get();
    if (!user.exists){
        throw new Error(AVAILABILITY_ERROR_CODES.FETCH_ERROR);
    } else {
        let data = [];
        let userData = user.data();
        if (userData !== undefined){
            let availabilityDB = userData.availability;
            let startDate = getDateRoundedTo30MinSlot( userData.availabilityStartDate.toDate());

            for (let timeIndex = 0; timeIndex < availabilityDB.length; timeIndex += 1){
                data.push(new AvailabilitySlot(new Date(startDate.getTime() + timeIndex * 30 * 60000), availabilityDB[timeIndex].available, availabilityDB[timeIndex].preferred));
            }
            return data;
        } else {
            return [];
        }
    }
}

export const setDBAvailability = async (groupCode : string, userId : string, newAvailability : AvailabilitySlot[]) => {
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


