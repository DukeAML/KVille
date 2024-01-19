import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { fetchGroups } from '@/lib/db/groupExistenceAndMembership/groupMembership';


export default async function fetchGroupsAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const userID = session.user.id;
            const groups = await fetchGroups(userID);
            res.status(200).json({groups});
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}
