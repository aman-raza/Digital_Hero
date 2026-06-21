import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

type CalculationPayload = {
  clientName: string;
  description: string;
  amount: number;
  gstRate: number;
  mode: "exclusive" | "inclusive";
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
};

function isPayload(value: unknown): value is CalculationPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.clientName === "string" &&
    typeof payload.description === "string" &&
    typeof payload.amount === "number" &&
    typeof payload.gstRate === "number" &&
    (payload.mode === "exclusive" || payload.mode === "inclusive") &&
    typeof payload.subtotal === "number" &&
    typeof payload.gstAmount === "number" &&
    typeof payload.grandTotal === "number"
  );
}

export async function GET() {
  const db = await getDatabase();

  if (!db) {
    return NextResponse.json({
      connected: false,
      calculations: []
    });
  }

  const calculations = await db
    .collection("gst_calculations")
    .find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray();

  return NextResponse.json({
    connected: true,
    calculations: calculations.map((item) => ({
      id: item._id.toString(),
      clientName: item.clientName,
      description: item.description,
      amount: item.amount,
      gstRate: item.gstRate,
      mode: item.mode,
      subtotal: item.subtotal,
      gstAmount: item.gstAmount,
      grandTotal: item.grandTotal,
      createdAt: item.createdAt
    }))
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (!isPayload(payload)) {
    return NextResponse.json({ error: "Invalid calculation payload." }, { status: 400 });
  }

  const db = await getDatabase();

  if (!db) {
    return NextResponse.json(
      {
        connected: false,
        message: "Calculation is valid. Add MONGODB_URI to save it on the server."
      },
      { status: 202 }
    );
  }

  const document = {
    ...payload,
    clientName: payload.clientName.trim() || "Untitled client",
    description: payload.description.trim() || "GST calculation",
    createdAt: new Date()
  };

  const result = await db.collection("gst_calculations").insertOne(document);

  return NextResponse.json({
    connected: true,
    id: result.insertedId.toString(),
    calculation: {
      ...document,
      id: result.insertedId.toString()
    }
  });
}
