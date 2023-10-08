import { Slot } from "./slot.js";
export class ScheduledSlot extends Slot{

    /**
     * Construct a slot that refers to the start date, phase, and has ids of all tenters scheduled for this time slot
     * @param {Date} startDate 
     * @param {Array<String>} ids
     * @param {String} tentType 
     */
    constructor(startDate, tentType, ids =[]){
        super(startDate, tentType);
        this.ids = ids;

    }
}


