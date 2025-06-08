// pages/api/sales/add.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Notification from '@/models/Notification'; // ⬅️ لإشعار داخلي

interface ProductType {
  _id: string;
  name: string;
  stock: number;
  price: number;
  storeId?: mongoose.Types.ObjectId;
}

interface Installment {
  date: Date;
  amount: number;
  paid: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Method Not Allowed' });
  }

  const { customerId, paymentType, items, downPayment, installmentsCount, dueDate } = req.body;

  if (!customerId || !paymentType || !items || items.length === 0) {
    return res.status(400).json({ error: '❗ بيانات غير مكتملة' });
  }

  await connectDB();

  try {
    const saleItems: any[] = [];
    let storeId: mongoose.Types.ObjectId | null = null;

    for (const item of items) {
      const product = await Product.findById(item.productId) as HydratedDocument<ProductType>;
      if (!product) throw new Error('❗ المنتج غير موجود');
      if (product.stock < item.quantity) {
        throw new Error(`❗ الكمية غير كافية للمنتج: ${product.name}`);
      }

      product.stock -= item.quantity;
      await product.save();

      saleItems.push({
        productId: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
      });

      if (!storeId && product.storeId) {
        storeId = product.storeId;
      }
    }

    const total = saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let installments: Installment[] = [];

    if (paymentType === 'installment') {
      if (!downPayment || downPayment < 0 || !installmentsCount || installmentsCount < 1) {
        return res.status(400).json({ error: "❗ بيانات التقسيط غير صالحة" });
      }

      const remaining = total - downPayment;
      const monthlyAmount = Math.ceil(remaining / installmentsCount);
      const startDate = new Date(dueDate);

      for (let i = 0; i < installmentsCount; i++) {
        const due = new Date(startDate);
        due.setMonth(due.getMonth() + i);
        installments.push({
          date: due,
          amount: monthlyAmount,
          paid: false,
        });
      }
    }

    const sale = new Sale({
      customer: new mongoose.Types.ObjectId(customerId),
      items: saleItems,
      paymentType,
      downPayment: paymentType === 'installment' ? downPayment : 0,
      installmentsCount: paymentType === 'installment' ? installmentsCount : 0,
      dueDate: paymentType === 'installment' ? dueDate : null,
      installments,
      total,
      paid: paymentType === 'cash' ? total : downPayment,
      storeId: storeId || undefined,
      createdAt: new Date(),
    });

    await sale.save();

    // ✅ إشعار داخلي (اختياري)
    await Notification.create({
      title: "✅ تم إنشاء فاتورة جديدة",
      message: `فاتورة جديدة بقيمة ${total} تمت إضافتها.`,
      type: "sale",
      seen: false,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, sale });
  } catch (error: any) {
    console.error("❌ خطأ أثناء إنشاء الفاتورة:", error);
    return res.status(500).json({ error: error.message || '⚠️ حدث خطأ داخلي' });
  }
}
