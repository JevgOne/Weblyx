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
import { HeroSection, Service, PricingTier, HomepageSections } from '@/types/cms';

// Collections
const HOMEPAGE_SECTIONS_COLLECTION = 'homepage_sections';
const SERVICES_COLLECTION = 'services';
const PRICING_TIERS_COLLECTION = 'pricing_tiers';

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
