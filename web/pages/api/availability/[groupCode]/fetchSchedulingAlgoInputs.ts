import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../../auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { checkIfMemberIsInGroup } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { JSONToScheduleData } from "@/lib/controllers/scheduleController";
import { FETCH_SCHEDULE_ERROR_CODES } from "@/lib/controllers/scheduleController";
import { firestore } from '@/lib/db/firebase_config';
import { getNumSlotsBetweenDates } from '@/lib/calendarAndDatesUtils/datesUtils';
import { Person } from '@/lib/schedulingAlgo/person';
import { TenterSlot } from '@/lib/schedulingAlgo/slots/tenterSlot';
import { availabilitiesToSlots, dayNightFree } from '@/lib/schedulingAlgo/externalInterface/algoInputCleansing';
import { personToJSON, tenterSlotToJSON } from '@/lib/schedulingAlgo/externalInterface/createGroupSchedule';

export default async function fetchSchedulingAlgoInputsAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const groupCode : string = req.query.groupCode? req.query.groupCode.toString() : INVALID_GROUP_CODE;
            const userID = session.user.id;
            if (!checkIfMemberIsInGroup(groupCode, userID)){
                throw new Error(FETCH_SCHEDULE_ERROR_CODES.USER_NOT_IN_GROUP);
            }

            const oldSchedule = JSONToScheduleData(req.body.oldSchedule);
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
            const tentType : string = req.body.tentType;
            var people : Person[] = []
            var tenterSlotsGrid : TenterSlot[][] = []

            let inRangeHours = oldSchedule.getHoursPerPersonInDateRange(startDate, endDate);
            let fullScheduleHours = oldSchedule.getHoursPerPersonWholeSchedule();
            let dayHoursPerPersonInRange = inRangeHours.dayHoursPerPerson;
            let nightHoursPerPersonInRange = inRangeHours.nightHoursPerPerson;
            let dayHoursPerPersonEntire = fullScheduleHours.dayHoursPerPerson;
            let nightHoursPerPersonEntire = fullScheduleHours.nightHoursPerPerson;
            await firestore
                .collection('groups') 
                .doc(groupCode)
                .collection('members')
                .get()
                .then((groupMembers) => {
                    groupMembers.forEach((tenterInGroup) => {
                        var id = tenterInGroup.id;
                        if (oldSchedule.IDToNameMap.has(id)){
                            var name = oldSchedule.IDToNameMap.get(id);
                            if (name !== undefined){
                                var fullAvailability = tenterInGroup.data().availability;
                                var fullAvailabilityStartDate = tenterInGroup.data().availabilityStartDate.toDate();
                                var numSlotsInRange = getNumSlotsBetweenDates(startDate, endDate);
                                var rangeStartOffset = getNumSlotsBetweenDates(fullAvailabilityStartDate, startDate);
                                var availabilityInRange = fullAvailability.slice(rangeStartOffset, rangeStartOffset+numSlotsInRange);
                                var availabilityInRangeStartDate = startDate;

                                var user_slots = availabilitiesToSlots(id, availabilityInRange, availabilityInRangeStartDate, tentType, people.length)
                                tenterSlotsGrid.push(user_slots); 

                                var {numFreeDaySlots, numFreeNightSlots} = dayNightFree(availabilityInRange, availabilityInRangeStartDate);
                                var person = new Person(id, name, numFreeDaySlots, numFreeNightSlots, 
                                    dayHoursPerPersonEntire[name] - dayHoursPerPersonInRange[name], nightHoursPerPersonEntire[name] - nightHoursPerPersonInRange[name]);
                                people.push(person);
                            }
                        }
                    });
                });

            res.status(200).json({
                people : people.map((person) => personToJSON(person)),
                tenterSlotsGrid : tenterSlotsGrid.map((slotsForTenter) => slotsForTenter.map((slot) => tenterSlotToJSON(slot)))
            });
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}