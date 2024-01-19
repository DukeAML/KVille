import { getNumSlotsBetweenDates, getDatePlusNumShifts } from "../calendarAndDatesUtils/datesUtils";
import { DISCRETIONARY } from "../data/2024/gracePeriods";
import { UsernameAndIDs } from "./scheduleController";
import { checkIfNameIsForGracePeriod, isGrace } from "../schedulingAlgo/rules/gracePeriods";
import { isNight } from "../schedulingAlgo/rules/nightData";
import { EMPTY } from "../schedulingAlgo/slots/tenterSlot";


interface DayNightHoursPerPersonMapInterface {
    dayHoursPerPerson: { [key: string]: number; };
    nightHoursPerPerson: { [key: string]: number; };
}

export class ScheduleData {

    schedule: string[][];
    startDate: Date;
    IDToNameMap: Map<string, string>;

    constructor(schedule: string[][], startDate: Date, IDToNameMap = new Map()) {
        this.schedule = schedule;
        this.startDate = startDate;
        this.IDToNameMap = IDToNameMap;
    }

    //helper method
    incrementVal(map: { [key: string]: number; }, key: string) {
        if (typeof map[key] == 'undefined') {
            map[key] = 0.5;
        } else {
            map[key] += 0.5;
        }
    }

    decrementVal(map: { [key: string]: number; }, key: string, val: number) {
        if (typeof map[key] == 'undefined') {
            return;
        } else {
            map[key] -= val;
        }
    }


    getNamesAtTimeIndex(timeIndex: number): string[] {
        const ids: string[] = this.schedule[timeIndex];
        let names: string[] = [];
        if (checkIfNameIsForGracePeriod(ids.join(" "))) {
            return [ids.join(" ")];
        }
        ids.forEach((id) => {
            let name = this.IDToNameMap.get(id);
            if (name !== undefined) {
                names.push(name);
            } else {
                names.push(id);
            }
        });
        return names;
    }

    getIDsAtTimeIndex(timeIndex: number): string[] {
        return this.schedule[timeIndex];
    }

    getEmptyHoursPerPersonMaps(): DayNightHoursPerPersonMapInterface {
        let dayHoursPerPerson: { [key: string]: number; } = {};
        let nightHoursPerPerson: { [key: string]: number; } = {};
        this.IDToNameMap.forEach((username, id) => {
            dayHoursPerPerson[username] = 0;
            nightHoursPerPerson[username] = 0;
        });
        return { dayHoursPerPerson, nightHoursPerPerson };
    }


    getHoursPerPersonInDateRange(dateRangeStart: Date, dateRangeEnd: Date): DayNightHoursPerPersonMapInterface {
        let { dayHoursPerPerson, nightHoursPerPerson } = this.getEmptyHoursPerPersonMaps();
        let startDateIndex = Math.max(0, getNumSlotsBetweenDates(this.startDate, dateRangeStart));
        let endDateIndex = Math.min(this.schedule.length, getNumSlotsBetweenDates(this.startDate, dateRangeEnd));
        for (let timeIndex = startDateIndex; timeIndex < endDateIndex; timeIndex += 1) {
            let peopleInSlot = this.getNamesAtTimeIndex(timeIndex);
            let currDate = getDatePlusNumShifts(this.startDate, timeIndex);
            peopleInSlot.forEach((person) => {
                if (isNight(currDate)) {
                    this.incrementVal(nightHoursPerPerson, person);
                } else {
                    this.incrementVal(dayHoursPerPerson, person);
                }
            });
        }

        return { dayHoursPerPerson, nightHoursPerPerson };
    }


