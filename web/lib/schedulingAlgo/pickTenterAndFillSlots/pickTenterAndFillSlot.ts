import { TENTER_STATUS_CODES, TenterSlot} from "../slots/tenterSlot";
import { assignTenterToEntireNightShiftAndReturnRemainingSlots } from "./fillNightShift";
import { assignTenterToDaytimeShiftAndReturnRemainingSlots } from "./fillDaytimeShift";
import { Person } from "../person";


interface RemainingSlotsAndChosenIndicesInterface{
    remainingSlots : TenterSlot[];
    chosenPersonIndex : number;
    chosenTimeIndex : number;
}
export function pickTenterFillSlotAndReturnRemainingSlots(people : Person[], slots : TenterSlot[], tenterSlotsGrid : TenterSlot[][]) : RemainingSlotsAndChosenIndicesInterface{
    var chosenTenterSlot = slots[0];
    //console.log("cont : " + chosenTenterSlot.continuityScore + ", fair: " + chosenTenterSlot.fairnessScore + "picky: " + chosenTenterSlot.pickinessScore + " total: " + chosenTenterSlot.getWeight());
    let remainingSlots = slots;
    if (chosenTenterSlot.isNight){
        return {
            remainingSlots : assignTenterToEntireNightShiftAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid),
            chosenPersonIndex : chosenTenterSlot.personIndex,
            chosenTimeIndex : chosenTenterSlot.timeIndex
        };
    } else {
        return {
            remainingSlots : assignTenterToDaytimeShiftAndReturnRemainingSlots(chosenTenterSlot, people, remainingSlots, tenterSlotsGrid),
            chosenPersonIndex : chosenTenterSlot.personIndex,
            chosenTimeIndex : chosenTenterSlot.timeIndex
        };
    }
}




export function getNumberScheduledAtChosenTime(tenterSlotsGrid : TenterSlot[][], chosenTimeIndex : number) : number {
    var personIndex = 0;
    var numberScheduledAtChosenTime = 0;
    while (personIndex < tenterSlotsGrid.length) {
        if (tenterSlotsGrid[personIndex][chosenTimeIndex].getIsScheduled()){
            numberScheduledAtChosenTime = numberScheduledAtChosenTime + 1;
        }
        personIndex += 1;
    }
    return numberScheduledAtChosenTime;
}




export function assignTenterToOneSlotAndReturnRemainingSlots(chosenTenterSlot : TenterSlot, people : Person[], remainingSlots : TenterSlot[], tenterSlotsGrid : TenterSlot[][]) : TenterSlot[]{
    chosenTenterSlot.status = TENTER_STATUS_CODES.SCHEDULED;
    updateChosenPersonHourNumbers(chosenTenterSlot, people);
    for(let j=0;j<remainingSlots.length;j++){
        if(remainingSlots[j].timeIndex == chosenTenterSlot.timeIndex && remainingSlots[j].personIndex == chosenTenterSlot.personIndex){
            remainingSlots.splice(j,1);
            break;
        }
    }

    var chosenTimeIndex = chosenTenterSlot.timeIndex;
    var numberScheduledAtChosenTime = getNumberScheduledAtChosenTime(tenterSlotsGrid, chosenTimeIndex);
    var peopleNeeded = chosenTenterSlot.calculatePeopleNeeded();
    if (numberScheduledAtChosenTime >= peopleNeeded){
        remainingSlots = remainingSlots.filter((s) => (s.timeIndex != chosenTimeIndex));
        for (let personIndex = 0; personIndex < tenterSlotsGrid.length; personIndex += 1) {
            tenterSlotsGrid[personIndex][chosenTimeIndex].setTimeslotIsFull();
        }
    }
    
    return remainingSlots;
}


function updateChosenPersonHourNumbers(chosenTenterSlot : TenterSlot, people : Person[]) {
    var chosenPersonIndex = chosenTenterSlot.personIndex;
    var chosenPerson = people[chosenPersonIndex];

    if (chosenTenterSlot.isNight){
        chosenPerson.nightScheduled += 1;
        chosenPerson.nightFree -= 1;
    }else{
        chosenPerson.dayScheduled += 1;
        chosenPerson.dayFree -= 1;
    }
}