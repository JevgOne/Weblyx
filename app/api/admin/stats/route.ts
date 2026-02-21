import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Single batch query - 1 round trip instead of 4
    const results = await turso.batch([
      { sql: "SELECT COUNT(*) as total, SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published FROM portfolio", args: [] },
      { sql: "SELECT COUNT(*) as total, SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published FROM blog_posts", args: [] },
      { sql: "SELECT COUNT(*) as total, SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published, SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured FROM reviews", args: [] },
      { sql: "SELECT COUNT(*) as total FROM leads", args: [] },
    ]);

    const portfolio = results[0].rows[0];
    const blog = results[1].rows[0];
    const reviews = results[2].rows[0];
    const leads = results[3].rows[0];

    return NextResponse.json({
      success: true,
      data: {
        portfolio: { total: Number(portfolio.total) || 0, published: Number(portfolio.published) || 0 },
        blog: { total: Number(blog.total) || 0, published: Number(blog.published) || 0 },
        reviews: { total: Number(reviews.total) || 0, published: Number(reviews.published) || 0, featured: Number(reviews.featured) || 0 },
        leads: { total: Number(leads.total) || 0 },
      },
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
