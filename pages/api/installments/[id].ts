import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
}
