import { NextRequest, NextResponse } from "next/server";
import { executeQuery, turso } from "@/lib/turso";
import { v4 as uuidv4 } from "uuid";

// GET - seznam recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    let query = "SELECT * FROM marketing_recommendations";
    const params: any[] = [];

    if (status !== "all") {
      query += " WHERE status = ?";
      params.push(status);
    }

    query +=
      " ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, created_at DESC";

    const recommendations = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error("Failed to fetch recommendations:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - vytvoř nové recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { platform, type, priority, title, description, expected_impact } =
      body;

    if (!platform || !type || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: platform, type, title, description",
        },
        { status: 400 }
      );
    }

    const id = uuidv4();

    await turso.execute({
      sql: `INSERT INTO marketing_recommendations
       (id, platform, type, priority, title, description, expected_impact, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      args: [
        id,
        platform,
        type,
        priority || "medium",
        title,
        description,
        expected_impact || null,
      ],
    });

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error: any) {
    console.error("Failed to create recommendation:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
