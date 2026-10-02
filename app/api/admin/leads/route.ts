import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { isWritableLeadStatus, leadStatusMeta } from '@/lib/leads/status';
import { recordChange } from '@/lib/changelog/server';

// GET - Retrieve all leads
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    const result = await turso.execute(
      'SELECT * FROM leads ORDER BY created_at DESC'
    );

    const auditsByLead = new Map<string, any[]>();
    try {
      const audits = await turso.execute(
        `SELECT id, lead_id, url, score, metrics, issue_count, status, created_at
           FROM audits WHERE lead_id IS NOT NULL ORDER BY created_at DESC`
      );
      for (const a of audits.rows as any[]) {
        let metrics: unknown = [];
        try {
          metrics = a.metrics ? JSON.parse(String(a.metrics)) : [];
        } catch {
          metrics = [];
        }
        const list = auditsByLead.get(String(a.lead_id)) ?? [];
        list.push({
          id: a.id,
          url: a.url,
          score: a.score === null ? null : Number(a.score),
          metrics,
          issueCount: a.issue_count === null ? null : Number(a.issue_count),
          status: a.status,
          createdAt: new Date(Number(a.created_at) * 1000).toISOString(),
        });
        auditsByLead.set(String(a.lead_id), list);
      }
    } catch (error) {
      // The enquiries matter more than the audits attached to them.
      console.error('Error fetching audits for leads:', error);
    }

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
        assignedTo: row.assigned_to,
        convertedToProjectId: row.converted_to_project_id,
        // Everything else the enquiry forms collect. These were stored and
        // never sent to the panel, so the detail showed a name and an e-mail
        // for someone who had filled in three screens.
        existingWebsite: row.existing_website,
        industry: row.industry,
        companySize: row.company_size,
        ico: row.ico,
        address: row.address,
        yearsInBusiness: row.years_in_business,
        usp: row.usp,
        customerAcquisition: row.customer_acquisition,
        topCompetitors: parseJSON(row.top_competitors),
        socialMedia: parseJSON(row.social_media),
        marketingTech: parseJSON(row.marketing_tech),
        projectGoal: row.project_goal,
        projectReason: row.project_reason,
        additionalRequirements: row.additional_requirements,
        howDidYouHear: row.how_did_you_hear,
        preferredContact: row.preferred_contact,
        preferredMeetingTime: row.preferred_meeting_time,
        // A lead that came from /audit is, in substance, its audit.
        audits: auditsByLead.get(String(row.id)) ?? [],
        // Where the enquiry came from. Null for organic and direct, which is
        // most of them — the absence is information too.
        attribution: {
          utmSource: row.utm_source,
          utmMedium: row.utm_medium,
          utmCampaign: row.utm_campaign,
          utmTerm: row.utm_term,
          utmContent: row.utm_content,
          gclid: row.gclid,
          landingPage: row.landing_page,
          referrer: row.referrer,
        },
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

    // The status line in the archive needs the values from before the write.
    // Only status is logged: the archive is a history of the site, and editing
    // a phone number on an enquiry is not part of that.
    const statusKey = Object.keys(updates || {}).find((key) => UPDATABLE_COLUMNS[key] === 'status');
    const previous = statusKey
      ? (await turso.execute({ sql: 'SELECT name, status FROM leads WHERE id = ?', args: [leadId] }))
          .rows[0] as any
      : null;

    const sql = `UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`;
    args.push(leadId);

    await turso.execute({ sql, args });

    if (statusKey && previous) {
      const from = leadStatusMeta(previous.status).label;
      const to = leadStatusMeta((updates as any)[statusKey]).label;

      if (from !== to) {
        await recordChange({
          type: 'lead',
          title: `Poptávka ${previous.name || leadId}: ${from} → ${to}`,
          author: user.name || user.email,
        });
      }
    }

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
