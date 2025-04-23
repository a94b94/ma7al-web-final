import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const cities = await User.distinct("city");
  res.status(200).json(cities.filter(Boolean));
}
