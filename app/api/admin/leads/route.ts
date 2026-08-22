import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { isWritableLeadStatus } from '@/lib/leads/status';

// GET - Retrieve all leads
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
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
        configuration: parseJSON(row.configuration),
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

    return NextResponse.json({
      success: true,
      data: leads,
    }, {
      headers: {
        // No caching: the panel refetches right after a status change and a
        // cached copy would flip the row back to its previous state.
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leads'
      },
      { status: 500 }
    );
  }
}

/**
 * Columns the admin UI may write, mapped from the camelCase keys it sends.
 * The column name used to be derived from the request key, which put caller
 * input straight into the SQL string.
 */
const UPDATABLE_COLUMNS: Record<string, string> = {
  status: 'status',
  assignedTo: 'assigned_to',
  budgetRange: 'budget_range',
  timeline: 'timeline',
  projectType: 'project_type',
  projectTypeOther: 'project_type_other',
  businessDescription: 'business_description',
  projectDetails: 'project_details',
  features: 'features',
  designPreferences: 'design_preferences',
  configuration: 'configuration',
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  proposalEmailSent: 'proposal_email_sent',
  proposalEmailSentAt: 'proposal_email_sent_at',
};

// PATCH - Update lead status or details
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
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

    for (const [key, value] of Object.entries(updates || {})) {
      const column = UPDATABLE_COLUMNS[key];
      if (!column) {
        return NextResponse.json(
          { success: false, error: `Unknown field: ${key}` },
          { status: 400 }
        );
      }

      if (column === 'status' && !isWritableLeadStatus(value)) {
        return NextResponse.json(
          { success: false, error: 'Invalid lead status' },
          { status: 400 }
        );
      }

      setClauses.push(`${column} = ?`);

      // Stringify objects/arrays for JSON fields
      if (typeof value === 'object' && value !== null) {
        args.push(JSON.stringify(value));
      } else {
        args.push(value as any);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Always update updated_at
    setClauses.push('updated_at = unixepoch()');

    const sql = `UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`;
    args.push(leadId);

    await turso.execute({ sql, args });

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update lead'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
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

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete lead'
      },
      { status: 500 }
    );
  }
}
