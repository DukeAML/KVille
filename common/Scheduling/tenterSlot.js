import {Slot} from "./slot.js";


export class TenterSlot extends Slot{

    /**
     * Construct a slot that refers to just one tenter and their availability
     * @param {String} personID (integer or String)
     * @param {Date} startDate a JS Date Object
     * @param {String} phase (string) "Black", "Blue", or "White"
     * @param {String} status (string) "Available" for available, any other string for not available
     * @param {int} row corresponds to startDate
     * @param {int} col corresponds to personID
     * @param {int} weight 
     */
    constructor(personID, startDate, phase, status, row, col, weight=1){
        super(startDate, phase);
        this.personID = personID;
        this.status = status;
        this.row = row;
        this.col = col;
        this.weight = weight;
      }
}
