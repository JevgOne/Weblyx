// Lead Generation System Types

import { WebAnalysisResult } from './cms';

// Lead Status Types
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'rejected';

// Campaign Status Types
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

// Tracking Event Types
export type TrackingEventType = 'click' | 'open' | 'convert';

// Lead Interface
export interface Lead {
  id: string;
  companyName: string;
  email: string;
  website?: string;
  industry?: string;
  phone?: string;
  contactPerson?: string;

  // Web analysis data
  analysisScore: number; // 0-100
  analysisResult?: WebAnalysisResult;
  analyzedAt?: Date;

  // Lead scoring
  leadScore: number; // 0-100
  leadStatus: LeadStatus;

  // Email tracking
  emailSent: boolean;
  emailSentAt?: Date;
  emailOpened: boolean;
  emailOpenedAt?: Date;
  linkClicked: boolean;
  linkClickedAt?: Date;

  // Notes
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Campaign Interface
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;

  // Stats
  totalLeads: number;
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  conversions: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Generated Email Interface
export interface GeneratedEmail {
  id: string;
  leadId: string;
  campaignId?: string;

  // Email content
  subject: string;
  body: string;

  // Tracking
  trackingCode: string; // Unique code for tracking (e.g., "ABC123")

  // Status
  sent: boolean;
  sentAt?: Date;
  opened: boolean;
  openedAt?: Date;
  clicked: boolean;
  clickedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Tracking Event Interface
export interface TrackingEvent {
  id: string;
  trackingCode: string;
  eventType: TrackingEventType;

  // Request data
  ipAddress?: string;
  userAgent?: string;
  referer?: string;

  // Geolocation (optional)
  country?: string;
  city?: string;

  // Timestamp
  createdAt: Date;
}

// ===== CREATE DATA TYPES =====

export interface CreateLeadData {
  companyName: string;
  email: string;
  website?: string;
  industry?: string;
  phone?: string;
  contactPerson?: string;
  notes?: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  status?: CampaignStatus;
}

export interface CreateGeneratedEmailData {
  leadId: string;
  campaignId?: string;
  subject: string;
  body: string;
}

export interface CreateTrackingEventData {
  trackingCode: string;
  eventType: TrackingEventType;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
}

// ===== UPDATE DATA TYPES =====

export interface UpdateLeadData {
  companyName?: string;
  email?: string;
  website?: string;
  industry?: string;
  phone?: string;
  contactPerson?: string;
  analysisScore?: number;
  analysisResult?: WebAnalysisResult;
  analyzedAt?: Date;
  leadScore?: number;
  leadStatus?: LeadStatus;
  emailSent?: boolean;
  emailSentAt?: Date;
  emailOpened?: boolean;
  emailOpenedAt?: Date;
  linkClicked?: boolean;
  linkClickedAt?: Date;
  notes?: string;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  totalLeads?: number;
  emailsSent?: number;
  emailsOpened?: number;
  linksClicked?: number;
  conversions?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface UpdateGeneratedEmailData {
  subject?: string;
  body?: string;
  sent?: boolean;
  sentAt?: Date;
  opened?: boolean;
  openedAt?: Date;
  clicked?: boolean;
  clickedAt?: Date;
}

// ===== CSV IMPORT TYPES =====

export interface CSVLeadRow {
  company_name: string;
  email: string;
  website?: string;
  industry?: string;
  phone?: string;
  contact_person?: string;
}

export interface CSVImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  leads: Lead[];
}

// ===== EMAIL GENERATION TYPES =====

export interface EmailGenerationPrompt {
  companyName: string;
  website?: string;
  analysisResult: WebAnalysisResult;
  industry?: string;
}

export interface EmailGenerationResult {
  subject: string;
  body: string;
  confidence: number; // 0-100
}

// ===== DASHBOARD STATS TYPES =====

export interface LeadGenerationStats {
  // Overview
  totalLeads: number;
  analyzedLeads: number;
  contactedLeads: number;
  convertedLeads: number;

  // Scores
  averageAnalysisScore: number;
  averageLeadScore: number;

  // Email performance
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalLinksClicked: number;
  emailOpenRate: number; // percentage
  linkClickRate: number; // percentage
  conversionRate: number; // percentage

  // By status
  leadsByStatus: {
    new: number;
    contacted: number;
    interested: number;
    converted: number;
    rejected: number;
  };

  // Campaigns
  activeCampaigns: number;
  completedCampaigns: number;
}

// ===== API RESPONSE TYPES =====

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}
