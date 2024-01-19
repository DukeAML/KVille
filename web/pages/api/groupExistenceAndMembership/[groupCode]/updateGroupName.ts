import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../../auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { checkIfMemberIsInGroup } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { updateGroupName } from '@/lib/db/groupExistenceAndMembership/updateGroup';
import { UPDATE_GROUP_ERROR_CODES } from "@/lib/controllers/groupMembershipAndExistence/updateGroupController";


export default async function updateGroupNameAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const groupCode : string = req.query.groupCode? req.query.groupCode.toString() : INVALID_GROUP_CODE;
            const newGroupName = req.body.newGroupName;
            const userID = session.user.id;
            if (!checkIfMemberIsInGroup(groupCode, userID)){
                throw new Error(UPDATE_GROUP_ERROR_CODES.USER_NOT_IN_GROUP);
            }

            await updateGroupName(newGroupName, groupCode);
            res.status(200).json({newGroupName});
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}