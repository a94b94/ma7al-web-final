// pages/api/store-info.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

type StoreInfoResponse = {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
};

function getFirstQueryString(v: string | string[] | undefined) {
  if (!v) return "";
  return Array.isArray(v) ? String(v[0] || "") : String(v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const storeId = getFirstQueryString(req.query.storeId).trim();

    // ✅ Helpers: قيم افتراضية آمنة (لا تكسر الواجهة)
    const fallback: StoreInfoResponse = {
      name: "اسم غير متوفر",
      logo: "",
      address: "",
      phone: "",
      email: "",
    };

    // ✅ إذا ما انرسل storeId: رجّع بيانات افتراضية بدل 400
    // هذا يخدم صفحات مثل Checkout أو أي صفحة قد تستدعي store-info بدون تحديد متجر
    if (!storeId) {
      return res.status(200).json(fallback);
    }

    const store = await User.findById(storeId).select(
      "storeName storeLogo address phone email"
    );

    if (!store) {
      return res.status(404).json({ error: "لم يتم العثور على المتجر" });
    }

    const payload: StoreInfoResponse = {
      name: store.storeName || fallback.name,
      logo: store.storeLogo || fallback.logo,
      address: store.address || fallback.address,
      phone: store.phone || fallback.phone,
      email: store.email || fallback.email,
    };

    return res.status(200).json(payload);
  } catch (error: any) {
    // لا تُرجع تفاصيل حساسة للمستخدم
    return res.status(500).json({ error: "فشل في جلب بيانات المتجر" });
  }
}
