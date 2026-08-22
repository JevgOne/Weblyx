import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth/require-auth";
import { isWritableLeadStatus } from "@/lib/leads/status";
import { logActivity } from "@/lib/activity-log";

/**
 * GET /api/leads/[id]
 * Get lead by ID (Admin only — the row carries personal data)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const result = await turso.execute({
      sql: "SELECT * FROM leads WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Lead nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Chyba při načítání lead" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete lead by ID (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    // Check if lead exists
    const checkResult = await turso.execute({
      sql: "SELECT id FROM leads WHERE id = ?",
      args: [id],
    });

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Lead nenalezen" },
        { status: 404 }
      );
    }

    // Delete lead
    await turso.execute({
      sql: "DELETE FROM leads WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Lead úspěšně smazán",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Chyba při mazání lead" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/[id]
 * Update lead (status, assignedTo) - Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const { status, assignedTo } = body;

    // Check if lead exists
    const checkResult = await turso.execute({
      sql: "SELECT id, status FROM leads WHERE id = ?",
      args: [id],
    });

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Lead nenalezen" },
        { status: 404 }
      );
    }

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const args: any[] = [];

    if (status !== undefined) {
      if (!isWritableLeadStatus(status)) {
        return NextResponse.json(
          { error: "Neplatný stav poptávky" },
          { status: 400 }
        );
      }
      updates.push("status = ?");
      args.push(status);
    }

    if (assignedTo !== undefined) {
      updates.push("assigned_to = ?");
      args.push(assignedTo);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Žádná pole k aktualizaci" },
        { status: 400 }
      );
    }

    updates.push("updated_at = unixepoch()");

    // Add id to args (for WHERE clause)
    args.push(id);

    // Update lead
    await turso.execute({
      sql: `UPDATE leads SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    if (status !== undefined) {
      const previous = checkResult.rows[0].status;
      await logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: "lead_updated",
        entityType: "lead",
        entityId: id,
        details: `Stav poptávky: ${previous} → ${status}`,
      });
    }

    // Return updated lead
    const result = await turso.execute({
      sql: "SELECT * FROM leads WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Chyba při aktualizaci lead" },
      { status: 500 }
    );
  }
}
