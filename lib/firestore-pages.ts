/**
 * Page Content management (STUB)
 * Firebase removed - page_content not migrated to Turso yet
 * TODO: Migrate page_content to Turso if this feature is needed
 */

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
  console.warn('getPageContent: Firebase removed, page_content not available');
  return null;
}

/**
 * Get all page content (for listing pages in admin)
 */
export async function getAllPageContent(): Promise<PageContent[]> {
  console.warn('getAllPageContent: Firebase removed, page_content not available');
  return [];
}

/**
 * Update page content (for admin editor)
 */
export async function updatePageContent(
  pageId: string,
  content: Record<string, any>,
  updatedBy: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  console.warn('updatePageContent: Firebase removed, page_content not available');
  return { success: false, error: 'Page content management not available - Firebase removed' };
}

/**
 * Get pages by category
 */
export async function getPagesByCategory(category: PageContent['category']): Promise<PageContent[]> {
  console.warn('getPagesByCategory: Firebase removed, page_content not available');
  return [];
}
