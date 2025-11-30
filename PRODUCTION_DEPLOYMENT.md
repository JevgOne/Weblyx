# 🚀 Production Deployment Guide - Weblyx

This guide will help you deploy Weblyx to production with working email notifications and admin panel.

## ✅ Prerequisites Checklist

Before deploying, make sure you have:

- [ ] Turso database configured with all migrations run
- [ ] Resend API key for email notifications
- [ ] Google Gemini API key for AI features
- [ ] VAPID keys for push notifications (already generated in `.env.local`)
- [ ] Admin credentials (email + password)
- [ ] Vercel account

---

## 🗄️ Step 1: Run Turso Migrations

Before deploying, ensure all database tables are created:

```bash
# Login to Turso (if not already logged in)
turso auth login

# Run migrations
turso db shell weblyx < migrations/003_push_subscriptions.sql
turso db shell weblyx < migrations/004_admin_sessions_and_ai_leads.sql
```

**Verify migrations:**
```bash
turso db shell weblyx "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see:
- `leads`
- `admin_sessions`
- `push_subscriptions`
- `projects`
- `portfolio`
- (and other CMS tables)

---

## 🔑 Step 2: Gather Required Environment Variables

### Required Environment Variables:

```bash
# Admin Authentication
ADMIN_EMAIL=zenuly3@gmail.com
ADMIN_PASSWORD=YourSecurePassword123

# Email Notifications (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@weblyx.cz

# AI Features (Google Gemini - for design & brief generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Push Notifications (Web Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBjgjmPDIUVGAW95sbsKbpi0sepS2rLKkVclgHYu0vItKEFQaWaAON3IAPiobfHg673X4_RUZUAnVJ1_5GAEoqA
VAPID_PRIVATE_KEY=r1aP1mo7kHbEpKF2e4JFSLFB-Xe2wp88vFWu4KVQ7qk

# Turso Database
TURSO_DATABASE_URL=libsql://weblyx-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://weblyx.cz
NEXT_PUBLIC_SITE_NAME=Weblyx
```

### How to Get API Keys:

#### Resend API Key:
1. Go to https://resend.com
2. Sign up / Log in
3. Go to "API Keys" section
4. Create new API key
5. Copy the key (starts with `re_`)

#### Google Gemini API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select your Google Cloud project (or create new one)
4. Copy the API key (starts with `AIza...`)

**Note:** All AI features (design generation, brief generation, alt text generation) use Gemini.

#### Turso Credentials:
```bash
# Get database URL
turso db show weblyx --url

# Get auth token
turso db tokens create weblyx
```

---

## 📦 Step 3: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to existing project or create new one
vercel link

# Add environment variables
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production
vercel env add VAPID_PRIVATE_KEY production
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_NAME production

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Import your Git repository (GitHub/GitLab)
3. In project settings → Environment Variables
4. Add all variables from Step 2
5. Mark them as "Production"
6. Deploy

---

## ✅ Step 4: Verify Deployment

### 1. Test Admin Login
```bash
# Visit admin panel
open https://weblyx.cz/admin/login

# Login with:
Email: zenuly3@gmail.com
Password: (your ADMIN_PASSWORD)
```

### 2. Test Lead Form + Email Notifications
```bash
# Visit homepage
open https://weblyx.cz

# Fill out the lead questionnaire form
# You should receive an email to ADMIN_EMAIL
```

### 3. Test API Status
```bash
# Check API status endpoint
curl https://weblyx.cz/api/status

# Should return:
{
  "environment": {
    "NODE_ENV": "production",
    "hasTursoUrl": true,
    "hasTursoToken": true
  },
  "database": {
    "type": "Turso (SQLite)",
    "leadsCount": 0,  // or number of leads
    "error": null
  }
}
```

---

## 📱 Step 5: Install PWA on Mobile (Optional)

### For Admin Push Notifications:

1. Visit https://weblyx.cz/admin on mobile
2. Click "Add to Home Screen" in browser menu
3. Open the installed app
4. Login to admin
5. Go to /admin/leads
6. Click "Enable Push Notifications"
7. Allow notifications in browser

Now you'll receive push notifications when new leads arrive!

---

## 🐛 Troubleshooting

### Email Notifications Not Working?

**Check Resend API Key:**
```bash
# Verify env variable is set
vercel env pull
grep RESEND_API_KEY .env.local
```

**Check Resend Dashboard:**
- Login to https://resend.com
- Check "Logs" section for failed emails
- Verify domain is verified (or use resend.dev domain for testing)

**Check application logs:**
```bash
vercel logs --follow
```

### Admin Login Not Working?

**Check credentials:**
```bash
# Verify env variables
vercel env ls

# Should show ADMIN_EMAIL and ADMIN_PASSWORD
```

**Clear browser cookies:**
- Open browser DevTools
- Application → Cookies
- Delete all cookies for weblyx.cz
- Try logging in again

### Database Errors?

**Check Turso connection:**
```bash
# Test database connection
turso db shell weblyx "SELECT COUNT(*) FROM leads;"
```

**Check env variables:**
```bash
vercel env pull
grep TURSO .env.local
```

### Build Failures?

**Check build logs:**
```bash
vercel logs
```

**Common issues:**
- Missing environment variables
- Turso connection timeout (check TURSO_AUTH_TOKEN)
- Missing dependencies

---

## 📧 Email Flow (How It Works)

```
1. User fills out lead form on homepage
   ↓
2. POST /api/leads
   ↓
3. Save lead to Turso database
   ↓
4. Send admin notification email (Resend)
   - To: ADMIN_EMAIL
   - Subject: "🔔 Nová poptávka!"
   ↓
5. Send push notification to admin (if enabled)
   ↓
6. Trigger AI design generation (background)
   ↓
7. Trigger AI brief generation (background)
   ↓
8. Send client proposal email with AI suggestions
   - To: client email from form
   - Subject: "Návrh webu pro [company]"
```

---

## 🎉 Post-Deployment Checklist

- [ ] Admin login works
- [ ] Lead form submission works
- [ ] Admin receives email notification
- [ ] Leads appear in /admin/leads dashboard
- [ ] AI design suggestions generate
- [ ] Push notifications work (if enabled)
- [ ] PWA installs on mobile
- [ ] Database queries are fast (<100ms)

---

## 🔄 Updating Production

```bash
# Make changes locally
git add .
git commit -m "your changes"
git push origin main

# Vercel will automatically deploy
# Or manually trigger:
vercel --prod
```

---

## 📚 Additional Resources

- **Turso Migrations:** See `/TURSO_ONLY_MIGRATION.md`
- **PWA Setup:** See `/PWA_MOBILE_ADMIN_SETUP.md` (if exists)
- **Email Templates:** See `/lib/email/lead-templates.ts`

---

## 🆘 Need Help?

If something doesn't work:

1. Check Vercel deployment logs: `vercel logs`
2. Check browser console for errors
3. Check Resend dashboard for email errors
4. Check Turso database for data
5. Verify all environment variables are set correctly

---

**🎉 That's it! Your Weblyx website is now live in production with full email notifications!**
