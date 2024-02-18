// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { auth } from '@/lib/db/firebase_config';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { updateUsername } from '@/lib/db/updateUsername';
import { useMutationToUpdateUsername } from '@/lib/hooks/updateUsernameHooks';



export default async function updateUsernameAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user ){
            res.status(401);
            throw new Error("You must be logged in to do this");
        } else {
            const userID = session.user.id;
            const jsonData = req.body;
            const newUsername = jsonData.newUsername;
            await updateUsername(userID, newUsername);
            res.status(200).json(jsonData);
        }
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}
