import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../../auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { checkIfMemberIsInGroup, fetchGroupData, fetchGroups, getGroupMembersByGroupCode } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { updateGroupName } from '@/lib/db/groupExistenceAndMembership/updateGroup';
import { UPDATE_GROUP_ERROR_CODES } from "@/lib/controllers/groupMembershipAndExistence/updateGroupController";
import { fetchGroupSchedule, setGroupScheduleInDB } from '@/lib/db/schedule/schedule';
import { JSONToScheduleData } from "@/lib/controllers/scheduleController";
import { scheduleDataToJson } from "@/lib/controllers/scheduleController";
import { SET_SCHEDULE_ERROR_CODES } from "@/lib/controllers/scheduleController";


export default async function setGroupScheduleAPI(req: NextApiRequest, res: NextApiResponse) {
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

            const jsonData = req.body.newSchedule;
            setGroupScheduleInDB(groupCode, JSONToScheduleData(jsonData));
            res.status(200).json(jsonData);
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}