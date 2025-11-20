/**
 * Firestore helper functions for Page Content management
 * Used by the universal page editor to manage all static page content
 */

import { adminDbInstance } from "./firebase-admin";

export interface PageContent {
  pageId: string;
  pageName: string;
  category: 'homepage' | 'static-page' | 'section';
  content: Record<string, any>;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Get content for a specific page by its ID
 */
export async function getPageContent(pageId: string): Promise<PageContent | null> {
  try {
    if (!adminDbInstance) {
      console.error('Firebase Admin not initialized');
      return null;
    }

    const doc = await adminDbInstance.collection("page_content").doc(pageId).get();

    if (!doc.exists) {
      console.error(`Page content not found: ${pageId}`);
      return null;
    }

    return doc.data() as PageContent;
  } catch (error) {
    console.error(`Error fetching page content for ${pageId}:`, error);
    return null;
  }
}

/**
 * Get all page content (for listing pages in admin)
 */
export async function getAllPageContent(): Promise<PageContent[]> {
  try {
    if (!adminDbInstance) {
      console.error('Firebase Admin not initialized');
      return [];
    }

    const snapshot = await adminDbInstance.collection("page_content").orderBy("pageId").get();

    if (snapshot.empty) {
      console.error('No page content found');
      return [];
    }

    const pages: PageContent[] = [];
    snapshot.docs.forEach((doc: any) => {
      pages.push(doc.data() as PageContent);
    });

    return pages;
  } catch (error) {
    console.error('Error fetching all page content:', error);
    return [];
  }
}

/**
 * Update page content (for admin editor)
 * Note: This is a mock implementation for the admin UI
 * In production, this would use the Firebase Admin SDK to update Firestore
 */
export async function updatePageContent(
  pageId: string,
  content: Record<string, any>,
  updatedBy: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!adminDbInstance) {
      return { success: false, error: 'Firebase Admin not initialized' };
    }

    // In production, this would be:
    // await db.collection("page_content").doc(pageId).update({
    //   content,
    //   updatedAt: new Date().toISOString(),
    //   updatedBy
    // });

    // For mock implementation, we'll just log it
    console.log('Mock update page content:', { pageId, content, updatedBy });

    return { success: true };
  } catch (error) {
    console.error('Error updating page content:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get pages by category
 */
export async function getPagesByCategory(category: PageContent['category']): Promise<PageContent[]> {
  try {
    if (!adminDbInstance) {
      console.error('Firebase Admin not initialized');
      return [];
    }

    const snapshot = await adminDbInstance
      .collection("page_content")
      .where("category", "==", category)
      .orderBy("pageId")
      .get();

    if (snapshot.empty) {
      return [];
    }

    const pages: PageContent[] = [];
    snapshot.docs.forEach((doc: any) => {
      pages.push(doc.data() as PageContent);
    });

    return pages;
  } catch (error) {
    console.error(`Error fetching pages for category ${category}:`, error);
    return [];
  }
}
