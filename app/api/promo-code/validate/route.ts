import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // TODO: Migrate promo_codes to Turso if this feature is needed
    // For now, promo code validation is disabled
    return NextResponse.json(
      { error: "Promo kódy momentálně nejsou dostupné." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Promo code validation error:", error);
    return NextResponse.json(
      { error: "Došlo k chybě při validaci kódu." },
      { status: 500 }
    );
  }
}
