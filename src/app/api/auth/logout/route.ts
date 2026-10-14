import { deleteCurrentSession } from "@/lib/auth";
import { jsonError, verifyRequestOrigin } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  await deleteCurrentSession();
  return NextResponse.json({ message: "Anda telah keluar." });
}
