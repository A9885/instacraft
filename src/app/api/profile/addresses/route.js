import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/requireAdmin";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { decodedToken, error } = await verifyAuth(request);
    if (error) return error;

    const customerRows = await db.query("SELECT id FROM customers WHERE firebase_uid = ?", [decodedToken.uid]);
    const customer = customerRows[0];

    if (!customer) {
      return NextResponse.json({ success: true, addresses: [] }, { status: 200 });
    }

    const addrRows = await db.query("SELECT * FROM customer_addresses WHERE customer_id = ?", [customer.id]);

    const addresses = addrRows.map((addr) => ({
      ...addr,
      _id: addr.id.toString(),
      isDefault: addr.is_default
    }));

    return NextResponse.json({ success: true, addresses }, { status: 200 });
  } catch (error) {
    console.error("Addresses GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { decodedToken, error } = await verifyAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    // Find the customer
    const customerRows = await db.query("SELECT id FROM customers WHERE firebase_uid = ?", [decodedToken.uid]);
    const customer = customerRows[0];

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Verify ownership and delete
    const result = await db.query(
      "DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?",
      [addressId, customer.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Address not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Addresses DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
