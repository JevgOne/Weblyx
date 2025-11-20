/**
 * Server-side Firestore helpers for Server Components
 * Uses firebase-admin for server-side data fetching (currently mock)
 */

import { adminDbInstance } from './firebase-admin';
import { ProcessStep, ProcessSection, FAQItem, FAQSection, CTASection, ContactInfo } from '@/types/cms';

// Process Section
export async function getServerProcessSection(): Promise<ProcessSection | null> {
  try {
    const docSnap = await adminDbInstance.collection('homepage_process').doc('section-meta').get();
    if (docSnap.exists) {
      return docSnap.data() as ProcessSection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching process section:', error);
    return null;
  }
}

export async function getServerProcessSteps(): Promise<ProcessStep[]> {
  try {
    const snapshot = await adminDbInstance.collection('homepage_process').orderBy('order').get();
    return snapshot.docs
      .filter((doc: any) => doc.id !== 'section-meta')
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProcessStep[];
  } catch (error) {
    console.error('Error fetching process steps:', error);
    return [];
  }
}

// FAQ Section
export async function getServerFAQSection(): Promise<FAQSection | null> {
  try {
    const docSnap = await adminDbInstance.collection('homepage_faq').doc('faq-meta').get();
    if (docSnap.exists) {
      return docSnap.data() as FAQSection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching FAQ section:', error);
    return null;
  }
}

export async function getServerFAQItems(): Promise<FAQItem[]> {
  try {
    const snapshot = await adminDbInstance.collection('homepage_faq').orderBy('order').get();
    return snapshot.docs
      .filter((doc: any) => doc.id !== 'faq-meta')
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as FAQItem[];
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    return [];
  }
}

// CTA Section
export async function getServerCTASection(): Promise<CTASection | null> {
  try {
    const docSnap = await adminDbInstance.collection('homepage_cta').doc('current').get();
    if (docSnap.exists) {
      return docSnap.data() as CTASection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching CTA section:', error);
    return null;
  }
}

// Contact Info
export async function getServerContactInfo(): Promise<ContactInfo | null> {
  try {
    const docSnap = await adminDbInstance.collection('contact_info').doc('current').get();
    if (docSnap.exists) {
      return docSnap.data() as ContactInfo;
    }
    return null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
}
