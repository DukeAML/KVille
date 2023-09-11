// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { auth } from '../../../common/src/db/firebase_config'

type Data = {
  name: string,
  id : string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(auth.currentUser);
  const id = auth.currentUser ? auth.currentUser?.uid : "not logged in";
  res.status(200).json({ name: 'John Doe', id : id })
}

