
import { getDatePlusNumShifts, getNumSlotsBetweenDates } from "../calendarAndDates/datesUtils.js";
import {Slot} from "./slot.js";


export class ScheduleAndStartDate{



    /**
     * Generic slot object
     * @param {Array<String>} schedule should be an array of names
     * @param {Date} startDate a JS Date Object, denoting the start time of this schedule. 
     */
    constructor(schedule, startDate){
      this.schedule = schedule;
      this.startDate = startDate;
      
    }

    //helper method
    incrementVal(map, key){
        if (typeof map[key] == 'undefined'){
            map[key] = 0.5;
        } else {
            map[key] += 0.5;
        }

    }



    /**
     * 
     * @param {Date} dateRangeStart 
     * @param {Date} dateRangeEnd 
     * @param {Array<String>} allMembers an array of the identifiers (i.e. name) for each person relevant
     * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}}an object containing day_hours_per_person, and night_hours_per_person, where each is an object that maps a person's identifier to their number of hours
     */
    getHoursPerPersonInDateRange(dateRangeStart, dateRangeEnd, allMembers){
        let dayHoursPerPerson = {};
        let nightHoursPerPerson = {};
        allMembers.forEach((member) => {
            dayHoursPerPerson[member] = 0;
            nightHoursPerPerson[member] = 0;
        })
        let startDateIndex = Math.max(0, getNumSlotsBetweenDates(this.startDate, dateRangeStart));
        let endDateIndex = Math.min(this.schedule.length, getNumSlotsBetweenDates(this.startDate, dateRangeEnd));
        for (let i = startDateIndex; i < endDateIndex; i += 1){
            let peopleInSlot = this.schedule[i].split(' ');
            let currDate = getDatePlusNumShifts(this.startDate, i);
            peopleInSlot.forEach((person) => {
                if (Slot.checkNight(currDate)){
                    
                    this.incrementVal(nightHoursPerPerson, person);
                } else {
                    this.incrementVal(dayHoursPerPerson, person);
                }

            })
        }

        return {dayHoursPerPerson, nightHoursPerPerson};

    }

    /**
     * @param {Array<String>} allMembers an array of the identifiers (i.e. name) for each person relevant
     * @returns an object containing day_hours_per_person, and night_hours_per_person, where each is an object that maps a person's identifier to their number of hours
     */
    getHoursPerPersonWholeSchedule(allMembers) {
        return this.getHoursPerPersonInDateRange(this.startDate, getDatePlusNumShifts(this.startDate, this.schedule.length), allMembers);

    }
  
    
  
}
