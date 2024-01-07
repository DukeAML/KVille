import { getGracePeriods2023 } from "@/lib/data/2023/gracePeriods";
import { getGracePeriods2024 } from "@/lib/data/2024/gracePeriods";
import { GRACE } from "../slots/tenterSlot";




/**
 * 
 * @param {Date} slotStartDate 
 * @returns {{isGrace : boolean, reason : string, overlapInHours : number}}
 */
export const isGrace = (slotStartDate, includeDiscretionary=false) => {
    let gracePeriods = getGracePeriods2024(includeDiscretionary);
    if (slotStartDate.getFullYear() < 2023.5){
        gracePeriods = getGracePeriods2023(includeDiscretionary);
    }

    for (let i = 0; i < gracePeriods.length ; i += 1){
        let gracePeriod = gracePeriods[i];
        if (includeDiscretionary){
            if (gracePeriod.overlapWithSlotInHours(slotStartDate) > 0){
                return {isGrace : true, reason : gracePeriod.reason, overlapInHours : gracePeriod.overlapWithSlotInHours(slotStartDate)}
            }
        } else {
            if (gracePeriod.includesSlotStartDate(slotStartDate)){
                return {isGrace : true, reason : gracePeriod.reason, overlapInHours : gracePeriod.overlapWithSlotInHours(slotStartDate)}
            }
        }
    }
    return {isGrace : false, reason : "", overlapInHours : 0}

}

/**
 * Returns a string formatted like "Grace - MBB Home Game"
 * @param {string} reason 
 * @returns string
 */
export const scheduleNameForGracePeriod = (reason) => {
    return GRACE + " - " + reason;
}

/**
 * 
 * @param {string} name 
 * @returns {boolean}
 */
export const checkIfNameIsForGracePeriod = (name) => {
    if (name.startsWith(GRACE)){
        return true;
    } else {
        return false;
    }
}
