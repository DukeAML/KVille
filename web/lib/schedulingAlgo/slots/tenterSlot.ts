import {Slot} from "./slot";


export const EMPTY = "empty";
export const GRACE = "Grace";
export const TENTER_STATUS_CODES = {
    AVAILABLE : "Available",
    UNAVAILABLE : "Unavailable",
    SCHEDULED : "Scheduled",
    PREFERRED : "Preferred"
}

export const PREFERRED_WEIGHT_FACTOR = 2;
export class TenterSlot extends Slot{
    personID : string;
    status : string;
    ogStatus : string;
    timeIndex : number;
    personIndex : number;
    weight : number;
    timeslotIsFull : boolean;
    preferredScore : number;
    fairnessScore : number;
    continuityScore : number;
    toughTimesScore : number;
    pickinessScore : number;


    constructor(personID : string, startDate : Date, tentType : string, status : string, timeIndex : number, personIndex : number, weight=1){
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


	getIsEligibleForAssignment(checkIfSlotIsFull=true) : boolean {
        if (checkIfSlotIsFull){
            return (!this.isGrace && !this.timeslotIsFull && (this.status === TENTER_STATUS_CODES.AVAILABLE || this.status === TENTER_STATUS_CODES.PREFERRED));
        } else {
            return (!this.isGrace && (this.status === TENTER_STATUS_CODES.AVAILABLE || this.status === TENTER_STATUS_CODES.PREFERRED));
        }
		
	}

	getWeight() : number{
		return this.preferredScore * this.fairnessScore * this.continuityScore * this.toughTimesScore * this.pickinessScore;
	}


    getWeightWithoutContinuityScore() : number {
        return this.preferredScore * this.preferredScore * this.fairnessScore * this.toughTimesScore * this.pickinessScore;
    }

    setTimeslotIsFull(){
        this.timeslotIsFull = true;
    }

    getIsScheduled() : boolean {
        return this.status === TENTER_STATUS_CODES.SCHEDULED;
    }


}
