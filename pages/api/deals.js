import dbConnect from "../../lib/mongodb";
import Deal from "../../models/Deal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deals = await Deal.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(deals);
  } catch (error) {
    console.error("Error loading saved deals:", error);
    return res.status(500).json({ message: "Server error" });
  }
}