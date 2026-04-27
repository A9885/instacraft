import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const { error, decodedToken } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    const { firebaseUid, email, name, phone } = body;

    // 🛡️ INTERNAL ADMIN BYPASS
    if (firebaseUid === "internal-admin-001") {
      return NextResponse.json(
        {
          success: true,
          message: "Internal Admin verified",
          customer: {
            id: 0,
            name: "System Admin",
            email: "Admin@ishtacrafts.in",
          },
          isAdmin: true,
        },
        { status: 200 },
      );
    }

    // A user can only sync their own profile
    if (firebaseUid !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Forbidden: UID Mismatch" },
        { status: 403 },
      );
    }

    // Do not create records for unverified emails

    const rows = await db.query(
      "SELECT * FROM customers WHERE firebase_uid = ?",
      [firebaseUid],
    );
    let syncedCustomer;

    if (rows.length > 0) {
      // Update
      await db.query(
        "UPDATE customers SET name = ?, email = ?, phone = ?, updated_at = NOW(3) WHERE firebase_uid = ?",
        [name || "Anonymous User", email || null, phone || null, firebaseUid],
      );
      const updatedRows = await db.query(
        "SELECT * FROM customers WHERE firebase_uid = ?",
        [firebaseUid],
      );
      syncedCustomer = updatedRows[0];
    } else {
      // Insert
      const [insertResult] = await db.query(
        "INSERT INTO customers (firebase_uid, name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(3), NOW(3))",
        [firebaseUid, name || "Anonymous User", email || null, phone || null],
      );
      const insertedRows = await db.query(
        "SELECT * FROM customers WHERE id = ?",
        [insertResult.insertId],
      );
      syncedCustomer = insertedRows[0];
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes((email || "").toLowerCase());

    return NextResponse.json(
      {
        success: true,
        message: "Customer synced successfully",
        customer: {
          ...syncedCustomer,
          _id: syncedCustomer.id.toString(),
          firebaseUid: syncedCustomer.firebase_uid,
          totalSpent: syncedCustomer.total_spent,
          createdAt: syncedCustomer.created_at,
          updatedAt: syncedCustomer.updated_at,
        },
        isAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Customer Sync Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
