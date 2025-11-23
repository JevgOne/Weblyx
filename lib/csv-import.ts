// CSV Import Utility for Lead Generation
import { CSVLeadRow, CSVImportResult, Lead } from '@/types/lead-generation';
import { createLead } from './turso/lead-generation';

/**
 * Parse CSV content into lead rows
 * Expected CSV format:
 * company_name,email,website,industry,phone,contact_person
 */
export function parseCSV(csvContent: string): CSVLeadRow[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row');
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Validate required columns
  const requiredColumns = ['company_name', 'email'];
  const missingColumns = requiredColumns.filter(col => !header.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}`);
  }

  // Parse data rows
  const rows: CSVLeadRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map(v => v.trim());

    if (values.length !== header.length) {
      console.warn(`Line ${i + 1}: Column count mismatch. Expected ${header.length}, got ${values.length}`);
      continue;
    }

    const row: any = {};
    header.forEach((col, index) => {
      row[col] = values[index] || undefined;
    });

    // Validate email format
    if (!row.email || !isValidEmail(row.email)) {
      console.warn(`Line ${i + 1}: Invalid email "${row.email}"`);
      continue;
    }

    rows.push({
      company_name: row.company_name,
      email: row.email,
      website: row.website,
      industry: row.industry,
      phone: row.phone,
      contact_person: row.contact_person,
    });
  }

  return rows;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Import leads from CSV content
 */
export async function importLeadsFromCSV(csvContent: string): Promise<CSVImportResult> {
  const result: CSVImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
    leads: [],
  };

  try {
    // Parse CSV
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      result.success = false;
      result.errors.push('No valid data rows found in CSV');
      return result;
    }

    // Import each lead
    for (const row of rows) {
      try {
        const lead = await createLead({
          companyName: row.company_name,
          email: row.email,
          website: row.website,
          industry: row.industry,
          phone: row.phone,
          contactPerson: row.contact_person,
        });

        result.leads.push(lead);
        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`Failed to import ${row.company_name}: ${error.message}`);
      }
    }

    if (result.failed > 0) {
      result.success = false;
    }

    return result;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`CSV parsing error: ${error.message}`);
    return result;
  }
}

/**
 * Export leads to CSV format
 */
export function exportLeadsToCSV(leads: Lead[]): string {
  const header = 'company_name,email,website,industry,phone,contact_person,lead_score,lead_status,analysis_score,email_sent';

  const rows = leads.map(lead => {
    return [
      escapeCSVValue(lead.companyName),
      escapeCSVValue(lead.email),
      escapeCSVValue(lead.website || ''),
      escapeCSVValue(lead.industry || ''),
      escapeCSVValue(lead.phone || ''),
      escapeCSVValue(lead.contactPerson || ''),
      lead.leadScore.toString(),
      lead.leadStatus,
      lead.analysisScore.toString(),
      lead.emailSent ? 'Yes' : 'No',
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Generate sample CSV template
 */
export function generateCSVTemplate(): string {
  return `company_name,email,website,industry,phone,contact_person
"Pekárna U Karla",info@pekarnakarla.cz,www.pekarnakarla.cz,"Potraviny","+420 123 456 789","Karel Novák"
"Autoservis Brno",kontakt@autoservisbrno.cz,autoservisbrno.cz,"Automotive","+420 987 654 321","Jan Dvořák"
"Květinářství Praha",info@kvetinarstvipraha.cz,kvetinarstvipraha.cz,"Retail","+420 111 222 333","Marie Svobodová"`;
}
