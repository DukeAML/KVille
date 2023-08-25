

import {olsonParams} from "../../data/olsonParams.js" 
import {FinalTouches} from "./finalTouches.js";
import {TenterSlot} from "./tenterSlot.js";
import {ScheduledSlot} from "./scheduledSlot.js";
import {Person} from "./person.js";

export class Fairness{

    /**
     * This method attempts to ensure fairness by making the difference in hours between the 
     * tenter with the most hours and tenter with the least hours is below the threshold specified in data/olsonParams.json
     * @param {Array<ScheduledSlot>} combinedGrid is a 1d array of objects that each have an array of ids corresponding to the tenters for that shift
     * @param {Array<Person>} people (array of Person objects)
     * @param {Array<Array<TenterSlot>>} scheduleGrid (array of arrays of Slot objects)
     * returns nothing, modifies everything place. 
     */
    static ensureFairness(combinedGrid, people, scheduleGrid){
        var i = 0; 
        var sorted_people = Array(people.length);
        for (var i = 0; i < people.length; i++){
            sorted_people[i] = people[i];
        }

        while ((i < 30) && (this.maxHourRatio(people) > olsonParams["MAX_HOUR_RATIO"])){
            //find a shift to give from the person with most hours to person with least hours
            sorted_people = sorted_people.sort(this.hoursRank);
            var recipients = [this.findNumID(sorted_people[0], scheduleGrid),
                this.findNumID(sorted_people[1], scheduleGrid)];
            for (var rank = 0; rank < 2; rank++){
                var donor_person = sorted_people[sorted_people.length - rank - 1];
                var donor = this.findNumID(donor_person, scheduleGrid);
                if (this.findAndDonateShift(donor, recipients, scheduleGrid, combinedGrid, people))
                    break;  
            }
            i += 1;
        }

    }

    /**
     * 
     * @param {int} donor (int)
     * @param {int} recipient (int)
     * @param {Array<Array<TenterSlot>>} scheduleGrid 
     * @param {Array<ScheduledSlot>} combinedGrid 
     * @param {Array<Person>} people
     */
    static findAndDonateShift(donor, recipients, scheduleGrid, combinedGrid, people){
        //find a day shift of 1.5hours or more that can be given from donor to recipient
        var contiguous_slots = 0;
        for (var i = 0; i < scheduleGrid[0].length; i++){
            if ((scheduleGrid[donor][i].status == "Scheduled") && !(scheduleGrid[donor][i].isNight)){
                contiguous_slots += 1;

            } else{
    
                if (contiguous_slots >= 3){
                    //check if a recipient can take this slot
                    for (var r = 0; r < recipients.length; r++){
                        var recipient = recipients[r];
                        if (this.canScheduleSlot(recipient, scheduleGrid, i - contiguous_slots, i-1)){
                            for (var time = i - contiguous_slots; time < i; time++){
                                FinalTouches.shiftReplacement(people, scheduleGrid, combinedGrid, 
                                    donor, recipient, time);
                            }
                        return true;
                        }
                    }
                }
                contiguous_slots = 0;
            }
        }
        return false;
    }


    /**
     * Helper method
     * @param {int} recipient 
     * @param {Array<Array<TenterSlot>>} scheduleGrid 
     * @param {int} beginning 
     * @param {int} end 
     * @returns {boolean}
     */
    static canScheduleSlot(recipient, scheduleGrid, beginning, end){
        //basically check if recipient is free from beginning to end
        var canSchedule = true;
        for (var time = beginning; time <= end; time++){
            if (!(scheduleGrid[recipient][time].status == "Available")){
                return false;
            }
        }

        //now check if they are scheduled for any slots close by. If so return false
        for (var time = beginning; time >= Math.max(beginning - 4, 0); time--){
            if ((scheduleGrid[recipient][time].status == "Scheduled") && !(scheduleGrid[recipient][time].isNight)){
                return false;
            }
        }
        for (var time = end; time < Math.min(end + 5, scheduleGrid[recipient].length); time++){
            if ((scheduleGrid[recipient][time].status == "Scheduled") && !(scheduleGrid[recipient][time].isNight)){
                return false;
            }
        }

        return true;
    }


    /**
     * Finding the ratio of most scheduled hours to least hours across all people
     * @param {Array<Person>} people 
     * @returns {float}
     */
    static maxHourRatio(people){
        var maxHours = 0;
        var minHours = 999999;
        for (var i = 0; i < people.length; i++){
            var hours = (people[i].dayScheduled + people[i].nightScheduled) /2;
            if (hours > maxHours){
                maxHours = hours;
            } 
            if (hours < minHours){
                minHours = hours;
            }
        }
        return (1 + (maxHours - minHours)/maxHours);
    }

    /**
     * Helper method, returns the difference in scheduled hours between two people
     * @param {Person} p1 
     * @param {Person} p2 
     * @returns {float}
     */
    static hoursRank(p1, p2){
        return (p1.dayScheduled + p1.nightScheduled - p2.dayScheduled - p2.nightScheduled);
    }

    /**
     * Find which row in the scheduleGrid corresponds to this person
     * @param {Person} person 
     * @param {Array<Array<TenterSlot>>} scheduleGrid 
     * @returns 
     */
    static findNumID(person, scheduleGrid){
        for (var i = 0; i < scheduleGrid.length; i++){
            if (scheduleGrid[i][0].personID == person.id){
                return i;
            }
        }
    }


}
