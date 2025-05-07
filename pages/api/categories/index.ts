import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Category from "@/models/Category";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "GET") {
    const categories = await Category.find().lean().exec();
    return res.status(200).json(categories);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
