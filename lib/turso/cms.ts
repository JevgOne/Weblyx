// Turso CMS Utility Functions
import { executeQuery, executeOne, dateToUnix, unixToDate, parseJSON, stringifyJSON } from '../turso';
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

// Homepage Sections
export async function getHomepageSections(): Promise<HomepageSections | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM homepage_sections WHERE id = ?',
      ['current']
    );

    if (result) {
      return {
        hero: {
          headline: result.hero_title || '',
          subheadline: result.hero_subtitle || '',
          ctaText: result.hero_cta_text || '',
          ctaLink: result.hero_cta_link || '',
          backgroundImage: result.hero_image || '',
          enabled: true,
        },
        updatedAt: unixToDate(result.updated_at) || undefined,
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
    const now = Math.floor(Date.now() / 1000);
    await executeQuery(
      `INSERT INTO homepage_sections (id, hero_title, hero_subtitle, hero_cta_text, hero_cta_link, hero_image, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         hero_title = excluded.hero_title,
         hero_subtitle = excluded.hero_subtitle,
         hero_cta_text = excluded.hero_cta_text,
         hero_cta_link = excluded.hero_cta_link,
         hero_image = excluded.hero_image,
         updated_at = excluded.updated_at`,
      ['current', hero.headline, hero.subheadline, hero.ctaText, hero.ctaLink, hero.backgroundImage, now]
    );
  } catch (error) {
    console.error('Error updating hero section:', error);
    throw error;
  }
}

// Services
export async function getAllServices(): Promise<Service[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM services ORDER BY "order" ASC'
    );

    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon || '',
      features: parseJSON(row.features) || [],
      order: row.order,
      enabled: true,
      createdAt: unixToDate(row.created_at) || undefined,
      updatedAt: unixToDate(row.updated_at) || undefined,
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

export async function getService(id: string): Promise<Service | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );

    if (result) {
      return {
        id: result.id,
        title: result.title,
        description: result.description,
        icon: result.icon || '',
        features: parseJSON(result.features) || [],
        order: result.order,
        enabled: true,
        createdAt: unixToDate(result.created_at) || undefined,
        updatedAt: unixToDate(result.updated_at) || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
}

export async function createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const id = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO services (id, title, description, icon, features, "order", created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, service.title, service.description, service.icon, stringifyJSON(service.features), service.order, now, now]
    );

    return id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function updateService(id: string, service: Partial<Service>): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (service.title !== undefined) {
      updates.push('title = ?');
      params.push(service.title);
    }
    if (service.description !== undefined) {
      updates.push('description = ?');
      params.push(service.description);
    }
    if (service.icon !== undefined) {
      updates.push('icon = ?');
      params.push(service.icon);
    }
    if (service.features !== undefined) {
      updates.push('features = ?');
      params.push(stringifyJSON(service.features));
    }
    if (service.order !== undefined) {
      updates.push('"order" = ?');
      params.push(service.order);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await executeQuery(
      `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM services WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// Pricing Tiers
export async function getAllPricingTiers(): Promise<PricingTier[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM pricing_tiers ORDER BY "order" ASC'
    );

    return results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: row.price,
      currency: row.currency || 'CZK',
      interval: (row.interval as 'month' | 'year' | 'one-time') || 'month',
      features: parseJSON(row.features) || [],
      highlighted: Boolean(row.highlighted),
      ctaText: row.cta_text || 'Vybrat balíček',
      ctaLink: row.cta_link || '#contact',
      order: row.order,
      enabled: true,
      createdAt: unixToDate(row.created_at) || undefined,
      updatedAt: unixToDate(row.updated_at) || undefined,
    }));
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    throw error;
  }
}

export async function getPricingTier(id: string): Promise<PricingTier | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM pricing_tiers WHERE id = ?',
      [id]
    );

    if (result) {
      return {
        id: result.id,
        name: result.name,
        description: result.description || '',
        price: result.price,
        currency: result.currency || 'CZK',
        interval: (result.interval as 'month' | 'year' | 'one-time') || 'month',
        features: parseJSON(result.features) || [],
        highlighted: Boolean(result.highlighted),
        ctaText: result.cta_text || 'Vybrat balíček',
        ctaLink: result.cta_link || '#contact',
        order: result.order,
        enabled: true,
        createdAt: unixToDate(result.created_at) || undefined,
        updatedAt: unixToDate(result.updated_at) || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching pricing tier:', error);
    throw error;
  }
}

export async function createPricingTier(tier: Omit<PricingTier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const id = `tier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO pricing_tiers (id, name, price, currency, features, highlighted, "order", created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, tier.name, tier.price, tier.currency, stringifyJSON(tier.features), tier.highlighted ? 1 : 0, tier.order, now, now]
    );

    return id;
  } catch (error) {
    console.error('Error creating pricing tier:', error);
    throw error;
  }
}