    getHoursPerPersonInDateRangeAccountingForDiscretionaryGrace(dateRangeStart: Date, dateRangeEnd: Date): DayNightHoursPerPersonMapInterface {
        let { dayHoursPerPerson, nightHoursPerPerson } = this.getEmptyHoursPerPersonMaps();
        let startDateIndex = Math.max(0, getNumSlotsBetweenDates(this.startDate, dateRangeStart));
        let endDateIndex = Math.min(this.schedule.length, getNumSlotsBetweenDates(this.startDate, dateRangeEnd));
        for (let timeIndex = startDateIndex; timeIndex < endDateIndex; timeIndex += 1) {
            let currDate = getDatePlusNumShifts(this.startDate, timeIndex);
            let peopleInSlot = this.getNamesAtTimeIndex(timeIndex);
            peopleInSlot.forEach((person) => {
                if (isNight(currDate)) {
                    this.incrementVal(nightHoursPerPerson, person);
                } else {
                    this.incrementVal(dayHoursPerPerson, person);
                }
            });

            let { isGrace: thisIsGrace, reason, overlapInHours } = isGrace(currDate, true);
            if (thisIsGrace && reason === DISCRETIONARY) {
                peopleInSlot.forEach((person) => {
                    if (isNight(currDate)) {
                        this.decrementVal(nightHoursPerPerson, person, overlapInHours);
                    } else {
                        this.decrementVal(dayHoursPerPerson, person, overlapInHours);
                    }

                });
            }
        }
        return { dayHoursPerPerson, nightHoursPerPerson };
    }


    getHoursPerPersonWholeSchedule(): DayNightHoursPerPersonMapInterface {
        return this.getHoursPerPersonInDateRange(this.startDate, getDatePlusNumShifts(this.startDate, this.schedule.length));
    }


    getHoursPerPersonWholeScheduleAccountingForDiscretionaryGrace(): DayNightHoursPerPersonMapInterface {
        return this.getHoursPerPersonInDateRangeAccountingForDiscretionaryGrace(this.startDate, getDatePlusNumShifts(this.startDate, this.schedule.length));
    }

    swapTenterAtIndexByNames(timeIndex: number, tenterToReplaceName: string, newTenterName: string) {
        let tenterToReplaceID = tenterToReplaceName;
        let newTenterID = newTenterName;
        this.IDToNameMap.forEach((username, id) => {
            if (username === tenterToReplaceName) {
                tenterToReplaceID = id;
            }
            if (username === newTenterName) {
                newTenterID = id;
            }
        });
        this.swapTenterAtIndexByIDs(timeIndex, tenterToReplaceID, newTenterID);
    }


    swapTenterAtIndexByIDs(timeIndex: number, tenterToReplaceID: string, newTenterID: string) {
        let IDsAtThisTime = this.getIDsAtTimeIndex(timeIndex);
        let newIDsAtThisTime: string[] = [];
        for (let assignedTenterIndex = 0; assignedTenterIndex < IDsAtThisTime.length; assignedTenterIndex += 1) {
            if (IDsAtThisTime[assignedTenterIndex] === tenterToReplaceID && (!(newIDsAtThisTime.includes(newTenterID)) || (newTenterID === EMPTY))) {
                newIDsAtThisTime.push(newTenterID);
            } else {
                newIDsAtThisTime.push(IDsAtThisTime[assignedTenterIndex]);
            }
        }
        this.schedule[timeIndex] = newIDsAtThisTime;
    }

    containsMemberAtTimeIndexByUsername(timeIndex: number, memberUsername: string): boolean {
        let namesAtThisTime = this.getNamesAtTimeIndex(timeIndex);
        for (let personIndex = 0; personIndex < namesAtThisTime.length; personIndex += 1) {
            if (namesAtThisTime[personIndex] === memberUsername) {
                return true;
            }
        }
        return false;
    }


    getMaxNumPplOnDay(date: Date): number {
        date.setHours(0);
        date.setMinutes(0);
        let startIndex = getNumSlotsBetweenDates(this.startDate, date);
        if (startIndex < 0 || startIndex >= this.schedule.length) {
            return 0;
        } else {
            let maxPpl = 0;
            let timeIndex = startIndex;
            while (timeIndex < this.schedule.length && timeIndex < (startIndex + 48)) {
                let len = this.getIDsAtTimeIndex(timeIndex).length;
                if (len > maxPpl) {
                    maxPpl = len;
                }
                timeIndex += 1;
            }
            return maxPpl;
        }

    }


    getAllMembers(): UsernameAndIDs[] {
        let members: UsernameAndIDs[] = [];
        this.IDToNameMap.forEach((username, userID) => {
            members.push({ userID, username });
        });
        return members;
    }




}
