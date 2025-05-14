// pages/api/products/category/[slug].ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product'; // تأكد من أنه يمثل InventoryProduct إن كنت تستخدم المخزن

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectToDatabase();

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'القسم غير صالح' });
  }

  try {
    const products = await Product.find({
      category: slug,
      isPublished: true, // ✅ عرض فقط المنتجات المنشورة
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return res.status(500).json({ error: 'فشل في جلب المنتجات من السيرفر' });
  }
}
