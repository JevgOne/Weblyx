# Next.js 15 Adaptation Plan - Weblyx

## Rozdíly oproti původní specifikaci (React + Vite)

### ✅ Co zůstává stejné:
- React 19 + TypeScript
- Tailwind CSS
- shadcn/ui komponenty
- Design system (barvy, typografie)
- Celková struktura stránek
- Backend: Supabase (místo Lovable Cloud)
- Business logika a features

### 🔄 Co se mění:

#### 1. **Build Tool & Framework**
**Original:** React + Vite
**New:** Next.js 15 App Router

**Výhody:**
- ✅ Server-side rendering (SSR) pro lepší SEO
- ✅ Automatická optimalizace obrázků (next/image)
- ✅ File-based routing (jednodušší struktura)
- ✅ API routes místo Supabase Edge Functions (volitelně)
- ✅ Built-in optimalizace (code splitting, lazy loading)

#### 2. **Routing**
**Original:** React Router v6
**New:** Next.js App Router (file-based)

**Mapping:**
```
Original (React Router)     →    Next.js App Router
────────────────────────────────────────────────────
/                           →    app/page.tsx
/o-nas                      →    app/o-nas/page.tsx
/sluzby                     →    app/sluzby/page.tsx
/portfolio                  →    app/portfolio/page.tsx
/portfolio/:slug            →    app/portfolio/[slug]/page.tsx
/blog                       →    app/blog/page.tsx
/blog/:slug                 →    app/blog/[slug]/page.tsx
/kontakt                    →    app/kontakt/page.tsx
/poptavka                   →    app/poptavka/page.tsx
/admin                      →    app/admin/page.tsx
/admin/login                →    app/admin/login/page.tsx
/admin/inquiries            →    app/admin/inquiries/page.tsx
/admin/inquiries/:id        →    app/admin/inquiries/[id]/page.tsx
/admin/projects             →    app/admin/projects/page.tsx
```

#### 3. **Project Structure**

```
weblyx/
├── app/                          # App Router (NEW)
│   ├── layout.tsx                # Root layout (Header, Footer)
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Global styles + design system
│   ├── o-nas/
│   │   └── page.tsx
│   ├── sluzby/
│   │   └── page.tsx
│   ├── portfolio/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── kontakt/
│   │   └── page.tsx
│   ├── poptavka/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx            # Admin layout
│   │   ├── page.tsx              # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── inquiries/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── projects/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── api/                      # API Routes (optional)
│   │   ├── contact/
│   │   │   └── route.ts
│   │   ├── questionnaire/
│   │   │   └── route.ts
│   │   └── ai/
│   │       ├── generate-spec/
│   │       │   └── route.ts
│   │       └── chat/
│   │           └── route.ts
│   └── not-found.tsx             # 404 page
├── components/                   # React components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-menu.tsx
│   ├── home/
│   │   ├── hero.tsx
│   │   ├── services.tsx
│   │   ├── stats.tsx
│   │   └── ...
│   ├── admin/
│   │   ├── dashboard.tsx
│   │   ├── inquiries-list.tsx
│   │   └── ...
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── ...
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── utils.ts                  # Utility functions
│   └── api.ts                    # API helpers
├── hooks/
│   ├── use-auth.ts
│   ├── use-inquiries.ts
│   └── ...
├── types/
│   ├── inquiry.ts
│   ├── project.ts
│   └── ...
├── public/                       # Static assets
│   ├── images/
│   └── ...
├── supabase/                     # Supabase config
│   ├── migrations/
│   └── ...
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

#### 4. **Backend & Database**

**Original:** Lovable Cloud (Supabase managed)
**New:** Supabase (self-hosted project)

**Setup:**
```bash
# 1. Create Supabase project
# Go to https://supabase.com

# 2. Install Supabase client
npm install @supabase/supabase-js

# 3. Setup env variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Database Schema:** Použij stejné SQL schema z původní specifikace (section 10.3)

#### 5. **AI Integration**

**Original:** Lovable AI Gateway
**Options for Next.js:**

**Option A: Supabase Edge Functions** (recommended)
```typescript
// supabase/functions/generate-spec/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // AI logic here
})
```

**Option B: Next.js API Routes + Vercel AI SDK**
```bash
npm install ai @ai-sdk/google
```

```typescript
// app/api/ai/generate-spec/route.ts
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: Request) {
  const { inquiryData } = await req.json()

  const { text } = await generateText({
    model: google('gemini-2.0-flash-exp'),
    prompt: `Generate project spec: ${JSON.stringify(inquiryData)}`
  })

  return Response.json({ spec: text })
}
```

**Option C: Direct API calls (OpenAI, Anthropic, Google)**
```bash
npm install openai
# or
npm install @anthropic-ai/sdk
```

#### 6. **Forms & Validation**

**Stejné:** React Hook Form + Zod

```bash
npm install react-hook-form zod @hookform/resolvers
```

**Server Actions (Next.js feature):**
```typescript
// app/actions/submit-inquiry.ts
'use server'

export async function submitInquiry(data: InquiryData) {
  // Validate with Zod
  // Save to Supabase
  // Send email
  return { success: true }
}
```

#### 7. **Authentication**

**Stejné:** Supabase Auth

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Middleware pro protected routes:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check auth for /admin routes
}

