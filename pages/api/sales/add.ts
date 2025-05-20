// pages/api/sales/add.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import Sale from '@/models/Sale';
import Product from '@/models/Product';

interface ProductType {
  _id: string;
  name: string;
  stock: number;
  price: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId, paymentType, items, downPayment, installmentsCount, dueDate } = req.body;

  if (!customerId || !paymentType || !items || items.length === 0) {
    return res.status(400).json({ error: 'بيانات غير مكتملة' });
  }

  await connectDB();

  try {
    // ✅ تحقق من المخزون وتحديثه
    for (const item of items) {
      const product = await Product.findById(item.productId) as HydratedDocument<ProductType>;
      if (!product) throw new Error('المنتج غير موجود');
      if (product.stock < item.quantity) {
        throw new Error(`الكمية غير كافية للمنتج: ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ حساب المجموع الكلي
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // ✅ توليد الأقساط إن وجد
    let installments = [];
    if (paymentType === 'installment') {
      const remaining = total - downPayment;
      const monthlyAmount = Math.ceil(remaining / installmentsCount);
      const startDate = new Date(dueDate);

      for (let i = 0; i < installmentsCount; i++) {
        const due = new Date(startDate);
        due.setMonth(due.getMonth() + i); // كل شهر قسط
        installments.push({
          date: due,
          amount: monthlyAmount,
          paid: false,
        });
      }
    }

    // ✅ إنشاء الفاتورة
    const sale = new Sale({
      customer: new mongoose.Types.ObjectId(customerId),
      items: items.map((item: any) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: item.price,
      })),
      paymentType,
      downPayment: paymentType === 'installment' ? downPayment : 0,
      installmentsCount: paymentType === 'installment' ? installmentsCount : 0,
      dueDate: paymentType === 'installment' ? dueDate : null,
      installments, // ✅ الأقساط هنا
      total,
      paid: paymentType === 'cash' ? total : downPayment,
      createdAt: new Date(),
    });

    await sale.save();

    return res.status(200).json({ success: true, sale });
  } catch (error: any) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: error.message || 'حدث خطأ داخلي' });
  }
}
