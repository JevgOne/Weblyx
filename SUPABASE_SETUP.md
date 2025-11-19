# 🔧 Supabase Setup - Krok po kroku

## Krok 1: Vytvoření Supabase účtu a projektu

### 1.1 Registrace
1. Jdi na https://supabase.com
2. Klikni na **"Start your project"**
3. Přihlas se pomocí GitHub (doporučeno) nebo emailem
4. Ověř email pokud potřeba

### 1.2 Vytvoření projektu
1. V Supabase dashboardu klikni **"New Project"**
2. Vyplň:
   - **Name**: `weblyx-production` (nebo jak chceš)
   - **Database Password**: Silné heslo (ulož si ho!)
     - Doporučuji: Použij generátor hesel, min 20 znaků
     - Příklad: `Wbx-2025-Secure-DB!@#987`
   - **Region**: `Central EU (Frankfurt)` - nejblíž ČR
   - **Pricing Plan**: Free tier (pro začátek stačí)
3. Klikni **"Create new project"**
4. Počkej ~2 minuty (staví se databáze)

---

## Krok 2: Získání Credentials

### 2.1 API Keys
1. V levém menu klikni **"Settings"** (ikona ozubeného kola)
2. Klikni **"API"**
3. Najdi a zkopíruj:

**Project URL:**
```
https://xxxxxxxxxxxxxx.supabase.co
```

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4IiwicnJsIjoiYW5vbiIsImlhdCI6MTcwNjE4MjQwMCwiZXhwIjoyMDIxNzU4NDAwfQ...
```

**service_role key (TAJNÉ!):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNjE4MjQwMCwiZXhwIjoyMDIxNzU4NDAwfQ...
```

⚠️ **DŮLEŽITÉ**: Service role key NIKDY nesdílej a nedávej do klientského kódu!

### 2.2 Database Password
- Heslo které jsi zadal při vytváření projektu
- Pokud jsi ho zapomněl: Settings → Database → Reset Database Password

---

## Krok 3: Konfigurace ENV Variables

Vytvoř soubor `.env.local` v root složce projektu:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=Weblyx

# Email Configuration (později)
RESEND_API_KEY=re_xxxxxxxxxx
```

⚠️ Přidej `.env.local` do `.gitignore`!

---

## Krok 4: Inicializace databázového schématu

### 4.1 Otevři SQL Editor
1. V Supabase dashboardu → levé menu → **"SQL Editor"**
2. Klikni **"New query"**

### 4.2 Spusť SQL migraci
Zkopíruj a spusť SQL ze souboru `supabase/migrations/001_initial_schema.sql`

**Postup:**
1. Otevři `001_initial_schema.sql` (vytvoříme v dalším kroku)
2. Zkopíruj celý SQL kód
3. Vlož do SQL Editoru v Supabase
4. Klikni **"Run"** (Ctrl+Enter)
5. Zkontroluj že vše proběhlo bez chyb ✅

### 4.3 Ověření
1. Jdi na **"Table Editor"** v levém menu
2. Měl bys vidět všechny tabulky:
   - profiles
   - user_roles
   - leads
   - projects
   - project_todos
   - project_files
   - project_timeline
   - project_milestones
   - emails
   - calendar_events
   - blog_posts
   - newsletter_subscribers
   - settings

---

## Krok 5: Vytvoření prvního admin uživatele

### 5.1 Registrace přes Auth
1. Supabase Dashboard → **"Authentication"** → **"Users"**
2. Klikni **"Add user"** → **"Create new user"**
3. Vyplň:
   - **Email**: tvůj@email.cz
   - **Password**: Silné heslo
   - **Auto Confirm User**: ✅ ANO (zatím)
4. Klikni **"Create user"**
5. Zkopíruj si **UUID** uživatele (např. `d290f1ee-6c54-4b01-90e6-d701748f0851`)

### 5.2 Přidání admin role
1. Jdi na **"SQL Editor"**
2. Spusť tento SQL (nahraď UUID):

```sql
-- Nahraď 'TVOJE-UUID-ZDE' za UUID svého uživatele
INSERT INTO public.user_roles (user_id, role)
VALUES ('TVOJE-UUID-ZDE', 'admin');
```

3. Ověř že vše funguje:

```sql
-- Zkontroluj zda má uživatel admin roli
SELECT * FROM public.user_roles WHERE user_id = 'TVOJE-UUID-ZDE';

