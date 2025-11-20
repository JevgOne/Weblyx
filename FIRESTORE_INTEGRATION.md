# Firestore Integration for Homepage Components

## Overview

The Weblyx homepage components have been updated to fetch data from Firestore instead of using hardcoded values. This implementation uses Next.js 15 Server Components for SEO-optimized server-side data fetching.

## Changes Made

### 1. Firebase Admin Setup (`/Users/zen/weblyx/lib/firebase-admin.ts`)

Created a new Firebase Admin SDK configuration for server-side data fetching with:
- Mock Firestore implementation for development (no real Firebase needed)
- Seed data for all homepage collections
- Support for real Firebase Admin SDK (when installed)

### 2. TypeScript Interfaces (`/Users/zen/weblyx/types/homepage.ts`)

Added TypeScript interfaces for all homepage data types:
- `HeroData` - Hero section data
- `Service` - Service items
- `PortfolioProject` - Portfolio projects
- `PricingTier` - Pricing tier information

### 3. Updated Components

#### Hero Component (`/Users/zen/weblyx/components/home/hero.tsx`)
- ✅ Fetches hero section data from Firestore `homepage_sections/current`
- ✅ Replaced hardcoded text with dynamic data
- ✅ Server Component with async data fetching
- ✅ Fallback data if fetch fails
- ✅ TypeScript properly typed

#### Services Component (`/Users/zen/weblyx/components/home/services.tsx`)
- ✅ Fetches services from Firestore collection `services`
- ✅ Sorts by `order` field
- ✅ Filters by `isActive: true`
- ✅ Server Component with async data fetching
- ✅ Fallback data if fetch fails
- ✅ TypeScript properly typed

#### Portfolio Component (`/Users/zen/weblyx/components/home/portfolio.tsx`)
- ✅ Fetches portfolio projects from Firestore collection `portfolio`
- ✅ Filters: `published: true, featured: true`
- ✅ Limits to 6 projects
- ✅ Sorts by `displayOrder`
- ✅ Server Component with async data fetching
- ✅ Fallback data if fetch fails
- ✅ TypeScript properly typed

#### Pricing Component (`/Users/zen/weblyx/components/home/pricing.tsx`)
- ✅ Fetches pricing tiers from Firestore collection `pricing_tiers`
- ✅ Sorts by `order` field
- ✅ Server Component with async data fetching
- ✅ Fallback data if fetch fails
- ✅ TypeScript properly typed

## Firestore Data Structure

### Collection: `homepage_sections`

Document ID: `current`
```typescript
{
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string; // HTML allowed
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
  stats: Array<{ icon: string; value: string; label: string }>;
}
```

### Collection: `services`

Document fields:
```typescript
{
  id: string;
  icon: string; // Icon name from lucide-react
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}
```

Available icons: `Globe`, `ShoppingCart`, `TrendingUp`, `Palette`, `Zap`, `HeadphonesIcon`

### Collection: `portfolio`

Document fields:
```typescript
{
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  image: string; // Image URL or path
  published: boolean;
  featured: boolean;
  displayOrder: number;
}
```

### Collection: `pricing_tiers`

Document fields:
```typescript
{
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  popular: boolean;
  order: number;
  features: string[];
}
```

## Current Setup (Mock Data)

The implementation currently uses **mock data** stored in memory. This allows development without needing:
- Real Firebase project
- Firebase Admin SDK installation
- Service account credentials

### Mock Data Location

All mock data is defined in `/Users/zen/weblyx/lib/firebase-admin.ts` in the `MockFirestoreAdmin` class constructor.

## Migration to Real Firebase (Future)

To use real Firebase in production:

### Step 1: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Step 2: Update `/Users/zen/weblyx/lib/firebase-admin.ts`

Uncomment the Firebase Admin SDK imports and initialization code at the top of the file, and update:
```typescript
const USE_MOCK = false; // Use real Firebase
```

### Step 3: Set Environment Variables

Create a service account in Firebase Console and add to `.env.local`:
```
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
NEXT_PUBLIC_USE_REAL_FIREBASE=true
```

### Step 4: Populate Firestore

Use Firebase Console or Admin SDK to populate the collections with real data matching the structure above.

## Features

### Error Handling
- ✅ Console error logging for debugging
- ✅ Fallback to default data if fetch fails
- ✅ Graceful degradation

### Performance
- ✅ Server-side rendering (SSR) for better SEO
- ✅ Static at build time when using `force-static`
- ✅ Cached by Next.js automatically

### Type Safety
- ✅ Full TypeScript support
- ✅ Type-safe data structures
- ✅ Type checking at build time

## Testing

### Development Mode
```bash
npm run dev
```

Visit `http://localhost:3000` to see the homepage with mock data.

### Production Build
```bash
npm run build
npm start
```

## Notes

- All components are Next.js 15 Server Components (async functions)
- Data fetching happens on the server for SEO optimization
- Mock implementation mirrors real Firestore API for easy migration
- Icon names must match exported icons from `lucide-react`

## Troubleshooting

### Components showing fallback data
Check console for error messages. Common issues:
- Firestore connection failed
- Data structure mismatch
- Missing required fields

### TypeScript errors
Ensure all data matches the interfaces in `/Users/zen/weblyx/types/homepage.ts`

### Build errors
Run `npm run build` to check for type errors before deployment
