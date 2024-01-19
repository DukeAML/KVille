import { Slot } from "../slots/slot";
import { TenterSlot, TENTER_STATUS_CODES } from "../slots/tenterSlot";
import { isNight } from "../rules/nightData";
import { AvailabilityStatus } from "@/lib/controllers/availabilityController";

interface NumFreeDayAndNight{
    numFreeDaySlots : number;
    numFreeNightSlots : number;
}

export function dayNightFree(availabilities : AvailabilityStatus[], availabilitiesStartDate : Date) : NumFreeDayAndNight{
    var numFreeDaySlots = 0;
    var numFreeNightSlots = 0;
    for (var timeIndex = 0; timeIndex < availabilities.length; timeIndex++){
        if (availabilities[timeIndex].available == true){
            var date = new Date(availabilitiesStartDate.getTime() + 30*timeIndex*60000);
            if (isNight(date)){
                numFreeNightSlots += 1;
            } else{
                numFreeDaySlots += 1;
            }
        }
    }
    return {numFreeDaySlots, numFreeNightSlots};
}


export function availabilitiesToSlots(personID : string, availabilities : AvailabilityStatus[], availabilitiesStartDate : Date, tentType : string, userCount : number) : TenterSlot[]{
    var slots = [];
    for (var timeIndex = 0; timeIndex < availabilities.length; timeIndex++){
        var status = TENTER_STATUS_CODES.AVAILABLE;
        if (availabilities[timeIndex].available == false){
            status = TENTER_STATUS_CODES.UNAVAILABLE;
        } else if (availabilities[timeIndex].available == true && availabilities[timeIndex].preferred == true){
            status = TENTER_STATUS_CODES.PREFERRED;
        }
        var date = new Date(availabilitiesStartDate.getTime() + 30*timeIndex*60000);
        var slot = new TenterSlot(personID, date, tentType, status, timeIndex, userCount, 1);
        
        slots.push(slot);
    }

    return slots;

}