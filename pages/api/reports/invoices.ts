import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const year = parseInt(req.query.year as string);

  if (!year || isNaN(year)) {
    return res.status(400).json({ success: false, message: "يرجى تحديد سنة صحيحة" });
  }

  try {
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          type: 1,
          total: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
          cashTotal: {
            $sum: {
              $cond: [{ $eq: ["$type", "cash"] }, "$total", 0],
            },
          },
          installmentTotal: {
            $sum: {
              $cond: [{ $eq: ["$type", "installment"] }, "$total", 0],
            },
          },
        },
      },
      {
        $sort: { _id: <1>1 }, // ✅ fix
      },
    ];

    const result = await LocalInvoice.aggregate(pipeline);

    const fullYear = Array.from({ length: 12 }, (_, i) => {
      const found = result.find((r) => r._id === i + 1);
      return {
        month: i + 1,
        count: found?.count || 0,
        cash: found?.cashTotal || 0,
        installment: found?.installmentTotal || 0,
      };
    });

    res.json({ success: true, data: fullYear });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الحسابات", error: err });
  }
}
