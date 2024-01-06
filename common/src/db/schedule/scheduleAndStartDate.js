
import { getDatePlusNumShifts, getNumSlotsBetweenDates } from "../../calendarAndDates/datesUtils.js";
import { isNight } from "../../scheduling/rules/nightData.js";
import { EMPTY, GRACE } from "../../scheduling/slots/tenterSlot.js";
import { checkIfNameIsForGracePeriod, isGrace } from "../../scheduling/rules/gracePeriods.js";
import { DISCRETIONARY } from "../../../data/2024/gracePeriods.js";
export class ScheduleData{
    /**
     * Generic slot object
     * @param {Array<Array<String>>} schedule should be an array of arrays of names
     * @param {Date} startDate a JS Date Object, denoting the start time of this schedule.
     * @param {Map} IDToNameMap a map which maps names to usernames
     */
    constructor(schedule, startDate, IDToNameMap=new Map()){
      this.schedule = schedule;
      this.startDate = startDate;
      this.IDToNameMap = IDToNameMap;
    }

    //helper method
    incrementVal(map, key){
        if (typeof map[key] == 'undefined'){
            map[key] = 0.5;
        } else {
            map[key] += 0.5;
        }
    }

    decrementVal(map, key, val){
        if (typeof map[key] =='undefined'){
            return;
        } else {
            map[key] -= val;
        }
    }
    /**
     * 
     * @param {number} timeIndex 
     * @returns {Array<String>} an array of the usernames of the people at this time
     */
    getNamesAtTimeIndex(timeIndex){
        const ids = this.schedule[timeIndex];
        let names = [];
        if (checkIfNameIsForGracePeriod(ids.join(" "))){
            return [ids.join(" ")];
        }
        ids.forEach((id) => {
            if (this.IDToNameMap.has(id)){
                names.push(this.IDToNameMap.get(id));
            } else {
                names.push(id);
            }
        })
        return names;
    }

    /**
     * 
     * @param {number} timeIndex 
     * @returns {Array<string>}
     */
    getIDsAtTimeIndex(timeIndex){
        return this.schedule[timeIndex];
    }

    /**
     * 
     * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}} 
     */
    getEmptyHoursPerPersonMaps(){
        let dayHoursPerPerson = {};
        let nightHoursPerPerson = {};
        this.IDToNameMap.forEach((username, id) => {
            dayHoursPerPerson[username] = 0;
            nightHoursPerPerson[username] = 0;
        });
        return {dayHoursPerPerson, nightHoursPerPerson}
    }

    /**
     * 
     * @param {Date} dateRangeStart 
     * @param {Date} dateRangeEnd 
     * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}} each object here maps usernames to hours, not ids to hours
     */
    getHoursPerPersonInDateRange(dateRangeStart, dateRangeEnd){
        let {dayHoursPerPerson, nightHoursPerPerson} = this.getEmptyHoursPerPersonMaps();
        let startDateIndex = Math.max(0, getNumSlotsBetweenDates(this.startDate, dateRangeStart));
        let endDateIndex = Math.min(this.schedule.length, getNumSlotsBetweenDates(this.startDate, dateRangeEnd));
        for (let timeIndex = startDateIndex; timeIndex < endDateIndex; timeIndex += 1){
            let peopleInSlot = this.getNamesAtTimeIndex(timeIndex);
            let currDate = getDatePlusNumShifts(this.startDate, timeIndex);
            peopleInSlot.forEach((person) => {
                if (isNight(currDate)){
                    this.incrementVal(nightHoursPerPerson, person);
                } else {
                    this.incrementVal(dayHoursPerPerson, person);
                }
            })
        }

        return {dayHoursPerPerson, nightHoursPerPerson};
    }

