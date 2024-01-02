import { getGracePeriods2023 } from "../../../data/2023/gracePeriods";
import { getGracePeriods2024 } from "../../../data/2024/gracePeriods";






/**
 * 
 * @param {Date} slotStartDate 
 * @returns {{isGrace : boolean, reason : string}}
 */
export const isGrace = (slotStartDate, includeDiscretionary=false) => {
    let gracePeriods = getGracePeriods2024(includeDiscretionary);
    if (slotStartDate.getFullYear() < 2023.5){
        gracePeriods = getGracePeriods2023(includeDiscretionary);
    }

    for (let i = 0; i < gracePeriods.length ; i += 1){
        let gracePeriod = gracePeriods[i];
        if (gracePeriod.includesSlotStartDate(slotStartDate)){
            return {isGrace : true, reason : gracePeriod.reason}
        }
    }
    return {isGrace : false, reason : ""}

}