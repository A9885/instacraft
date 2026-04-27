import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { error, decodedToken } = await requireUser(request);
    if (error) return error;

    const rows = await db.query(
      "SELECT cart, wishlist FROM customers WHERE firebase_uid = ?",
      [decodedToken.uid]
    );
    const customer = rows[0];

    return NextResponse.json({
      success: true,
      cart: customer?.cart || [],
      wishlist: customer?.wishlist || [],
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/profile/state Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { error, decodedToken } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    const updateFields = [];
    const values = [];

    if (Array.isArray(body.cart)) {
      updateFields.push("cart = ?");
      values.push(JSON.stringify(body.cart));
    }
    if (Array.isArray(body.wishlist)) {
      updateFields.push("wishlist = ?");
      values.push(JSON.stringify(body.wishlist));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: true, message: "No valid array payloads provided" }, { status: 200 });
    }

    values.push(decodedToken.uid);
    const result = await db.query(
      `UPDATE customers SET ${updateFields.join(", ")}, updated_at = NOW(3) WHERE firebase_uid = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Customer profile not found. Handshake sync required." }, { status: 404 });
    }

    const updatedRows = await db.query(
      "SELECT cart, wishlist FROM customers WHERE firebase_uid = ?",
      [decodedToken.uid]
    );
    const updatedCustomer = updatedRows[0];

    return NextResponse.json({
      success: true,
      cart: updatedCustomer.cart,
      wishlist: updatedCustomer.wishlist,
    }, { status: 200 });

  } catch (error) {
    console.error("PUT /api/profile/state Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
