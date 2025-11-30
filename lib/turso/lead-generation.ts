// Turso Lead Generation Helper Functions
import { executeQuery, executeOne, dateToUnix, unixToDate, parseJSON, stringifyJSON } from '../turso';
import {
  Lead,
  Campaign,
  GeneratedEmail,
  TrackingEvent,
  CreateLeadData,
  CreateCampaignData,
  CreateGeneratedEmailData,
  CreateTrackingEventData,
  UpdateLeadData,
  UpdateCampaignData,
  UpdateGeneratedEmailData,
  LeadGenerationStats,
  LeadStatus,
  CampaignStatus,
  TrackingEventType
} from '@/types/lead-generation';

// ===== HELPER FUNCTIONS =====

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTrackingCode(): string {
  // Generate 6-character alphanumeric code (e.g., "A3B9X2")
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ===== LEADS CRUD =====

export async function getAllLeads(limit?: number, includeAnalysisResult: boolean = true): Promise<Lead[]> {
  try {
    // Select only necessary columns for list view (exclude large analysis_result)
    const columns = includeAnalysisResult
      ? '*'
      : `id, company_name, email, website, industry, phone, contact_person,
         analysis_score, analyzed_at, lead_score, lead_status, email_sent,
         email_sent_at, email_opened, email_opened_at, link_clicked,
         link_clicked_at, notes, created_at, updated_at`;

    const sql = limit
      ? `SELECT ${columns} FROM lead_generation_leads ORDER BY created_at DESC LIMIT ?`
      : `SELECT ${columns} FROM lead_generation_leads ORDER BY created_at DESC`;

    const results = await executeQuery<any>(
      sql,
      limit ? [limit] : undefined
    );

    return results.map(row => ({
      id: row.id,
      companyName: row.company_name,
      email: row.email,
      website: row.website || undefined,
      industry: row.industry || undefined,
      phone: row.phone || undefined,
      contactPerson: row.contact_person || undefined,
      analysisScore: row.analysis_score || 0,
      analysisResult: (includeAnalysisResult && row.analysis_result) ? parseJSON(row.analysis_result) : undefined,
      analyzedAt: unixToDate(row.analyzed_at) || undefined,
      leadScore: row.lead_score || 0,
      leadStatus: (row.lead_status as LeadStatus) || 'new',
      emailSent: Boolean(row.email_sent),
      emailSentAt: unixToDate(row.email_sent_at) || undefined,
      emailOpened: Boolean(row.email_opened),
      emailOpenedAt: unixToDate(row.email_opened_at) || undefined,
      linkClicked: Boolean(row.link_clicked),
      linkClickedAt: unixToDate(row.link_clicked_at) || undefined,
      notes: row.notes || undefined,
      createdAt: unixToDate(row.created_at)!,
      updatedAt: unixToDate(row.updated_at)!,
    }));
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM lead_generation_leads WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      companyName: result.company_name,
      email: result.email,
      website: result.website || undefined,
      industry: result.industry || undefined,
      phone: result.phone || undefined,
      contactPerson: result.contact_person || undefined,
      analysisScore: result.analysis_score || 0,
      analysisResult: result.analysis_result ? parseJSON(result.analysis_result) : undefined,
      analyzedAt: unixToDate(result.analyzed_at) || undefined,
      leadScore: result.lead_score || 0,
      leadStatus: (result.lead_status as LeadStatus) || 'new',
      emailSent: Boolean(result.email_sent),
      emailSentAt: unixToDate(result.email_sent_at) || undefined,
      emailOpened: Boolean(result.email_opened),
      emailOpenedAt: unixToDate(result.email_opened_at) || undefined,
      linkClicked: Boolean(result.link_clicked),
      linkClickedAt: unixToDate(result.link_clicked_at) || undefined,
      notes: result.notes || undefined,
      createdAt: unixToDate(result.created_at)!,
      updatedAt: unixToDate(result.updated_at)!,
    };
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
  try {
    const id = generateId('lead');
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO lead_generation_leads (
        id, company_name, email, website, industry, phone, contact_person,
        analysis_score, lead_score, lead_status, email_sent, email_opened,
        link_clicked, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.companyName,
        data.email,
        data.website || null,
        data.industry || null,
        data.phone || null,
        data.contactPerson || null,
        0, // analysis_score
        0, // lead_score
        'new', // lead_status
        0, // email_sent
        0, // email_opened
        0, // link_clicked
        data.notes || null,
        now,
        now
      ]
    );

    const lead = await getLead(id);
    if (!lead) throw new Error('Failed to create lead');
    return lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

export async function updateLead(id: string, data: UpdateLeadData): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (data.companyName !== undefined) {
      updates.push('company_name = ?');
      params.push(data.companyName);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }
    if (data.website !== undefined) {
      updates.push('website = ?');
      params.push(data.website);
    }
    if (data.industry !== undefined) {
      updates.push('industry = ?');
      params.push(data.industry);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      params.push(data.phone);
    }
    if (data.contactPerson !== undefined) {
      updates.push('contact_person = ?');
      params.push(data.contactPerson);
    }
    if (data.analysisScore !== undefined) {
      updates.push('analysis_score = ?');
      params.push(data.analysisScore);
    }
    if (data.analysisResult !== undefined) {
      updates.push('analysis_result = ?');
      params.push(stringifyJSON(data.analysisResult));
    }
    if (data.analyzedAt !== undefined) {
      updates.push('analyzed_at = ?');
      params.push(dateToUnix(data.analyzedAt));
    }
    if (data.leadScore !== undefined) {
      updates.push('lead_score = ?');
      params.push(data.leadScore);
    }
    if (data.leadStatus !== undefined) {
      updates.push('lead_status = ?');
      params.push(data.leadStatus);
    }
    if (data.emailSent !== undefined) {
      updates.push('email_sent = ?');
      params.push(data.emailSent ? 1 : 0);
    }
    if (data.emailSentAt !== undefined) {
      updates.push('email_sent_at = ?');
      params.push(dateToUnix(data.emailSentAt));
    }
    if (data.emailOpened !== undefined) {
      updates.push('email_opened = ?');
      params.push(data.emailOpened ? 1 : 0);
    }
    if (data.emailOpenedAt !== undefined) {
      updates.push('email_opened_at = ?');
      params.push(dateToUnix(data.emailOpenedAt));
    }
    if (data.linkClicked !== undefined) {
      updates.push('link_clicked = ?');
      params.push(data.linkClicked ? 1 : 0);
    }
    if (data.linkClickedAt !== undefined) {
      updates.push('link_clicked_at = ?');
      params.push(dateToUnix(data.linkClickedAt));
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    if (updates.length > 1) {
      await executeQuery(
        `UPDATE lead_generation_leads SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM lead_generation_leads WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// ===== CAMPAIGNS CRUD =====

export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );

    return results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      status: (row.status as CampaignStatus) || 'draft',
      totalLeads: row.total_leads || 0,
      emailsSent: row.emails_sent || 0,
      emailsOpened: row.emails_opened || 0,
      linksClicked: row.links_clicked || 0,
      conversions: row.conversions || 0,
      createdAt: unixToDate(row.created_at)!,
      updatedAt: unixToDate(row.updated_at)!,
      startedAt: unixToDate(row.started_at) || undefined,
      completedAt: unixToDate(row.completed_at) || undefined,
    }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      description: result.description || undefined,
      status: (result.status as CampaignStatus) || 'draft',
      totalLeads: result.total_leads || 0,
      emailsSent: result.emails_sent || 0,
      emailsOpened: result.emails_opened || 0,
      linksClicked: result.links_clicked || 0,
      conversions: result.conversions || 0,
      createdAt: unixToDate(result.created_at)!,
      updatedAt: unixToDate(result.updated_at)!,
      startedAt: unixToDate(result.started_at) || undefined,
      completedAt: unixToDate(result.completed_at) || undefined,
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
}

export async function createCampaign(data: CreateCampaignData): Promise<Campaign> {
  try {
    const id = generateId('campaign');
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO campaigns (
        id, name, description, status, total_leads, emails_sent,
        emails_opened, links_clicked, conversions, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.status || 'draft',
        0, // total_leads
        0, // emails_sent
        0, // emails_opened
        0, // links_clicked
        0, // conversions
        now,
        now
      ]
    );

    const campaign = await getCampaign(id);
    if (!campaign) throw new Error('Failed to create campaign');
    return campaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

export async function updateCampaign(id: string, data: UpdateCampaignData): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.totalLeads !== undefined) {
      updates.push('total_leads = ?');
      params.push(data.totalLeads);
    }
    if (data.emailsSent !== undefined) {
      updates.push('emails_sent = ?');
      params.push(data.emailsSent);
    }
    if (data.emailsOpened !== undefined) {
      updates.push('emails_opened = ?');
      params.push(data.emailsOpened);
    }
    if (data.linksClicked !== undefined) {
      updates.push('links_clicked = ?');
      params.push(data.linksClicked);
    }
    if (data.conversions !== undefined) {
      updates.push('conversions = ?');
      params.push(data.conversions);
    }
    if (data.startedAt !== undefined) {
      updates.push('started_at = ?');
      params.push(dateToUnix(data.startedAt));
    }
    if (data.completedAt !== undefined) {
      updates.push('completed_at = ?');
      params.push(dateToUnix(data.completedAt));
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    if (updates.length > 1) {
      await executeQuery(
        `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM campaigns WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
}

// ===== GENERATED EMAILS CRUD =====

export async function getAllGeneratedEmails(): Promise<GeneratedEmail[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM generated_emails ORDER BY created_at DESC'
    );

    return results.map(row => ({
      id: row.id,
      leadId: row.lead_id,
      campaignId: row.campaign_id || undefined,
      subject: row.subject,
      body: row.body,
      trackingCode: row.tracking_code,
      sent: Boolean(row.sent),
      sentAt: unixToDate(row.sent_at) || undefined,
      opened: Boolean(row.opened),
      openedAt: unixToDate(row.opened_at) || undefined,
      clicked: Boolean(row.clicked),
      clickedAt: unixToDate(row.clicked_at) || undefined,
      createdAt: unixToDate(row.created_at)!,
      updatedAt: unixToDate(row.updated_at)!,
    }));
  } catch (error) {
    console.error('Error fetching generated emails:', error);
    throw error;
  }
}

export async function getGeneratedEmail(id: string): Promise<GeneratedEmail | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM generated_emails WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      leadId: result.lead_id,
      campaignId: result.campaign_id || undefined,
      subject: result.subject,
      body: result.body,
      trackingCode: result.tracking_code,
      sent: Boolean(result.sent),
      sentAt: unixToDate(result.sent_at) || undefined,
      opened: Boolean(result.opened),
      openedAt: unixToDate(result.opened_at) || undefined,
      clicked: Boolean(result.clicked),
      clickedAt: unixToDate(result.clicked_at) || undefined,
      createdAt: unixToDate(result.created_at)!,
      updatedAt: unixToDate(result.updated_at)!,
    };
  } catch (error) {
    console.error('Error fetching generated email:', error);
    throw error;
  }
}

