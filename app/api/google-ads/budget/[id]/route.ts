import { NextRequest, NextResponse } from "next/server";
import { updateCampaignBudget } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

// Update budget amount
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof body.amountCzk !== "number" || body.amountCzk <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    const result = await updateCampaignBudget(id, body.amountCzk);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update budget",
      },
      { status: 500 }
    );
  }
}
