import { getGracePeriods2023 } from "../../data/2023/gracePeriods";
import { getGracePeriods2024 } from "../../data/2024/gracePeriods";
import { GRACE } from "../slots/tenterSlot";


interface IsGraceInterface {
    isGrace : boolean;
    reason : string;
    overlapInHours : number;
}
export const isGrace = (slotStartDate : Date, includeDiscretionary=false) : IsGraceInterface => {
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

export const scheduleNameForGracePeriod = (reason : string) : string => {
    return GRACE + " - " + reason;
}


export const checkIfNameIsForGracePeriod = (name : string) : boolean => {
    if (name.startsWith(GRACE)){
        return true;
    } else {
        return false;
    }
}
