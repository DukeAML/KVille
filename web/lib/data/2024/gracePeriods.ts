import {getDatePlusNumShifts} from "../../calendarAndDatesUtils/datesUtils";


export const DISCRETIONARY = "Discretionary";
export class GracePeriod{
    //this class should go in another file. It's here bc of weird Jest issues probably due to circular imports
  
    startDate : Date;
    endDate : Date;
    reason : string;

    constructor(startDate : Date, endDate : Date, reason=""){
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
    }

    
    includesSlotStartDate (slotStartDate : Date) : boolean  {
        if (slotStartDate >= this.startDate && slotStartDate < this.endDate){
            return true;
        } else {
            return false;
        }
    } 


    overlapWithSlotInHours(slotStartDate : Date) : number{
        let slotEndDate = getDatePlusNumShifts(slotStartDate, 1);
        if (slotStartDate > this.endDate){
            return 0;
        } else if (slotEndDate < this.startDate){
            return 0;
        } else if (this.includesSlotStartDate(slotStartDate)){
            return 0.5;
        } else {
            let msDiff = 0;
            if (slotStartDate < this.startDate){
                msDiff = slotEndDate.getTime() - this.startDate.getTime();
            } else {
                msDiff = this.endDate.getTime() - slotStartDate.getTime();
            }
            return (msDiff / (1000 * 60 * 60));
        }
    }
}

const graceWeek = new GracePeriod(new Date(2024, 1, 12, 12, 0), new Date(2024, 1, 18, 12, 0), "Grace Week");



const mbbHomeGameStartTimes = [
    new Date(2024, 0, 13, 17, 0),
    new Date(2024, 0, 20, 20, 0),
    new Date(2024, 0, 27, 16, 0),
    new Date(2024, 1, 7, 21, 0),
    new Date(2024, 1, 10, 14, 0),
    new Date(2024, 1, 12, 19, 0),
    new Date(2024, 1, 28, 19, 0),
    new Date(2024, 2, 2, 18, 0)
];

//doesn't include wake forest on 2/24 because the time is not determined yet
const mbbAwayGameStartTimes = [
    new Date(2024, 0, 23, 19, 0),
    new Date(2024, 0, 29, 19, 0),
    new Date(2024, 1, 3, 18, 30),
    new Date(2024, 1, 17, 14, 0),
    new Date(2024, 1, 21, 19, 0),
    new Date(2024, 2, 4, 19, 0)
];

const wbbHomeGameStartTimes = [
    new Date(2024, 0, 25, 18, 0),
    new Date(2024, 1, 8, 19, 0),
    new Date(2024, 1, 11, 14, 0),
    new Date(2024, 1, 19, 19, 0),
    new Date(2024, 1, 25, 17, 30),
    new Date(2024, 1, 29, 19, 0)
];

const wbbAwayGameStartTimes = [
    new Date(2024, 0, 21, 12, 0),
    new Date(2024, 0, 28, 14, 0),
    new Date(2024, 1, 1, 19, 0),
    new Date(2024, 1, 15, 20, 0),
    new Date(2024, 1, 22, 19, 0),
    new Date(2024, 2, 3, 15, 30)
];


const GAME_LENGTH_IN_SHIFTS = 4;

const mbbHomeGameGracePeriods = mbbHomeGameStartTimes.map((startTime) => {
    return new GracePeriod(getDatePlusNumShifts(startTime, -4), getDatePlusNumShifts(startTime, 4 + GAME_LENGTH_IN_SHIFTS), "MBB Home Game");
})

const mbbAwayGameGracePeriods = mbbAwayGameStartTimes.map((startTime) => {
    return new GracePeriod(getDatePlusNumShifts(startTime, -2), getDatePlusNumShifts(startTime, 2 + GAME_LENGTH_IN_SHIFTS), "MBB Away Game");
})

const wbbHomeGameGracePeriods = wbbHomeGameStartTimes.map((startTime) => {
    return new GracePeriod(getDatePlusNumShifts(startTime, -4), getDatePlusNumShifts(startTime, 4 + GAME_LENGTH_IN_SHIFTS), "WBB Home Game");
})

const wbbAwayGameGracePeriods = wbbAwayGameStartTimes.map((startTime) => {
    return new GracePeriod(getDatePlusNumShifts(startTime, -2), getDatePlusNumShifts(startTime, 2 + GAME_LENGTH_IN_SHIFTS), "WBB Away Game");
})

const discretionaryGracePeriods : GracePeriod[] = [
    
];


export const getGracePeriods2024 = (includeDiscretionary=false) : GracePeriod[] => {
    if (includeDiscretionary){
        return [graceWeek, ...mbbHomeGameGracePeriods, ...mbbAwayGameGracePeriods, ...wbbHomeGameGracePeriods, ...wbbAwayGameGracePeriods, ...discretionaryGracePeriods];
    } else {
        return [graceWeek, ...mbbHomeGameGracePeriods, ...mbbAwayGameGracePeriods, ...wbbHomeGameGracePeriods, ...wbbAwayGameGracePeriods];
    }
}



interface IsGrace2024{
    isGrace : boolean;
    reason : string;
}
export const isGrace2024 = (slotStartDate : Date) : IsGrace2024 => {
    let gracePeriods = getGracePeriods2024(true);
    for (let i = 0; i < gracePeriods.length ; i += 1){
        let gracePeriod = gracePeriods[i];
        if (gracePeriod.includesSlotStartDate(slotStartDate)){
            return {isGrace : true, reason : gracePeriod.reason}
        }
    }
    return {isGrace : false, reason : ""}

}