    /**
     * 
     * @param {Date} dateRangeStart 
     * @param {Date} dateRangeEnd 
     * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}} each object here maps usernames to hours, not ids to hours
     */
    getHoursPerPersonInDateRangeAccountingForDiscretionaryGrace(dateRangeStart, dateRangeEnd){
        let {dayHoursPerPerson, nightHoursPerPerson} = this.getEmptyHoursPerPersonMaps();
        let startDateIndex = Math.max(0, getNumSlotsBetweenDates(this.startDate, dateRangeStart));
        let endDateIndex = Math.min(this.schedule.length, getNumSlotsBetweenDates(this.startDate, dateRangeEnd));
        for (let timeIndex = startDateIndex; timeIndex < endDateIndex; timeIndex += 1){
            let currDate = getDatePlusNumShifts(this.startDate, timeIndex);
            let peopleInSlot = this.getNamesAtTimeIndex(timeIndex);
            peopleInSlot.forEach((person) => {
                if (isNight(currDate)){
                    this.incrementVal(nightHoursPerPerson, person);
                } else {
                    this.incrementVal(dayHoursPerPerson, person);
                }
            })

            let {isGrace : thisIsGrace, reason, overlapInHours} = isGrace(currDate, true);
            if (thisIsGrace && reason === DISCRETIONARY){
                peopleInSlot.forEach((person) => {
                    if (isNight(currDate)){
                        this.decrementVal(nightHoursPerPerson, person, overlapInHours);
                    } else {
                        this.decrementVal(dayHoursPerPerson, person, overlapInHours);
                    }
                    
                })
            }
        }

        return {dayHoursPerPerson, nightHoursPerPerson};
    }

    /**
     * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}}
     */
    getHoursPerPersonWholeSchedule() {
        return this.getHoursPerPersonInDateRange(this.startDate, getDatePlusNumShifts(this.startDate, this.schedule.length));
    }

    /**
     * @returns {{dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}}
     */
    getHoursPerPersonWholeScheduleAccountingForDiscretionaryGrace() {
        return this.getHoursPerPersonInDateRangeAccountingForDiscretionaryGrace(this.startDate, getDatePlusNumShifts(this.startDate, this.schedule.length));
    }

    swapTenterAtIndexByNames(timeIndex, tenterToReplaceName, newTenterName){
        let tenterToReplaceID = tenterToReplaceName;
        let newTenterID = newTenterName;
        this.IDToNameMap.forEach((username, id) => {
            if (username === tenterToReplaceName){
                tenterToReplaceID = id;
            } 
            if (username === newTenterName){
                newTenterID = id;
            }
        })
        this.swapTenterAtIndexByIDs(timeIndex, tenterToReplaceID, newTenterID);

    }

    /**
     * 
     * @param {number} timeIndex 
     * @param {string} tenterToReplaceID 
     * @param {string} newTenterID 
     */
    swapTenterAtIndexByIDs(timeIndex, tenterToReplaceID, newTenterID){
        let IDsAtThisTime = this.getIDsAtTimeIndex(timeIndex);
        let newIDsAtThisTime = [];
        for (let assignedTenterIndex = 0; assignedTenterIndex < IDsAtThisTime.length; assignedTenterIndex += 1){
            if (IDsAtThisTime[assignedTenterIndex] === tenterToReplaceID && (!(newIDsAtThisTime.includes(newTenterID)) || (newTenterID === EMPTY))){
                newIDsAtThisTime.push(newTenterID);
            } else {
                newIDsAtThisTime.push(IDsAtThisTime[assignedTenterIndex]);
            }
        }
        this.schedule[timeIndex] = newIDsAtThisTime;
    }
    
    /**
     * 
     * @param {number} timeIndex 
     * @param {string} memberUsername 
     * @returns {boolean}
     */
    containsMemberAtTimeIndexByUsername(timeIndex, memberUsername) {
        let namesAtThisTime = this.getNamesAtTimeIndex(timeIndex);
        for (let personIndex = 0; personIndex < namesAtThisTime.length; personIndex +=1 ){
            if (namesAtThisTime[personIndex] === memberUsername){
                return true;
            }
        }
        return false;

    }

    /**
     * 
     * @param {Date} date 
     * @returns {number} maxPpl
     */
    getMaxNumPplOnDay(date){
        date.setHours(0);
        date.setMinutes(0);
        let startIndex = getNumSlotsBetweenDates(this.startDate, date);
        if (startIndex < 0 || startIndex >= this.schedule.length){
            return 0;
        } else {
            let maxPpl = 0;
            let timeIndex = startIndex;
            while (timeIndex < this.schedule.length && timeIndex < (startIndex + 48)){
                let len = this.getIDsAtTimeIndex(timeIndex).length;
                if (len > maxPpl){
                    maxPpl = len;
                }
                timeIndex += 1;
            }
            return maxPpl;
        }
        
    }

    /**
     * 
     * @returns {{userID : string, username : string}[]} members
     */
    getAllMembers(){
        let members = [];
        this.IDToNameMap.forEach((username, userID) => {
            members.push({userID, username})
        })
        return members;
    }

  
    
  
}
