
import {weekdayAbbreviations} from "../data/weekdayAbbreviations"; 


export const getCurrentDate = (roundTo30MinSlots = true) : Date => {
    if (roundTo30MinSlots){
        return getDateRoundedTo30MinSlot(new Date(Date.now()));
    } else {
        return new Date(Date.now());
    }
}


export const getNumSlotsBetweenDates = (startDate : Date, endDate : Date) : number => {
    let diff_ms = endDate.getTime() - startDate.getTime();
    return Math.round(diff_ms / (30 * 60 * 1000));
    
}


export const getDatePlusNumShifts = (origDate : Date, shiftsAdder : number) : Date => {
    return new Date(origDate.getTime() + shiftsAdder * 30 * 60 * 1000);
    
}


export const getNumDaysBetweenDates = (startDate : Date, endDate : Date) : number => {
    let ms_diff = Math.abs(endDate.getTime() - startDate.getTime());
    let num_ms_in_day = 1000 * 60 * 60 * 24;
    if (ms_diff % num_ms_in_day == 0){
        return 1 + Math.ceil(ms_diff / num_ms_in_day);
    } else {
        return Math.ceil(ms_diff / num_ms_in_day);
    }
    
  
  }


export const getDateRoundedTo30MinSlot = (date : Date) : Date => {
    let origTime = date.getTime();
    let rounded30MinSlots = Math.round(origTime / (30 * 60 * 1000));

    return new Date(rounded30MinSlots * 30 * 60 * 1000);
}


export const getDayAbbreviation = (date : Date, narrow = false) : string => {
    let dayNum = date.getDay();
    let dayStr = weekdayAbbreviations[0];
    if (dayNum == 1){
        dayStr = weekdayAbbreviations[1];
    } else if (dayNum == 2){
        dayStr = weekdayAbbreviations[2];
    } else if (dayNum == 3){
        dayStr = weekdayAbbreviations[3];
    } else if (dayNum == 4){
        dayStr = weekdayAbbreviations[4];
    } else if (dayNum == 5){
        dayStr = weekdayAbbreviations[5];
    } else if (dayNum == 6){
        dayStr = weekdayAbbreviations[6];
    }
    let month = date.getMonth() + 1;
    let monthDay = date.getDate();
    if (narrow){
        return month.toString() + "/\n" + monthDay.toString();
    }
    return (dayStr + " " + month.toString() + "/" + monthDay.toString());
  }

