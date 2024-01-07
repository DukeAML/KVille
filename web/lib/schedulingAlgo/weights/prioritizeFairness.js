import { PREFERRED_WEIGHT_FACTOR } from "@/lib/schedulingAlgo/slots/tenterSlot";

/**
 * Weight Balance - prioritize people with fewer scheduled shifts
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} slots has 1 entry for each time slot for each person
 */
export function prioritizeFairness(people, slots){

    let {min, max, mean, std} = getDistributionAnalysis(people.map((person) => getTotalScheduled(person)));
    for (var slotIndex = 0; slotIndex < slots.length; slotIndex++){
        var currentSlot = slots[slotIndex];
        let currentPerson = people[currentSlot.personIndex];
        let zScore = (getTotalScheduled(currentPerson) - mean) / std;
        let score = Math.pow(PREFERRED_WEIGHT_FACTOR, -1 * zScore);
        if (getTotalScheduled(currentPerson) < (min + 0.01)){
            score *= 2;
        }
        if (getTotalScheduled(currentPerson) > (max - 0.01)){
            score *= 0.5;
        }
        currentSlot.fairnessScore = score;
    }
}

/**
 * 
 * @param {import("../person").Person} person 
 * @returns {number} total number of slots they are scheduled for
 */
const getTotalScheduled = (person ) => {
    return person.dayScheduled + person.nightScheduled;
}

/**
 * Weight Balance - prioritize people with fewer scheduled shifts
 * @param {Array<import("../person").Person>} people 
 * @param {Array<import("@/lib/schedulingAlgo/slots/tenterSlot").TenterSlot>} nightSlots has 1 entry for each time slot for each person
 */
export function prioritizeNighttimeFairness(people, nightSlots){
    let {min, max, mean, std} = getDistributionAnalysis(people.map((person) => person.nightScheduled));
    for (var slotIndex = 0; slotIndex < nightSlots.length; slotIndex++){
        var currentSlot = nightSlots[slotIndex];
        let currentPerson = people[currentSlot.personIndex];
        let zScore = (currentPerson.nightScheduled - mean) / std;
        let score = Math.pow(PREFERRED_WEIGHT_FACTOR, -1 * zScore);

        if (currentPerson.nightScheduled < (min + 0.01)){
            score *= 2;
        }
        if (currentPerson.nightScheduled > (max - 0.01)){
            score *= 0.5;
        }
        currentSlot.fairnessScore = score;
    }
}

/**
 * 
 * @param {Array<number>} data 
 * @returns {{min : number, max : number, mean : number, std : number}} analysis
 */
function getDistributionAnalysis(data) {
    let mean = 0;
    let min = data[0];
    let max = data[0];
    let std = 0;
    
    
    for (let ind = 0; ind < data.length; ind++) {
        mean += data[ind];
        min = Math.min(min, data[ind]);
        max = Math.max(max, data[ind]);
    }
    mean = mean/data.length;
    for(let ind = 0; ind<data.length; ind++){
        std += Math.pow((data[ind]-mean),2);
    }
    std /= data.length;
    std = Math.sqrt(std);
    return {min, max, mean, std};
}






