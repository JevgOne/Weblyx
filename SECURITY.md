# 🔒 Weblyx Security Documentation

Kompletní přehled bezpečnostních opatření implementovaných v projektu Weblyx.

## 🛡️ Implementovaná bezpečnostní opatření

### 1. Security Headers (next.config.ts:42-98)

**Účel:** Ochrana proti běžným webovým útokům

**Implementované headers:**

| Header | Hodnota | Účel |
|--------|---------|------|
| `X-Frame-Options` | `DENY` | Ochrana proti clickjackingu |
| `X-Content-Type-Options` | `nosniff` | Prevence MIME type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Ochrana proti XSS útokům |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Kontrola referrer informací |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Blokování přístupu k zařízením |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Vynucení HTTPS |
| `Content-Security-Policy` | Detailní CSP policy | Ochrana proti XSS a data injection |

**Content Security Policy detaily:**
```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live
style-src 'self' 'unsafe-inline'
img-src 'self' data: https: blob:
connect-src 'self' https://*.turso.io wss://*.turso.io
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
upgrade-insecure-requests
```

### 2. Rate Limiting (middleware.ts)

**Účel:** Ochrana proti DDoS a brute-force útokům

**Konfigurace:**
- **Public routes:** 60 requestů/minutu/IP
- **API routes:** 20 requestů/minutu/IP
- **Window:** 1 minuta (60 000 ms)

**Response při překročení limitu:**
- Status: `429 Too Many Requests`
- Header: `Retry-After: 60`

**Implementace:**
```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX_REQUESTS = 60; // Public routes
const RATE_LIMIT_MAX_REQUESTS_API = 20; // API routes
```

### 3. Bot Detection (middleware.ts:27-42)

**Účel:** Blokování automatizovaných botů a scraperů

**Detekované patterns:**
```typescript
const SUSPICIOUS_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper',
  'curl', 'wget', 'python-requests',
  'scrapy', 'selenium', 'headless',
  'phantom', 'puppeteer', 'playwright',
];
```

**Akce při detekci:**
- Status: `403 Forbidden`
- Logging: `🚫 Blocked suspicious user agent: {ua} from IP: {ip}`

### 4. Suspicious Query Protection (middleware.ts:44-47)

**Účel:** Ochrana proti common attack patterns

**Blokované patterns:**
```typescript
const SUSPICIOUS_QUERIES = [
  'admin', 'wp-admin', '.env',
  'config', 'backup', 'database'
];
```

**Akce při detekci:**
- Status: `404 Not Found`
- Logging: `🚫 Blocked suspicious query: {path} from IP: {ip}`

### 5. CSRF Protection (middleware.ts:78-95)

**Účel:** Ochrana proti Cross-Site Request Forgery útokům

**Mechanismus:**
- Kontrola `Origin` a `Referer` headers pro POST requesty
- Povolení pouze same-origin requestů
- Exception pro localhost (development)

**Implementace:**
```typescript
if (isApiRoute && request.method === 'POST') {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  const isSameOrigin = origin && origin.includes(host || '');
  const hasReferer = referer && referer.includes(host || '');

  if (!isSameOrigin && !hasReferer && !isLocalhost) {
    return new NextResponse('Forbidden', { status: 403 });
  }
}
```

### 6. Honeypot Anti-Bot System (lib/security/honeypot.ts)

**Účel:** Detekce a blokování automatizovaných formulářových botů

**Komponenty:**

#### 6.1 Honeypot Field
- **Princip:** Skryté pole, které lidé neuvidí, ale boti vyplní
- **Implementace:** Random field name (`website_url_{nanoid}`)
- **CSS hiding:**
```css
position: absolute;
left: -9999px;
width: 1px;
height: 1px;
opacity: 0;
pointer-events: none;
```

#### 6.2 Time-Based Validation
- **Princip:** Formuláře odeslané příliš rychle jsou boti
- **Minimum:** 3 sekundy
- **Maximum:** 1 hodina (prevence replay útoků)
- **Hidden field:** `__form_timestamp`

**Usage:**
```tsx
import { HoneypotInput } from '@/components/security/HoneypotInput';

<form onSubmit={handleSubmit}>
  <HoneypotInput />
  {/* ... other fields ... */}
</form>
```

**Server validation:**
```typescript
import { validateHoneypot, validateSubmissionTime } from '@/lib/security/honeypot';

if (!validateHoneypot(body)) {
  // Bot detected - return fake success
  return NextResponse.json(
    { success: true, message: "Děkujeme!" },
    { status: 200 }
  );
}

if (!validateSubmissionTime(body.__form_timestamp, 3)) {
  // Too fast - return fake success
  return NextResponse.json(
    { success: true, message: "Děkujeme!" },
    { status: 200 }
  );
}
```

