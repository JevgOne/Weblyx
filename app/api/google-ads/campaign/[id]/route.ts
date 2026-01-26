import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignDetails,
  updateCampaignStatus,
} from "@/lib/google-ads";

export const dynamic = "force-dynamic";

// Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignDetails(id);

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch campaign",
      },
      { status: 500 }
    );
  }
}

// Update campaign (status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      const validStatuses = ["ENABLED", "PAUSED", "REMOVED"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }

      const result = await updateCampaignStatus(id, body.status);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: "No valid update fields provided" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update campaign",
      },
      { status: 500 }
    );
  }
}
