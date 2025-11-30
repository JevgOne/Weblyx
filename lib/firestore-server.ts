/**
 * Server-side Firestore helpers for Server Components (STUB)
 * Firebase removed - homepage content not migrated to Turso yet
 * TODO: Migrate homepage content to Turso if this feature is needed
 */

import { ProcessStep, ProcessSection, FAQItem, FAQSection, CTASection, ContactInfo } from '@/types/cms';

// Process Section
export async function getServerProcessSection(): Promise<ProcessSection | null> {
  console.warn('getServerProcessSection: Firebase removed, homepage content not available');
  return null;
}

export async function getServerProcessSteps(): Promise<ProcessStep[]> {
  console.warn('getServerProcessSteps: Firebase removed, homepage content not available');
  return [];
}

// FAQ Section
export async function getServerFAQSection(): Promise<FAQSection | null> {
  console.warn('getServerFAQSection: Firebase removed, homepage content not available');
  return null;
}

export async function getServerFAQItems(): Promise<FAQItem[]> {
  console.warn('getServerFAQItems: Firebase removed, homepage content not available');
  return [];
}

// CTA Section
export async function getServerCTASection(): Promise<CTASection | null> {
  console.warn('getServerCTASection: Firebase removed, homepage content not available');
  return null;
}

// Contact Info
export async function getServerContactInfo(): Promise<ContactInfo | null> {
  console.warn('getServerContactInfo: Firebase removed, homepage content not available');
  return null;
}