export async function getEmailsByLeadId(leadId: string): Promise<GeneratedEmail[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM generated_emails WHERE lead_id = ? ORDER BY created_at DESC',
      [leadId]
    );

    return results.map(row => ({
      id: row.id,
      leadId: row.lead_id,
      campaignId: row.campaign_id || undefined,
      subject: row.subject,
      body: row.body,
      trackingCode: row.tracking_code,
      sent: Boolean(row.sent),
      sentAt: unixToDate(row.sent_at) || undefined,
      opened: Boolean(row.opened),
      openedAt: unixToDate(row.opened_at) || undefined,
      clicked: Boolean(row.clicked),
      clickedAt: unixToDate(row.clicked_at) || undefined,
      createdAt: unixToDate(row.created_at)!,
      updatedAt: unixToDate(row.updated_at)!,
    }));
  } catch (error) {
    console.error('Error fetching emails by lead ID:', error);
    throw error;
  }
}

export async function getEmailByTrackingCode(trackingCode: string): Promise<GeneratedEmail | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM generated_emails WHERE tracking_code = ?',
      [trackingCode]
    );

    if (!result) return null;

    return {
      id: result.id,
      leadId: result.lead_id,
      campaignId: result.campaign_id || undefined,
      subject: result.subject,
      body: result.body,
      trackingCode: result.tracking_code,
      sent: Boolean(result.sent),
      sentAt: unixToDate(result.sent_at) || undefined,
      opened: Boolean(result.opened),
      openedAt: unixToDate(result.opened_at) || undefined,
      clicked: Boolean(result.clicked),
      clickedAt: unixToDate(result.clicked_at) || undefined,
      createdAt: unixToDate(result.created_at)!,
      updatedAt: unixToDate(result.updated_at)!,
    };
  } catch (error) {
    console.error('Error fetching email by tracking code:', error);
    throw error;
  }
}

