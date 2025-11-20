# Schema.org Implementation Guide

This document describes the Schema.org structured data implementation for Weblyx website.

## Overview

Schema.org JSON-LD markup has been implemented across all major pages to improve SEO and enable rich snippets in Google search results.

## Implemented Schema Types

### 1. Homepage (`/app/page.tsx`)
- **Organization** - Company information (name, logo, address, contact)
- **WebSite** - Website metadata
- **FAQPage** - Frequently asked questions (dynamic from Firestore)
- **Offer** - Pricing tiers (dynamic from Firestore)

### 2. Services Page (`/app/sluzby/page.tsx`)
- **WebPage** - Page metadata with breadcrumbs
- **Service** - Each service offered (6 services)
- **BreadcrumbList** - Navigation breadcrumbs

### 3. About Page (`/app/o-nas/page.tsx`)
- **AboutPage** - About page metadata
- **Organization** - Company information with founding date
- **WebPage** - Page metadata with breadcrumbs
- **BreadcrumbList** - Navigation breadcrumbs

### 4. Contact Page (`/app/kontakt/page.tsx`)
- **ContactPage** - Contact page metadata
- **LocalBusiness** - Local business info with opening hours
- **WebPage** - Page metadata with breadcrumbs
- **BreadcrumbList** - Navigation breadcrumbs

### 5. Portfolio Page (`/app/portfolio/page.tsx`)
- **CollectionPage** - Portfolio collection metadata
- **CreativeWork** - Each portfolio item (dynamic from Firestore)
- **WebPage** - Page metadata with breadcrumbs
- **BreadcrumbList** - Navigation breadcrumbs

## File Structure

```
/Users/zen/weblyx/
├── components/
│   └── seo/
│       └── JsonLd.tsx              # JSON-LD component for injecting schema
├── lib/
│   └── schema-org.ts               # Schema generators and utilities
└── app/
    ├── page.tsx                    # Homepage with schemas
    ├── sluzby/page.tsx            # Services with schemas
    ├── o-nas/page.tsx             # About with schemas
    ├── kontakt/page.tsx           # Contact with schemas
    └── portfolio/page.tsx         # Portfolio with schemas
```

## Key Components

### JsonLd Component (`/components/seo/JsonLd.tsx`)
A simple React component that injects JSON-LD structured data into the page head.

```tsx
<JsonLd data={schemaObject} />
```

### Schema Generators (`/lib/schema-org.ts`)
Helper functions to generate valid Schema.org markup:

- `generateOrganizationSchema()` - Organization info
- `generateWebSiteSchema()` - Website metadata
- `generateLocalBusinessSchema()` - Local business with hours
- `generateServiceSchema()` - Individual service
- `generateFAQSchema()` - FAQ page with Q&A
- `generateBreadcrumbSchema()` - Breadcrumb navigation
- `generateOfferSchema()` - Pricing/offer
- `generateWebPageSchema()` - Generic webpage
- `generateAboutPageSchema()` - About page
- `generateContactPageSchema()` - Contact page
- `generateCreativeWorkSchema()` - Portfolio item
- `generatePortfolioSchema()` - Portfolio collection

## Testing & Validation

### 1. Google Rich Results Test
Test individual pages:
```
https://search.google.com/test/rich-results
```

Enter your page URLs:
- `https://weblyx.cz`
- `https://weblyx.cz/sluzby`
- `https://weblyx.cz/o-nas`
- `https://weblyx.cz/kontakt`
- `https://weblyx.cz/portfolio`

### 2. Schema.org Validator
Validate schema structure:
```
https://validator.schema.org/
```

### 3. Manual Inspection
View page source and look for `<script type="application/ld+json">` tags.

## Dynamic Data Sources

The following schemas pull data from Firestore:

1. **FAQ Items** (`homepage_faq` collection)
   - Used in: Homepage FAQPage schema
   - Filters: `enabled: true`

2. **Pricing Tiers** (`pricing_tiers` collection)
   - Used in: Homepage Offer schemas
   - Filters: `enabled: true`
   - Order: `order` field

3. **Portfolio Projects** (`portfolio` collection)
   - Used in: Portfolio page CreativeWork schemas
   - Filters: `published: true`
   - Order: `order` field

## Configuration

### Base URL
Set in `/lib/schema-org.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://weblyx.cz';
```

### Organization Data
Default values in `generateOrganizationSchema()`:
- Name: Weblyx
- Email: info@weblyx.cz
- Location: Praha, Czech Republic
- Founding Date: 2025

To customize, pass data object to the function:
```typescript
generateOrganizationSchema({
  name: 'Custom Name',
  email: 'custom@email.cz',
  phone: '+420123456789',
  addressLocality: 'Custom City',
})
```

## CMS Integration (Future Enhancement)

To make schema data editable via admin:

1. Create `site_settings` Firestore collection
2. Add fields:
   - `organization.name`
   - `organization.email`
   - `organization.phone`
   - `organization.logo`
   - `organization.address`
   - `organization.openingHours`

3. Create admin UI to edit these fields
4. Fetch from Firestore in schema generators

## Benefits

1. **Better SEO Rankings** - Structured data helps search engines understand content
2. **Rich Snippets** - Enhanced search results with ratings, prices, FAQs
3. **Knowledge Graph** - Appear in Google Knowledge Panel
4. **Local SEO** - LocalBusiness schema for local search visibility
5. **Voice Search** - Better voice assistant compatibility
6. **Click-Through Rate** - Rich snippets increase CTR by 20-30%

## Maintenance

### Adding New Pages
1. Import JsonLd component and generators
2. Generate appropriate schemas based on page type
3. Add JsonLd components before `<main>` tag
4. Test with Google Rich Results Test

### Updating Data
- Organization info: Update in `/lib/schema-org.ts`
- Dynamic content: Update Firestore collections
- Schema structure: Modify generators in `/lib/schema-org.ts`

## Common Issues

### Schema Not Appearing
- Check if page is server-side rendered (not client-side)
- Verify JSON syntax is valid
- Check browser console for errors

### Validation Errors
- Use Schema.org validator to identify issues
- Ensure required properties are present
- Check data types match schema spec

### Duplicate Schemas
- Ensure each page doesn't repeat same schema type
- Use conditional rendering for optional schemas

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [JSON-LD Specification](https://json-ld.org/)
- [Rich Results Test](https://search.google.com/test/rich-results)

## Version

- Implementation Date: 2025-11-20
- Next.js Version: 14+
- Schema.org Vocabulary: v15.0
