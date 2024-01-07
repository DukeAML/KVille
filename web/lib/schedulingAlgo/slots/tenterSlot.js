import {Slot} from "./slot";


export const EMPTY = "empty";
export const GRACE = "Grace Period";
export const TENTER_STATUS_CODES = {
    AVAILABLE : "Available",
    UNAVAILABLE : "Unavailable",
    SCHEDULED : "Scheduled",
    PREFERRED : "Preferred"
}

export const PREFERRED_WEIGHT_FACTOR = 2;
export class TenterSlot extends Slot{

    /**
     * Construct a slot that refers to just one tenter and their availability
     * @param {String} personID (integer or String)
     * @param {Date} startDate a JS Date Object
     * @param {String} tentType (string) TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, or TENTING_COLORS.WHITE
     * @param {String} status (string) "Available" for available, any other string for not available
     * @param {number} timeIndex corresponds to startDate
     * @param {number} personIndex corresponds to personID
     * @param {number} weight 
     */
    constructor(personID, startDate, tentType, status, timeIndex, personIndex, weight=1){
        super(startDate, tentType);
        this.personID = personID;
        this.status = status;
        this.ogStatus = status;
        this.timeIndex = timeIndex;
        this.personIndex = personIndex;
        this.weight = weight;
        this.timeslotIsFull = false;

		this.preferredScore = status === TENTER_STATUS_CODES.PREFERRED ? PREFERRED_WEIGHT_FACTOR : 1;
		this.fairnessScore = 1;
		this.continuityScore = 1;
		this.toughTimesScore = 1;
		this.pickinessScore = 1;
    }

	/**
	 * return true iff the tenter is either available or preferred here, and this is not a grace period
	 * @returns {boolean}
	 */
	getIsEligibleForAssignment(checkIfSlotIsFull=true){
        if (checkIfSlotIsFull){
            return (!this.isGrace && !this.timeslotIsFull && (this.status === TENTER_STATUS_CODES.AVAILABLE || this.status === TENTER_STATUS_CODES.PREFERRED));
        } else {
            return (!this.isGrace && (this.status === TENTER_STATUS_CODES.AVAILABLE || this.status === TENTER_STATUS_CODES.PREFERRED));
        }
		
	}

	/**
	 * @returns {number} the weight of the slot
	 */
	getWeight() {
		return this.preferredScore * this.fairnessScore * this.continuityScore * this.toughTimesScore * this.pickinessScore;
	}

    /**
     * 
     * @returns {number}
     */
    getWeightWithoutContinuityScore(){
        return this.preferredScore * this.preferredScore * this.fairnessScore * this.toughTimesScore * this.pickinessScore;
    }

    setTimeslotIsFull(){
        this.timeslotIsFull = true;
    }

    /**
     * 
     * @returns {boolean}
     */
    getIsScheduled() {
        return this.status === TENTER_STATUS_CODES.SCHEDULED;
    }


}