export async function createGeneratedEmail(data: CreateGeneratedEmailData): Promise<GeneratedEmail> {
  try {
    const id = generateId('email');
    const now = Math.floor(Date.now() / 1000);
    const trackingCode = generateTrackingCode();

    await executeQuery(
      `INSERT INTO generated_emails (
        id, lead_id, campaign_id, subject, body, tracking_code,
        sent, opened, clicked, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.leadId,
        data.campaignId || null,
        data.subject,
        data.body,
        trackingCode,
        0, // sent
        0, // opened
        0, // clicked
        now,
        now
      ]
    );

    const email = await getGeneratedEmail(id);
    if (!email) throw new Error('Failed to create generated email');
    return email;
  } catch (error) {
    console.error('Error creating generated email:', error);
    throw error;
  }
}

export async function updateGeneratedEmail(id: string, data: UpdateGeneratedEmailData): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (data.subject !== undefined) {
      updates.push('subject = ?');
      params.push(data.subject);
    }
    if (data.body !== undefined) {
      updates.push('body = ?');
      params.push(data.body);
    }
    if (data.sent !== undefined) {
      updates.push('sent = ?');
      params.push(data.sent ? 1 : 0);
    }
    if (data.sentAt !== undefined) {
      updates.push('sent_at = ?');
      params.push(dateToUnix(data.sentAt));
    }
    if (data.opened !== undefined) {
      updates.push('opened = ?');
      params.push(data.opened ? 1 : 0);
    }
    if (data.openedAt !== undefined) {
      updates.push('opened_at = ?');
      params.push(dateToUnix(data.openedAt));
    }
    if (data.clicked !== undefined) {
      updates.push('clicked = ?');
      params.push(data.clicked ? 1 : 0);
    }
    if (data.clickedAt !== undefined) {
      updates.push('clicked_at = ?');
      params.push(dateToUnix(data.clickedAt));
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    if (updates.length > 1) {
      await executeQuery(
        `UPDATE generated_emails SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
  } catch (error) {
    console.error('Error updating generated email:', error);
    throw error;
  }
}

export async function deleteGeneratedEmail(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM generated_emails WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting generated email:', error);
    throw error;
  }
}