-- Otestuj has_role funkci
SELECT public.has_role('TVOJE-UUID-ZDE', 'admin');
-- Mělo by vrátit: true
```

---

## Krok 6: Nastavení Storage pro soubory

### 6.1 Vytvoření Storage Bucket
1. Supabase Dashboard → **"Storage"**
2. Klikni **"New bucket"**
3. Vytvoř:
   - **Name**: `project-files`
   - **Public**: ❌ NE (soukromé)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: prázdné (všechny typy)
4. Klikni **"Create bucket"**

### 6.2 Storage Policies
1. Klikni na bucket `project-files`
2. Jdi na **"Policies"** tab
3. Klikni **"New policy"**

**Policy 1: Admin může nahrávat**
```sql
-- INSERT policy
CREATE POLICY "Admin can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files'
  AND public.has_role(auth.uid(), 'admin')
);
```

**Policy 2: Admin může číst**
```sql
-- SELECT policy
CREATE POLICY "Admin can read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files'
  AND public.has_role(auth.uid(), 'admin')
);
```

**Policy 3: Admin může mazat**
```sql
-- DELETE policy
CREATE POLICY "Admin can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND public.has_role(auth.uid(), 'admin')
);
```

---

## Krok 7: Testování připojení

### 7.1 Test z lokálního projektu
Spusť tento test script:

```bash
npm run test:supabase
```

Nebo manuálně zkontroluj připojení:

```typescript
// test-connection.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');

  // Test 1: Database connection
  const { data, error } = await supabase.from('profiles').select('count');
  if (error) {
    console.error('❌ Database error:', error);
  } else {
    console.log('✅ Database connected!');
  }

  // Test 2: Auth
  const { data: { user } } = await supabase.auth.getUser();
  console.log('👤 Current user:', user ? user.email : 'Not logged in');

  // Test 3: Storage
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('📦 Storage buckets:', buckets?.map(b => b.name));
}

testConnection();
```

---

## Krok 8: Email Setup (Resend) - LATER

Pro odesílání emailů (kontaktní formuláře, notifikace):

### 8.1 Registrace Resend
1. Jdi na https://resend.com
2. Registruj se (GitHub nebo email)
3. Verify email
4. Free plan: 3000 emailů/měsíc, 100/den

### 8.2 Vytvoření API Key
1. Resend Dashboard → **"API Keys"**
2. Klikni **"Create API Key"**
3. Name: `weblyx-production`
4. Permission: **Full access**
5. Zkopíruj API key: `re_xxxxxxxxxxxx`
6. Přidej do `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@weblyx.cz
```

### 8.3 Doména verifikace (optional)
Pro posílání z vlastní domény (info@weblyx.cz):
1. Resend → **"Domains"** → **"Add Domain"**
2. Přidej: `weblyx.cz`
3. Nastav DNS záznamy (poskytne Resend)
4. Počkej na verifikaci

---

## Krok 9: Supabase Edge Functions (LATER)

Pro složitější backend logiku (email sending, AI integrace):

### 9.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 9.2 Login
```bash
supabase login
```

### 9.3 Link projekt
```bash
supabase link --project-ref xxxxxxxxxxxxxx
```

### 9.4 Vytvoření funkce
```bash
supabase functions new send-email
```

Vytvoří: `supabase/functions/send-email/index.ts`

---

## Krok 10: Production Deployment

### 10.1 Vercel Environment Variables
1. Vercel Dashboard → tvůj projekt → **"Settings"** → **"Environment Variables"**
2. Přidej:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (POUZE pro Edge Functions!)
   - `RESEND_API_KEY`
3. Redeploy projekt

### 10.2 Supabase Production Settings
1. Supabase Dashboard → **"Settings"** → **"API"**
2. **"Site URL"**: Přidej `https://weblyx.vercel.app`
3. **"Redirect URLs"**: Přidej:
   - `https://weblyx.vercel.app/**`
   - `http://localhost:5173/**` (pro dev)

---

## ✅ Checklist dokončení

- [ ] Supabase projekt vytvořen
- [ ] Credentials zkopírovány do `.env.local`
- [ ] Databázové schéma vytvořeno (všechny tabulky)
- [ ] RLS policies aktivovány
- [ ] První admin uživatel vytvořen
- [ ] Admin role přiřazena
- [ ] Storage bucket vytvořen
- [ ] Storage policies nastaveny
- [ ] Připojení otestováno z lokálního projektu
- [ ] Resend účet vytvořen (pro emaily)
- [ ] Production ENV variables nastaveny ve Vercelu

---

## 🐛 Troubleshooting

### Problém: "Failed to fetch" při připojení
**Řešení:**
- Zkontroluj že VITE_SUPABASE_URL a KEY jsou správně v `.env.local`
- Restartuj dev server (`npm run dev`)
- Zkontroluj že Supabase projekt není v pause (free plan se po týdnu inactivity pausne)

### Problém: "row-level security policy" error
**Řešení:**
- Zkontroluj že RLS policies jsou správně nastavené
- Zkontroluj že user má admin roli v `user_roles` tabulce
- Otestuj `has_role()` funkci přes SQL Editor

### Problém: "Invalid API key" při uploadu do Storage
**Řešení:**
- Zkontroluj Storage policies
- Zkontroluj že používáš authenticated session (ne anon key)

### Problém: Emaily se neodesílají
**Řešení:**
- Zkontroluj RESEND_API_KEY v ENV
- Zkontroluj limity (100 emailů/den na free)
- Zkontroluj spam složku příjemce

---

## 📚 Další zdroje

- **Supabase Docs**: https://supabase.com/docs
- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Resend Docs**: https://resend.com/docs
- **Supabase Storage**: https://supabase.com/docs/guides/storage

---

**Status:** ✅ Setup připraven

**Další krok:** Vytvoření databázového schématu (`001_initial_schema.sql`)

---

**🤖 Generated with Claude Code**

**Co-Authored-By:** Claude <noreply@anthropic.com>
