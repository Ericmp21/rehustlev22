import dbConnect from "../../lib/mongodb";
import Deal from "../../models/Deal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const session = await getServerSession(req, res, authOptions);
    console.log("🔍 SESSION CHECK:", JSON.stringify(session, null, 2));

    if (!session) {
      return res.status(401).json({ message: "Unauthorized - No session" });
    }

    const userId = session.user.id;
    console.log("🔍 USER ID:", userId, "TYPE:", typeof userId);

    // Log Deal schema for debugging
    console.log("🔧 DEAL SCHEMA:", Deal.schema.paths.userId);
    
    try {
      const deals = await Deal.find({ userId }).sort({ createdAt: -1 });
      console.log("📦 DEALS FOUND:", deals);
      return res.status(200).json(deals);
    } catch (queryError) {
      console.error("💥 QUERY ERROR:", queryError);
      const errorDetails = {
        message: "Error querying deals", 
        details: queryError.message,
        path: queryError.path,
        value: queryError.value,
        kind: queryError.kind
      };
      return res.status(500).json(errorDetails);
    }
  } catch (error) {
    console.error("🔥 Server error in /api/deals:", error);
    return res.status(500).json({ 
      message: "🔥 Internal Server Error", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}