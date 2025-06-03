// pages/api/store-info.ts
import type { NextApiRequest, NextApiResponse } from "next";

// بيانات المتجر ثابتة (يمكن تستبدلها بجلب من قاعدة بيانات)
const storeInfo = {
  name: "Ma7al Store",
  address: "العراق، بغداد",
  phone: "07700000000",
  email: "info@ma7alstore.com",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.status(200).json(storeInfo);
}
