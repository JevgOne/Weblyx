import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

// GET - Retrieve all leads
export async function GET(request: NextRequest) {
  try {
    const result = await turso.execute(
      'SELECT * FROM leads ORDER BY created_at DESC'
    );

    const leads = result.rows.map((row: any) => {
      // Parse JSON fields
      const parseJSON = (field: any) => {
        if (!field) return null;
        try {
          return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
          return field;
        }
      };

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        company: row.company,
        projectType: row.project_type,
        projectTypeOther: row.project_type_other,
        businessDescription: row.business_description,
        projectDetails: parseJSON(row.project_details),
        features: parseJSON(row.features),
        designPreferences: parseJSON(row.design_preferences),
        budgetRange: row.budget_range,
        timeline: row.timeline,
        status: row.status,
        source: row.source,
        aiDesignSuggestion: parseJSON(row.ai_design_suggestion),
        aiBrief: parseJSON(row.ai_brief),
        aiGeneratedAt: row.ai_generated_at,
        briefGeneratedAt: row.brief_generated_at,
        proposalEmailSent: row.proposal_email_sent === 1,
        proposalEmailSentAt: row.proposal_email_sent_at,
        createdAt: new Date(row.created_at * 1000).toISOString(),
        updatedAt: new Date(row.updated_at * 1000).toISOString(),
        created: new Date(row.created_at * 1000).toISOString(),
      };
    });

    console.log(`✅ Retrieved ${leads.length} leads from Turso`);

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leads'
      },
      { status: 500 }
    );
  }
}

// PATCH - Update lead status or details
export async function PATCH(request: NextRequest) {
  try {
    const { leadId, updates } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Build UPDATE query dynamically based on updates provided
    const setClauses: string[] = [];
    const args: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      // Convert camelCase to snake_case for database columns
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      setClauses.push(`${dbKey} = ?`);

      // Stringify objects/arrays for JSON fields
      if (typeof value === 'object' && value !== null) {
        args.push(JSON.stringify(value));
      } else {
        args.push(value);
      }
    }

    // Always update updated_at
    setClauses.push('updated_at = unixepoch()');

    const sql = `UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`;
    args.push(leadId);

    await turso.execute({ sql, args });

    console.log(`✅ Updated lead ${leadId} in Turso`);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update lead'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    await turso.execute({
      sql: 'DELETE FROM leads WHERE id = ?',
      args: [leadId],
    });

    console.log(`✅ Deleted lead ${leadId} from Turso`);

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete lead'
      },
      { status: 500 }
    );
  }
}
