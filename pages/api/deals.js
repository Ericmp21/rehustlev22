import dbConnect from "../../lib/mongodb";
import Deal from "../../models/Deal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const session = await getServerSession(req, res, authOptions);
    console.log("Session:", session);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id;

    const deals = await Deal.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(deals);
  } catch (error) {
    console.error("Server error in /api/deals:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}