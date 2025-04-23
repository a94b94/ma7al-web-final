import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { category } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'يجب تحديد القسم' });
  }

  const products = await Product.find({ category });
  res.status(200).json(products);
}
