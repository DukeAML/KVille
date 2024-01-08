import { Slot } from "./slot";
export class ScheduledSlot extends Slot{
    ids : string[];

    constructor(startDate : Date, tentType : string, ids =[]){
        super(startDate, tentType);
        this.ids = ids;

    }
}