export async function updatePricingTier(id: string, tier: Partial<PricingTier>): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (tier.name !== undefined) {
      updates.push('name = ?');
      params.push(tier.name);
    }
    if (tier.price !== undefined) {
      updates.push('price = ?');
      params.push(tier.price);
    }
    if (tier.currency !== undefined) {
      updates.push('currency = ?');
      params.push(tier.currency);
    }
    if (tier.features !== undefined) {
      updates.push('features = ?');
      params.push(stringifyJSON(tier.features));
    }
    if (tier.highlighted !== undefined) {
      updates.push('highlighted = ?');
      params.push(tier.highlighted ? 1 : 0);
    }
    if (tier.order !== undefined) {
      updates.push('"order" = ?');
      params.push(tier.order);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await executeQuery(
      `UPDATE pricing_tiers SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error('Error updating pricing tier:', error);
    throw error;
  }
}

export async function deletePricingTier(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM pricing_tiers WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    throw error;
  }
}

// Process Section & Steps
export async function getProcessSection(): Promise<ProcessSection | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM process_section WHERE id = ?',
      ['current']
    );

    if (result) {
      return {
        heading: result.title || '',
        subheading: result.subtitle || '',
        enabled: true,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching process section:', error);
    throw error;
  }
}

export async function updateProcessSection(section: ProcessSection): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    await executeQuery(
      `INSERT INTO process_section (id, title, subtitle, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         subtitle = excluded.subtitle,
         updated_at = excluded.updated_at`,
      ['current', section.heading, section.subheading, now]
    );
  } catch (error) {
    console.error('Error updating process section:', error);
    throw error;
  }
}

export async function getAllProcessSteps(): Promise<ProcessStep[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM process_steps ORDER BY "order" ASC'
    );

    return results.map(row => ({
      id: row.id,
      number: row.number || '1',
      title: row.title,
      description: row.description,
      icon: row.icon || '',
      order: row.order,
      enabled: true,
      createdAt: unixToDate(row.created_at) || undefined,
      updatedAt: unixToDate(row.updated_at) || undefined,
    }));
  } catch (error) {
    console.error('Error fetching process steps:', error);
    throw error;
  }
}

export async function getProcessStep(id: string): Promise<ProcessStep | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM process_steps WHERE id = ?',
      [id]
    );

    if (result) {
      return {
        id: result.id,
        number: result.number || '1',
        title: result.title,
        description: result.description,
        icon: result.icon || '',
        order: result.order,
        enabled: true,
        createdAt: unixToDate(result.created_at) || undefined,
        updatedAt: unixToDate(result.updated_at) || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching process step:', error);
    throw error;
  }
}

export async function createProcessStep(step: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const id = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO process_steps (id, title, description, icon, "order", created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, step.title, step.description, step.icon, step.order, now, now]
    );

    return id;
  } catch (error) {
    console.error('Error creating process step:', error);
    throw error;
  }
}

export async function updateProcessStep(id: string, step: Partial<ProcessStep>): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (step.title !== undefined) {
      updates.push('title = ?');
      params.push(step.title);
    }
    if (step.description !== undefined) {
      updates.push('description = ?');
      params.push(step.description);
    }
    if (step.icon !== undefined) {
      updates.push('icon = ?');
      params.push(step.icon);
    }
    if (step.order !== undefined) {
      updates.push('"order" = ?');
      params.push(step.order);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await executeQuery(
      `UPDATE process_steps SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error('Error updating process step:', error);
    throw error;
  }
}

export async function deleteProcessStep(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM process_steps WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting process step:', error);
    throw error;
  }
}

// FAQ Section & Items
export async function getFAQSection(): Promise<FAQSection | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM faq_section WHERE id = ?',
      ['current']
    );

    if (result) {
      return {
        heading: result.title || '',
        subheading: result.subtitle || '',
        enabled: true,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching FAQ section:', error);
    throw error;
  }
}

