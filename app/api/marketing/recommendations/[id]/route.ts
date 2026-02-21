import { NextRequest, NextResponse } from "next/server";
import { turso, executeOne } from "@/lib/turso";

// GET - get single recommendation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recommendation = await executeOne(
      "SELECT * FROM marketing_recommendations WHERE id = ?",
      [id]
    );

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error: any) {
    console.error("Failed to fetch recommendation:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - update recommendation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, dismissed_reason } = body;

    const now = Math.floor(Date.now() / 1000);

    let sql = "UPDATE marketing_recommendations SET status = ?";
    const queryParams: any[] = [status];

    if (status === "applied") {
      sql += ", applied_at = ?";
      queryParams.push(now);
    } else if (status === "dismissed") {
      sql += ", dismissed_at = ?, dismissed_reason = ?";
      queryParams.push(now, dismissed_reason || null);
    }

    sql += " WHERE id = ?";
    queryParams.push(id);

    await turso.execute({
      sql,
      args: queryParams,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update recommendation:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - delete recommendation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await turso.execute({
      sql: "DELETE FROM marketing_recommendations WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete recommendation:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
