import { NextApiRequest, NextApiResponse } from 'next';
import { getErrorMessage } from '@/lib/db/errorHandling';
import { tryToRegister } from '@/lib/db/auth/register';


export default async function registerAPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {username, password} = req.body;
        let newUserID = await tryToRegister(username, password);
        res.status(200).json({userID : newUserID});
        
    } catch (error) {
        let errorMsg = getErrorMessage(error);
        res.status(500).json({ error: errorMsg});
    }
}