// ===== TRACKING EVENTS CRUD =====

export async function createTrackingEvent(data: CreateTrackingEventData): Promise<TrackingEvent> {
  try {
    const id = generateId('event');
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO tracking_events (
        id, tracking_code, event_type, ip_address, user_agent,
        referer, country, city, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.trackingCode,
        data.eventType,
        data.ipAddress || null,
        data.userAgent || null,
        data.referer || null,
        data.country || null,
        data.city || null,
        now
      ]
    );

    const event: TrackingEvent = {
      id,
      trackingCode: data.trackingCode,
      eventType: data.eventType,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referer: data.referer,
      country: data.country,
      city: data.city,
      createdAt: new Date(now * 1000)
    };

    return event;
  } catch (error) {
    console.error('Error creating tracking event:', error);
    throw error;
  }
}

export async function getTrackingEventsByCode(trackingCode: string): Promise<TrackingEvent[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM tracking_events WHERE tracking_code = ? ORDER BY created_at DESC',
      [trackingCode]
    );

    return results.map(row => ({
      id: row.id,
      trackingCode: row.tracking_code,
      eventType: row.event_type as TrackingEventType,
      ipAddress: row.ip_address || undefined,
      userAgent: row.user_agent || undefined,
      referer: row.referer || undefined,
      country: row.country || undefined,
      city: row.city || undefined,
      createdAt: unixToDate(row.created_at)!,
    }));
  } catch (error) {
    console.error('Error fetching tracking events:', error);
    throw error;
  }
}

