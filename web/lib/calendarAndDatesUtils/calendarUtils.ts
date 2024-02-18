import { getDayAbbreviation } from "./datesUtils";
import { getNumDaysBetweenDates } from "./datesUtils";


export const getCalendarColumnTitles = (startDate : Date, endDate : Date, screenIsNarrow = false) : string[] =>{
    let numDays = getNumDaysBetweenDates(startDate, endDate);
    let shouldBeNarrow = screenIsNarrow || numDays > 15;
    let titles= [];
    for (let i = 0; i < numDays; i++){
        let newDate = new Date(startDate.getTime() + i*24*60*60*1000);
        titles.push(getDayAbbreviation(newDate, shouldBeNarrow));
    }
    return titles;
}


export const get48TimeLabels = () : string[] => {
    let times = [];
    for (let i = 0; i < 48; i += 1){
        let half = "am";
        if (i >= 24){
            half = "pm";
        }
        let hour = Math.floor((i % 24) / 2).toString();
        let needs30Minutes= (i%2) == 1;
        if ((i % 24) <= 1){
            hour = "12";
        }
        if (needs30Minutes){
            times.push(hour + ":30" + half);
        } else {
            times.push(hour + ":00" + half);
        }
        
    }
    return times;
}

export const getTimeLabel = (hourIndex : number) : string => {
    let half = "am";
    if (hourIndex >= 24){
        half = "pm";
    }
    let hour = Math.floor((hourIndex % 24) / 2).toString();
    let needs30Minutes= (hourIndex%2) == 1;
    if ((hourIndex % 24) <= 1){
        hour = "12";
    }
    if (needs30Minutes){
        return (hour + ":30" + half);
    } else {
        return (hour + ":00" + half);
    }
        
}