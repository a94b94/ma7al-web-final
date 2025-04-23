import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();

  const { id } = req.query;

  try {
    await LocalInvoice.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "فشل في الحذف" });
  }
}
