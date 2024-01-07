import { PREFERRED_WEIGHT_FACTOR, TenterSlot } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { Person } from "../person";

export function prioritizeFairness(people : Person[], slots : TenterSlot[]){
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


const getTotalScheduled = (person : Person) : number => {
    return person.dayScheduled + person.nightScheduled;
}


export function prioritizeNighttimeFairness(people : Person[], nightSlots : TenterSlot[]){
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



interface DistributionAnalysis{
    min : number;
    max : number;
    mean : number;
    std : number;
}
function getDistributionAnalysis(data : number[]) : DistributionAnalysis {
    let mean = 0;
    let min = data[0];
    let max = data[0];
    let std = 0;

    for (let ind = 0; ind < data.length; ind++) {
        mean += data[ind];
        min = Math.min(min, data[ind]);
        max = Math.max(max, data[ind]);
    }
    let dataLength = Math.max(0.01, data.length);
    mean = mean/dataLength;
    for(let ind = 0; ind<data.length; ind++){
        std += Math.pow((data[ind]-mean),2);
    }
    std /= dataLength;
    std = Math.sqrt(std);
    return {min, max, mean, std};
}