**Proč fake success?**
- Bot si myslí, že je úspěšný
- Nepokusí se změnit strategii
- Neplýtvá našimi resources

### 7. Robots.txt Protection (app/robots.ts)

**Účel:** Ochrana citlivých oblasti před indexací

**Blokované cesty:**
```typescript
disallow: [
  '/admin/*',          // Admin panel
  '/api/*',            // API routes
  '/t/*',              // Tracking links (lead generation)
  '/poptavka/dekujeme', // Thank you page
]
```

**Blokované AI crawlery:**
- `GPTBot` (OpenAI)
- `ChatGPT-User` (ChatGPT)
- `CCBot` (Common Crawl)
- `anthropic-ai` (Claude)
- `Claude-Web` (Claude web crawler)

### 8. Anti-Scraping Headers (middleware.ts:97-99)

**Účel:** Dodatečná ochrana proti archivaci a snippetu

```typescript
response.headers.set('X-Robots-Tag', 'noarchive, nosnippet');
```

## 📊 Security Audit Checklist

- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Rate limiting (60 req/min public, 20 req/min API)
- ✅ Bot detection (user-agent filtering)
- ✅ CSRF protection (Origin/Referer validation)
- ✅ Honeypot anti-bot system
- ✅ Time-based form validation
- ✅ Robots.txt protection
- ✅ AI crawler blocking
- ✅ Anti-scraping headers
- ✅ Suspicious query pattern blocking

## 🚨 Security Incident Response

### Pokud detekuješ útok:

1. **Check logs:**
```bash
vercel logs --prod | grep "🚫"
```

2. **Zjisti IP útočníka:**
```bash
vercel logs --prod | grep "Blocked" | tail -20
```

3. **Pokud je to závažné:**
   - Přidej IP do blacklistu v middleware.ts
   - Kontaktuj Vercel support pro DDoS protection

### Rate limit debugging:

```typescript
// V middleware.ts přidej:
console.log(`Rate limit check: IP ${ip} - ${record?.count || 0}/${maxRequests}`);
```

## 🔧 Configuration

### Úprava rate limitů:

```typescript
// middleware.ts
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX_REQUESTS = 60; // Změň tuto hodnotu
const RATE_LIMIT_MAX_REQUESTS_API = 20; // Změň tuto hodnotu
```

### Přidání další blokované user-agent:

```typescript
// middleware.ts
const SUSPICIOUS_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper',
  'tvuj-novy-pattern', // Přidej sem
];
```

### Změna minimum času pro formulář:

```typescript
// lib/security/honeypot.ts
export function validateSubmissionTime(
  timestamp: string | number,
  minSeconds: number = 3 // Změň tuto hodnotu
): boolean
```

## 📈 Monitoring

### Production logs:

```bash
# Všechny security události
vercel logs --prod | grep "🚫"

# Rate limiting
vercel logs --prod | grep "Rate limit"

# Bot detekce
vercel logs --prod | grep "Bot detected"

# Suspicious queries
vercel logs --prod | grep "Blocked suspicious"
```

### Metrics to track:

- Počet blokovaných requestů/den
- Nejčastější blokované IP adresy
- Nejčastější suspicious user agents
- Rate limit hit rate

## 🎯 Best Practices

1. **Never disable security features in production**
   - Security headers jsou kritické
   - Rate limiting chrání infrastructure

2. **Monitor logs regularly**
   - Weekly check security logs
   - Look for patterns v útocích

3. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

4. **Test security features**
   - Před každým deploymentem
   - Po změnách v security logice

5. **Document changes**
   - Update this file při změnách
   - Log všechny security incidents

## 🔐 Environment Variables Security

**NIKDY necommituj:**
- `.env.local`
- `.env.production`
- Jakékoliv soubory s credentials

**Vždy použij:**
- Vercel Environment Variables
- Secret management services

**Check before commit:**
```bash
git diff --cached | grep -i "api_key\|secret\|password\|token"
```

## 📞 Security Contacts

- **Weblyx Security:** info@weblyx.cz
- **Vercel Security:** security@vercel.com
- **Emergency:** Kontaktuj okamžitě při závažném incidentu

---

**Poslední update:** 2025-01-22
**Security Level:** 🔒 High
**Status:** ✅ All systems protected
