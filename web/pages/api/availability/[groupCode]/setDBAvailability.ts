import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../../auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { checkIfMemberIsInGroup } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { SET_SCHEDULE_ERROR_CODES } from "@/lib/controllers/scheduleController";
import { setDBAvailability } from '@/lib/db/availability';
import { JSONToAvailabilitySlots } from "@/lib/controllers/availabilityController";


export default async function setAvailabilityAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const groupCode : string = req.query.groupCode? req.query.groupCode.toString() : INVALID_GROUP_CODE;
            const userID = session.user.id;
            if (!checkIfMemberIsInGroup(groupCode, userID)){
                throw new Error(SET_SCHEDULE_ERROR_CODES.USER_NOT_IN_GROUP);
            }

            const jsonData = req.body.availability;
            setDBAvailability(groupCode, userID, JSONToAvailabilitySlots(jsonData));
            res.status(200).json(jsonData);
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}