import { TENTER_STATUS_CODES} from "./slots/tenterSlot";
/**
 * Update people, spreadsheet, and remove slots.
 * @param {Array<import("./person").Person>} people 
 * @param {Array<import("./slots/tenterSlot").TenterSlot>} slots 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid
 * @return {Array<import("./slots/tenterSlot").TenterSlot>} remainingSlots 
 * 
 */
export function pickTenterFillSlotAndReturnRemainingSlots(people, slots, tenterSlotsGrid){
    var chosenTenterSlot = slots.shift(); //remove first element and return it

    updateChosenPerson(chosenTenterSlot, people);


    var chosenTimeIndex = chosenTenterSlot.timeIndex;
    var chosenPersonIndex = chosenTenterSlot.personIndex;
    var workHere = tenterSlotsGrid[chosenPersonIndex];//array to work off 
    var checkStart = Math.max(0, chosenTimeIndex-3);//bc edge case
    var checkEnd = Math.min(workHere.length-1, chosenTimeIndex+3);//check 3 before + 3 after
    //check for one big consecutive block within the workHere from checkStart-checkEnd
    var apStart = checkStart;//may not remain the same
    var apEnd = checkEnd;//actually possible Start/End indices
    for(let i=checkStart; i<=checkEnd; i++){
        if(workHere[i].status==TENTER_STATUS_CODES.SCHEDULED || workHere[i].status==TENTER_STATUS_CODES.UNAVAILABLE){
            //cut this part off, either from left or right(whichever side it's on)
            //making sure to include the chosen slot
            //is it to the left or to the right? which will create less harm 
            if(i<chosenTimeIndex) apStart = i;//will only increase
            if(i>chosenTimeIndex) {
                apEnd = i-1;//up to and including
                break;//there's no pt checking after this
            }
        }
    }
    var stuStart = apStart;//4 set to use in workHere starts at this index
    //we only rly need stuStart in the else

    //if consecutive block containing target <= 4 then just assign all
    if(apEnd-apStart+1 <= 4){//bc apEnd is up to and including
        for(let i=apStart;i<=apEnd;i++){
            tenterSlotsGrid[chosenPersonIndex][i].status = TENTER_STATUS_CODES.SCHEDULED;
        }
    }
    //else get weights of each time slot in the consecutive block > 4 to figure out which to use
    else{
        var wsum = 0;
        var maxWeight = 0;
        
        var wsums = [0,0,0,0,0,0,0];//max poss size needed
        for(let i=apStart;i<=apEnd;i++){//figure out where the most weighted interval is
            //add weight to wsum, store for future reference
            wsum += workHere[i].weight;
            wsums[i-apStart]=wsum;
            if(i>apStart+3){
                if((wsum-wsums[i-apStart-4])>maxWeight) {maxWeight = (wsum-wsums[i-apStart-4]); stuStart = i;}
            }
            if(i==apStart+3){
                if(wsum>maxWeight) {maxWeight = wsum; stuStart = i;}
            }
        }
        for(let i=stuStart; i<=Math.min(stuStart+3, apEnd);i++){
            tenterSlotsGrid[chosenPersonIndex][i].status = TENTER_STATUS_CODES.SCHEDULED;
        }
    }
    let remainingSlots = slots;
    for(let i = stuStart; i<=Math.min(stuStart+3, apEnd); i++){//i is the timeIndex of each of the newly filled slots
        //any other variables to be changed specific to each time interval?
        var numberScheduledAtChosenTime = getNumberScheduledAtChosenTime(tenterSlotsGrid, i);
        var peopleNeeded = workHere[i].calculatePeopleNeeded();
        if (numberScheduledAtChosenTime >= peopleNeeded){
            remainingSlots = remainingSlots.filter((s) => (s.timeIndex != i));
        }
    }
    return remainingSlots;


}


/**
 * 
 * @param {Array<Array<import("./slots/tenterSlot").TenterSlot>>} tenterSlotsGrid 
 * @param {number} chosenTimeIndex 
 * @returns {number}
 */
function getNumberScheduledAtChosenTime(tenterSlotsGrid, chosenTimeIndex) {
    var personIndex = 0;
    var numberScheduledAtChosenTime = 0;
    while (personIndex < tenterSlotsGrid.length) {
        if (tenterSlotsGrid[personIndex][chosenTimeIndex].status == TENTER_STATUS_CODES.SCHEDULED){
            numberScheduledAtChosenTime = numberScheduledAtChosenTime + 1;
        }
        personIndex += 1;
    }
    return numberScheduledAtChosenTime;
}

/**
 * 
 * @param {import("./slots/tenterSlot").TenterSlot} chosenTenterSlot 
 * @param {Array<import("./person").Person>} people 
 */
function updateChosenPerson(chosenTenterSlot, people){
    var chosenPersonIndex = chosenTenterSlot.personIndex;
    var chosenPerson = people[chosenPersonIndex];
    var currentTime = chosenTenterSlot.isNight;

    if (currentTime){
        chosenPerson.nightScheduled += 1;
        chosenPerson.nightFree -= 1;
    }else{
        chosenPerson.dayScheduled += 1;
        chosenPerson.dayFree -= 1;
    }
}