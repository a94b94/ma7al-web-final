import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const stores = await User.find({}, "storeName storeLogo city _id");
  res.status(200).json(stores);
}