export async function updateFAQSection(section: FAQSection): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    await executeQuery(
      `INSERT INTO faq_section (id, title, subtitle, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         subtitle = excluded.subtitle,
         updated_at = excluded.updated_at`,
      ['current', section.heading, section.subheading, now]
    );
  } catch (error) {
    console.error('Error updating FAQ section:', error);
    throw error;
  }
}

export async function getAllFAQItems(): Promise<FAQItem[]> {
  try {
    const results = await executeQuery<any>(
      'SELECT * FROM faq_items ORDER BY "order" ASC'
    );

    return results.map(row => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      order: row.order,
      enabled: true,
      createdAt: unixToDate(row.created_at) || undefined,
      updatedAt: unixToDate(row.updated_at) || undefined,
    }));
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    throw error;
  }
}

export async function getFAQItem(id: string): Promise<FAQItem | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM faq_items WHERE id = ?',
      [id]
    );

    if (result) {
      return {
        id: result.id,
        question: result.question,
        answer: result.answer,
        order: result.order,
        enabled: true,
        createdAt: unixToDate(result.created_at) || undefined,
        updatedAt: unixToDate(result.updated_at) || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching FAQ item:', error);
    throw error;
  }
}

export async function createFAQItem(faq: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const id = `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO faq_items (id, question, answer, "order", created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, faq.question, faq.answer, faq.order, now, now]
    );

    return id;
  } catch (error) {
    console.error('Error creating FAQ item:', error);
    throw error;
  }
}

export async function updateFAQItem(id: string, faq: Partial<FAQItem>): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const params: any[] = [];

    if (faq.question !== undefined) {
      updates.push('question = ?');
      params.push(faq.question);
    }
    if (faq.answer !== undefined) {
      updates.push('answer = ?');
      params.push(faq.answer);
    }
    if (faq.order !== undefined) {
      updates.push('"order" = ?');
      params.push(faq.order);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await executeQuery(
      `UPDATE faq_items SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error('Error updating FAQ item:', error);
    throw error;
  }
}

export async function deleteFAQItem(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM faq_items WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    throw error;
  }
}

// CTA Section
export async function getCTASection(): Promise<CTASection | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM cta_section WHERE id = ?',
      ['current']
    );

    if (result) {
      return {
        heading: result.title || '',
        subheading: result.description || '',
        primaryButtonText: result.button_text || '',
        primaryButtonLink: result.button_link || '',
        secondaryButtonText: '',
        secondaryButtonLink: '',
        benefits: [],
        enabled: true,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching CTA section:', error);
    throw error;
  }
}

export async function updateCTASection(section: CTASection): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    await executeQuery(
      `INSERT INTO cta_section (id, title, description, button_text, button_link, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         button_text = excluded.button_text,
         button_link = excluded.button_link,
         updated_at = excluded.updated_at`,
      ['current', section.heading, section.subheading, section.primaryButtonText, section.primaryButtonLink, now]
    );
  } catch (error) {
    console.error('Error updating CTA section:', error);
    throw error;
  }
}

// Contact Info
export async function getContactInfo(): Promise<ContactInfo | null> {
  try {
    const result = await executeOne<any>(
      'SELECT * FROM contact_info WHERE id = ?',
      ['current']
    );

    if (result) {
      // ContactInfo interface has complex structure but DB only stores simple fields
      return {
        heading: '',
        subheading: '',
        email: result.email || '',
        address: result.address || '',
        openingHours: { weekdays: '', weekend: '' },
        formLabels: {
          name: '',
          email: '',
          phone: '',
          projectType: '',
          budget: '',
          message: '',
          submit: '',
          submitting: '',
        },
        projectTypes: [],
        budgetOptions: [],
        enabled: true,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw error;
  }
}

export async function updateContactInfo(info: ContactInfo): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    // ContactInfo has complex structure, we just store simple fields in DB for now
    await executeQuery(
      `INSERT INTO contact_info (id, email, address, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         address = excluded.address,
         updated_at = excluded.updated_at`,
      ['current', info.email, info.address, now]
    );
  } catch (error) {
    console.error('Error updating contact info:', error);
    throw error;
  }
}
