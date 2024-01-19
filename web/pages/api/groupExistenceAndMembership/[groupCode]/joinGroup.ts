import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { getErrorMessage } from '@/lib/db/errorHandling';
import { authOptions } from '../../auth/[...nextauth]';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { tryToJoinGroup } from '@/lib/db/groupExistenceAndMembership/joinGroup';

export default async function joinGroupAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const groupCode = req.query.groupCode? req.query.groupCode.toString() : INVALID_GROUP_CODE;
            const userID = session.user.id;
            const groupDescription = await tryToJoinGroup(groupCode, userID);
            res.status(200).json({...groupDescription});
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}