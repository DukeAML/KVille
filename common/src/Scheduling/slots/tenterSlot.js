import {Slot} from "./slot.js";


export const EMPTY = "empty";
export const GRACE = "Grace Period";
export const TENTER_STATUS_CODES = {
  AVAILABLE : "Available",
  UNAVAILABLE : "Unavailable",
  SCHEDULED : "Scheduled",
  PREFERRED : "Preferred"
}

export class TenterSlot extends Slot{

    /**
     * Construct a slot that refers to just one tenter and their availability
     * @param {String} personID (integer or String)
     * @param {Date} startDate a JS Date Object
     * @param {String} tentType (string) TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, or TENTING_COLORS.WHITE
     * @param {String} status (string) "Available" for available, any other string for not available
     * @param {number} row corresponds to startDate
     * @param {number} col corresponds to personID
     * @param {number} weight 
     */
    constructor(personID, startDate, tentType, status, row, col, weight=1){
        super(startDate, tentType);
        this.personID = personID;
        this.status = status;
        this.row = row;
        this.col = col;
        this.weight = weight;
    }
}
