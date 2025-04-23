
import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const categories = await Category.find();
    return res.status(200).json(categories);
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
