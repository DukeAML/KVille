import { NextApiRequest, NextApiResponse } from 'next';
import {getServerSession} from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import { tryToCreateGroup } from '@/lib/db/groupExistenceAndMembership/createGroup';
import { getErrorMessage } from '@/lib/db/errorHandling';


export default async function createGroupAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const {groupName, tentType} = req.body;
            const userID = session.user.id;
            console.log(userID);
            console.log(groupName);
            const groupCode = await tryToCreateGroup(groupName, tentType, userID);
            console.log(groupCode);
            res.status(200).json({groupCode});
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}
