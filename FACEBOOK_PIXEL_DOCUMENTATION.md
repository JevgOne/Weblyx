# Facebook Pixel Implementation - Technical Documentation

**Date:** December 7, 2025
**Project:** Weblyx.cz / Seitelyx.de
**Status:** ⚠️ Pixel is installed in `<body>` instead of `<head>`

---

## Current Implementation

### 📍 Location: `app/layout.tsx` (Line 73)

```tsx
<html lang={locale}>
  <head>
    {/* PWA Meta Tags */}
    <meta name="theme-color" content="#14B8A6" />
  </head>
  <body>
    <NextIntlClientProvider messages={messages}>
      <GoogleAnalytics />          <!-- Line 72 -->
      <FacebookPixel />             <!-- Line 73 ⚠️ Currently in BODY -->
      <PWAProvider>
        <Header />
        {children}
        <Footer />
      </PWAProvider>
    </NextIntlClientProvider>
  </body>
</html>
```

---

## ⚠️ Issue Identified

**Current placement:** Facebook Pixel is loaded inside `<body>` tag
**Recommended placement:** Facebook Pixel should be in `<head>` tag

### Why this matters:

1. **Event tracking timing:** Pixel in `<body>` may miss early page events
2. **Lead event reliability:** Form submissions might not track if pixel loads late
3. **Facebook Best Practice:** Official docs recommend `<head>` placement
4. **Race conditions:** User might click "Submit" before pixel fully loads

---

## 📋 Facebook Pixel Code (from `components/analytics/FacebookPixel.tsx`)

### Script Implementation:

```javascript
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
```

### Noscript Fallback:

```html
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" />
</noscript>
```

### Next.js Strategy:

```tsx
<Script
  id="facebook-pixel"
  strategy="afterInteractive"  // Loads after page becomes interactive
  dangerouslySetInnerHTML={{ __html: pixelCode }}
/>
```

---

## 🎯 Lead Event Tracking

### Current Implementation:

File: `components/tracking/LeadButton.tsx`

```tsx
<button onClick={() => {
  window.fbq('track', 'Lead');
  console.log('✅ Facebook Pixel: Lead event tracked');
}}>
  Submit
</button>
```

### Events Tracked:

1. **PageView** - Automatically on every page load
2. **Lead** - When user clicks CTA buttons (via `LeadButton` component)

---

## ✅ Recommended Fix

Move Facebook Pixel from `<body>` to `<head>` for optimal tracking:

### Option 1: Move to Head Tag (Recommended)

```tsx
<html lang={locale}>
  <head>
    <GoogleAnalytics />
    <FacebookPixel />    <!-- MOVE HERE -->
    <meta name="theme-color" content="#14B8A6" />
  </head>
  <body>
    <NextIntlClientProvider messages={messages}>
      <!-- Remove FacebookPixel from here -->
      <Header />
      {children}
    </NextIntlClientProvider>
  </body>
</html>
```

### Option 2: Use beforeInteractive Strategy

Change in `components/analytics/FacebookPixel.tsx`:

```tsx
<Script
  id="facebook-pixel"
  strategy="beforeInteractive"  // Change from afterInteractive
  dangerouslySetInnerHTML={{ __html: pixelCode }}
/>
```

---

## 🧪 Testing Checklist

After fixing placement, verify:

- [ ] Pixel fires on page load (check Facebook Events Manager)
- [ ] PageView event appears immediately
- [ ] Lead event fires when clicking CTA buttons
- [ ] No console errors related to fbq
- [ ] Test on both weblyx.cz and seitelyx.de domains

---

## 📊 Current Status

**Pixel ID Location:** Environment variable `NEXT_PUBLIC_FB_PIXEL_ID`
**Warning shown:** "Facebook Pixel ID not configured" (if env var missing)
**TypeScript support:** ✅ Window.fbq declared globally
**Noscript fallback:** ✅ Implemented

---

## 🔍 How to Verify in Browser

1. Open website in Chrome
2. Right-click → "View Page Source"
3. Search for `fbq('init'`
4. Check if it appears inside `<head>` or `<body>` tags

**Current result:** Code appears in `<body>` tag
**Expected result:** Code should appear in `<head>` tag

---

## 📝 Notes for Marketer

- Pixel IS installed and working
- Events ARE being tracked
- Placement is suboptimal for reliability
- Moving to `<head>` will improve event tracking consistency
- No functionality loss from the change
- Zero impact on page performance (Next.js handles async loading)

---

**Prepared for:** Marketing Team
**Technical Contact:** Development Team
**Next Steps:** Move FacebookPixel component to `<head>` section in layout.tsx