export const config = {
  matcher: '/admin/:path*'
}
```

#### 8. **SEO Optimization**

**Next.js built-in SEO:**

```typescript
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tvorba webů od 10 000 Kč | Weblyx',
  description: 'Profesionální webové stránky za skvělé ceny...',
  openGraph: {
    title: 'Tvorba webů od 10 000 Kč',
    description: '...',
    images: ['/og-image.jpg']
  }
}

export default function HomePage() {
  return <main>...</main>
}
```

**Structured Data:**
```typescript
// app/page.tsx
export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Weblyx',
    // ...
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>...</main>
    </>
  )
}
```

#### 9. **Image Optimization**

**Use next/image:**
```typescript
import Image from 'next/image'

<Image
  src="/hero-bg.jpg"
  alt="Hero background"
  width={1920}
  height={1080}
  priority
/>
```

#### 10. **Deployment**

**Original:** Lovable deployment
**New:** Vercel (optimized for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Connect to GitHub (automatic deployments)
vercel --prod
```

---

## Updated Tech Stack

### Frontend
- ✅ Next.js 15 (App Router)
- ✅ React 19
- ✅ TypeScript
- ✅ Tailwind CSS 3+
- ✅ shadcn/ui (Radix UI)
- ✅ Lucide React (icons)
- ✅ React Hook Form + Zod

### Backend
- ✅ Supabase (PostgreSQL)
- ✅ Supabase Auth
- ✅ Supabase Storage
- ✅ Supabase Edge Functions OR Next.js API Routes

### AI
**Choose one:**
- A) Vercel AI SDK + Google Gemini
- B) Supabase Edge Functions + Gemini API
- C) Direct API calls (OpenAI/Anthropic)

### Deployment
- ✅ Vercel (recommended)
- ✅ GitHub (version control)

---

## Installation & Setup Steps

### 1. Dependencies

```bash
# Core
npm install @supabase/supabase-js

# Forms
npm install react-hook-form zod @hookform/resolvers

# UI Components (shadcn/ui)
npx shadcn@latest init

# Icons
npm install lucide-react

# AI (choose one)
npm install ai @ai-sdk/google
# OR
npm install openai
# OR
npm install @anthropic-ai/sdk

# Utils
npm install clsx tailwind-merge
npm install class-variance-authority
```

### 2. Environment Variables

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI (choose based on provider)
GOOGLE_GENERATIVE_AI_API_KEY=your-key
# OR
OPENAI_API_KEY=your-key
# OR
ANTHROPIC_API_KEY=your-key

# Site
NEXT_PUBLIC_SITE_URL=https://weblyx.cz
```

### 3. Tailwind Config (Design System)

Update `tailwind.config.ts` with custom colors from spec:
```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... rest of design system
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 4. Global CSS (Design System Variables)

Create `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    /* ... rest from spec section 3.1 */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme */
  }
}
```

---

## Migration Checklist from Vite to Next.js

- [x] ~~`import { BrowserRouter }`~~ → File-based routing
- [x] ~~`<Routes>`~~ → `app/` directory structure
- [x] ~~`<Link to="">`~~ → `<Link href="">` (next/link)
- [x] ~~`useNavigate()`~~ → `useRouter()` (next/navigation)
- [x] ~~`import.meta.env.VITE_*`~~ → `process.env.NEXT_PUBLIC_*`
- [x] ~~`<img>`~~ → `<Image>` (next/image)
- [x] Client components need `'use client'` directive
- [x] Server components by default (better performance)

---

## Implementation Priority (Updated for Next.js)

### Phase 1: Foundation (Week 1)
1. ✅ Basic Next.js structure
2. ⬜ Design system (globals.css + tailwind.config)
3. ⬜ Layout (Header + Footer)
4. ⬜ Homepage sections
5. ⬜ shadcn/ui setup

### Phase 2: Public Pages (Week 2)
1. ⬜ O nás page
2. ⬜ Služby page
3. ⬜ Portfolio page + [slug]
4. ⬜ Blog page + [slug]
5. ⬜ Kontakt page

### Phase 3: Backend (Week 3-4)
1. ⬜ Supabase setup
2. ⬜ Database schema
3. ⬜ Multi-step questionnaire
4. ⬜ Form submission → Supabase
5. ⬜ Email notifications

### Phase 4: Admin Panel (Week 5-6)
1. ⬜ Auth middleware
2. ⬜ Admin layout
3. ⬜ Dashboard
4. ⬜ Inquiries management
5. ⬜ Projects Kanban

### Phase 5: AI Integration (Week 7)
1. ⬜ Choose AI provider
2. ⬜ API routes / Edge functions
3. ⬜ Project spec generation
4. ⬜ Quote generation
5. ⬜ FAQ chatbot

---

## Advantages of Next.js over Vite for this project

1. **Better SEO** - SSR/SSG out of the box
2. **Image optimization** - Automatic WebP conversion
3. **API routes** - No need for separate backend
4. **File-based routing** - Simpler than React Router
5. **Vercel deployment** - One-click deployment
6. **Performance** - Automatic code splitting
7. **TypeScript** - Better integration
8. **Middleware** - Easy auth protection

---

**Status:** Ready for implementation
**Next Step:** Create project structure
