import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../../auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { fetchGroupData } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";

export default async function fetchGroupDataAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const groupCode = req.query.groupCode? req.query.groupCode.toString() : INVALID_GROUP_CODE;
            const groupData = await fetchGroupData(groupCode);
            res.status(200).json({...groupData});
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}