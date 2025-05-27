import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  try {
    await connectToDatabase();

    const { category } = req.query;

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'يجب تحديد القسم كـ string' });
    }

    const products = await Product.find({ category }).lean();

    return res.status(200).json(products);
  } catch (error: any) {
    console.error('❌ خطأ في API جلب المنتجات حسب القسم:', error.message);
    return res.status(500).json({ error: '⚠️ فشل في جلب المنتجات' });
  }
}
