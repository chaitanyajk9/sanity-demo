import { NextRequest, NextResponse } from "next/server";
import { detectCountry } from "@/lib/country-detector";

export async function GET(request: NextRequest) {
  return NextResponse.json(detectCountry(request));
}
