// Firestore CMS Utility Functions
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  HeroSection,
  Service,
  PricingTier,
  HomepageSections,
  ProcessStep,
  ProcessSection,
  FAQItem,
  FAQSection,
  CTASection,
  ContactInfo
} from '@/types/cms';

// Collections
const HOMEPAGE_SECTIONS_COLLECTION = 'homepage_sections';
const SERVICES_COLLECTION = 'services';
const PRICING_TIERS_COLLECTION = 'pricing_tiers';
const PROCESS_COLLECTION = 'homepage_process';
const FAQ_COLLECTION = 'homepage_faq';
const CTA_COLLECTION = 'homepage_cta';
const CONTACT_COLLECTION = 'contact_info';

// Homepage Sections
export async function getHomepageSections(): Promise<HomepageSections | null> {
  try {
    const docRef = doc(db, HOMEPAGE_SECTIONS_COLLECTION, 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        hero: data.hero,
        updatedAt: data.updatedAt?.toDate(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    throw error;
  }
}

export async function updateHeroSection(hero: HeroSection): Promise<void> {
  try {
    const docRef = doc(db, HOMEPAGE_SECTIONS_COLLECTION, 'current');
    await setDoc(docRef, {
      hero,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating hero section:', error);
    throw error;
  }
}

// Services
export async function getAllServices(): Promise<Service[]> {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    const q = query(servicesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Service));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

export async function getService(id: string): Promise<Service | null> {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Service;
    }
    return null;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
}

export async function createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    const newDocRef = doc(servicesRef);

    await setDoc(newDocRef, {
      ...service,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return newDocRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function updateService(id: string, service: Partial<Service>): Promise<void> {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(docRef, {
      ...service,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// Pricing Tiers
export async function getAllPricingTiers(): Promise<PricingTier[]> {
  try {
    const tiersRef = collection(db, PRICING_TIERS_COLLECTION);
    const q = query(tiersRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PricingTier));
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    throw error;
  }
}

export async function getPricingTier(id: string): Promise<PricingTier | null> {
  try {
    const docRef = doc(db, PRICING_TIERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as PricingTier;
    }
    return null;
  } catch (error) {
    console.error('Error fetching pricing tier:', error);
    throw error;
  }
}

export async function createPricingTier(tier: Omit<PricingTier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const tiersRef = collection(db, PRICING_TIERS_COLLECTION);
    const newDocRef = doc(tiersRef);

    await setDoc(newDocRef, {
      ...tier,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return newDocRef.id;
  } catch (error) {
    console.error('Error creating pricing tier:', error);
    throw error;
  }
}

export async function updatePricingTier(id: string, tier: Partial<PricingTier>): Promise<void> {
  try {
    const docRef = doc(db, PRICING_TIERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...tier,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating pricing tier:', error);
    throw error;
  }
}

export async function deletePricingTier(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRICING_TIERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    throw error;
  }
}

// Process Section
export async function getProcessSection(): Promise<ProcessSection | null> {
  try {
    const docRef = doc(db, PROCESS_COLLECTION, 'section-meta');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ProcessSection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching process section:', error);
    throw error;
  }
}

export async function updateProcessSection(section: ProcessSection): Promise<void> {
  try {
    const docRef = doc(db, PROCESS_COLLECTION, 'section-meta');
    await setDoc(docRef, section, { merge: true });
  } catch (error) {
    console.error('Error updating process section:', error);
    throw error;
  }
}

export async function getAllProcessSteps(): Promise<ProcessStep[]> {
  try {
    const stepsRef = collection(db, PROCESS_COLLECTION);
    const q = query(stepsRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .filter(doc => doc.id !== 'section-meta')
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as ProcessStep));
  } catch (error) {
    console.error('Error fetching process steps:', error);
    throw error;
  }
}

export async function getProcessStep(id: string): Promise<ProcessStep | null> {
  try {
    const docRef = doc(db, PROCESS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.id !== 'section-meta') {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as ProcessStep;
    }
    return null;
  } catch (error) {
    console.error('Error fetching process step:', error);
    throw error;
  }
}

export async function createProcessStep(step: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const stepsRef = collection(db, PROCESS_COLLECTION);
    const newDocRef = doc(stepsRef);

    await setDoc(newDocRef, {
      ...step,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return newDocRef.id;
  } catch (error) {
    console.error('Error creating process step:', error);
    throw error;
  }
}

export async function updateProcessStep(id: string, step: Partial<ProcessStep>): Promise<void> {
  try {
    const docRef = doc(db, PROCESS_COLLECTION, id);
    await updateDoc(docRef, {
      ...step,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating process step:', error);
    throw error;
  }
}

export async function deleteProcessStep(id: string): Promise<void> {
  try {
    const docRef = doc(db, PROCESS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting process step:', error);
    throw error;
  }
}

// FAQ Section
export async function getFAQSection(): Promise<FAQSection | null> {
  try {
    const docRef = doc(db, FAQ_COLLECTION, 'faq-meta');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as FAQSection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching FAQ section:', error);
    throw error;
  }
}

export async function updateFAQSection(section: FAQSection): Promise<void> {
  try {
    const docRef = doc(db, FAQ_COLLECTION, 'faq-meta');
    await setDoc(docRef, section, { merge: true });
  } catch (error) {
    console.error('Error updating FAQ section:', error);
    throw error;
  }
}

export async function getAllFAQItems(): Promise<FAQItem[]> {
  try {
    const faqRef = collection(db, FAQ_COLLECTION);
    const q = query(faqRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .filter(doc => doc.id !== 'faq-meta')
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as FAQItem));
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    throw error;
  }
}

export async function getFAQItem(id: string): Promise<FAQItem | null> {
  try {
    const docRef = doc(db, FAQ_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.id !== 'faq-meta') {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as FAQItem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching FAQ item:', error);
    throw error;
  }
}

export async function createFAQItem(faq: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const faqRef = collection(db, FAQ_COLLECTION);
    const newDocRef = doc(faqRef);

    await setDoc(newDocRef, {
      ...faq,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return newDocRef.id;
  } catch (error) {
    console.error('Error creating FAQ item:', error);
    throw error;
  }
}

export async function updateFAQItem(id: string, faq: Partial<FAQItem>): Promise<void> {
  try {
    const docRef = doc(db, FAQ_COLLECTION, id);
    await updateDoc(docRef, {
      ...faq,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating FAQ item:', error);
    throw error;
  }
}

export async function deleteFAQItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, FAQ_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    throw error;
  }
}

// CTA Section
export async function getCTASection(): Promise<CTASection | null> {
  try {
    const docRef = doc(db, CTA_COLLECTION, 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CTASection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching CTA section:', error);
    throw error;
  }
}

export async function updateCTASection(section: CTASection): Promise<void> {
  try {
    const docRef = doc(db, CTA_COLLECTION, 'current');
    await setDoc(docRef, section, { merge: true });
  } catch (error) {
    console.error('Error updating CTA section:', error);
    throw error;
  }
}

// Contact Info
export async function getContactInfo(): Promise<ContactInfo | null> {
  try {
    const docRef = doc(db, CONTACT_COLLECTION, 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ContactInfo;
    }
    return null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw error;
  }
}

export async function updateContactInfo(info: ContactInfo): Promise<void> {
  try {
    const docRef = doc(db, CONTACT_COLLECTION, 'current');
    await setDoc(docRef, info, { merge: true });
  } catch (error) {
    console.error('Error updating contact info:', error);
    throw error;
  }
}