// ===== STATISTICS =====

export async function getLeadGenerationStats(): Promise<LeadGenerationStats> {
  try {
    // Get all leads
    const leads = await getAllLeads();

    // Calculate stats
    const totalLeads = leads.length;
    const analyzedLeads = leads.filter(l => l.analyzedAt).length;
    const contactedLeads = leads.filter(l => l.emailSent).length;
    const convertedLeads = leads.filter(l => l.leadStatus === 'converted').length;

    // Average scores
    const analyzedScores = leads.filter(l => l.analysisScore > 0).map(l => l.analysisScore);
    const averageAnalysisScore = analyzedScores.length > 0
      ? Math.round(analyzedScores.reduce((a, b) => a + b, 0) / analyzedScores.length)
      : 0;

    const leadScores = leads.filter(l => l.leadScore > 0).map(l => l.leadScore);
    const averageLeadScore = leadScores.length > 0
      ? Math.round(leadScores.reduce((a, b) => a + b, 0) / leadScores.length)
      : 0;

    // Email performance
    const totalEmailsSent = leads.filter(l => l.emailSent).length;
    const totalEmailsOpened = leads.filter(l => l.emailOpened).length;
    const totalLinksClicked = leads.filter(l => l.linkClicked).length;

    const emailOpenRate = totalEmailsSent > 0
      ? Math.round((totalEmailsOpened / totalEmailsSent) * 100)
      : 0;

    const linkClickRate = totalEmailsSent > 0
      ? Math.round((totalLinksClicked / totalEmailsSent) * 100)
      : 0;

    const conversionRate = totalEmailsSent > 0
      ? Math.round((convertedLeads / totalEmailsSent) * 100)
      : 0;

    // By status
    const leadsByStatus = {
      new: leads.filter(l => l.leadStatus === 'new').length,
      contacted: leads.filter(l => l.leadStatus === 'contacted').length,
      interested: leads.filter(l => l.leadStatus === 'interested').length,
      converted: leads.filter(l => l.leadStatus === 'converted').length,
      rejected: leads.filter(l => l.leadStatus === 'rejected').length,
    };

    // Campaigns
    const campaigns = await getAllCampaigns();
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;

    return {
      totalLeads,
      analyzedLeads,
      contactedLeads,
      convertedLeads,
      averageAnalysisScore,
      averageLeadScore,
      totalEmailsSent,
      totalEmailsOpened,
      totalLinksClicked,
      emailOpenRate,
      linkClickRate,
      conversionRate,
      leadsByStatus,
      activeCampaigns,
      completedCampaigns,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    throw error;
  }
}
