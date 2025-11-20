# Schema.org Testing Guide

## Quick Validation Checklist

After deployment, test each page to ensure Schema.org markup is correctly implemented.

## Testing Steps

### 1. Local Testing (Development)

Start the development server:
```bash
npm run dev
```

Visit each page and view source (Right-click → View Page Source) to verify `<script type="application/ld+json">` tags are present.

### 2. Pages to Test

#### Homepage (`http://localhost:3000`)
Expected schemas:
- [x] Organization
- [x] WebSite
- [x] FAQPage (if FAQs exist in Firestore)
- [x] Offer (one per pricing tier in Firestore)

View source and search for:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  ...
}
</script>
```

#### Services Page (`http://localhost:3000/sluzby`)
Expected schemas:
- [x] WebPage with BreadcrumbList
- [x] Service (6 services)

#### About Page (`http://localhost:3000/o-nas`)
Expected schemas:
- [x] AboutPage
- [x] Organization
- [x] WebPage with BreadcrumbList

#### Contact Page (`http://localhost:3000/kontakt`)
Expected schemas:
- [x] ContactPage
- [x] LocalBusiness (ProfessionalService)
- [x] WebPage with BreadcrumbList

#### Portfolio Page (`http://localhost:3000/portfolio`)
Expected schemas:
- [x] CollectionPage with ItemList
- [x] CreativeWork (one per portfolio item in Firestore)
- [x] WebPage with BreadcrumbList

### 3. Google Rich Results Test

#### Online Testing
1. Deploy your site to production
2. Visit: https://search.google.com/test/rich-results
3. Enter your page URL
4. Click "Test URL"
5. Review results for warnings or errors

#### Test Each URL:
- `https://weblyx.cz`
- `https://weblyx.cz/sluzby`
- `https://weblyx.cz/o-nas`
- `https://weblyx.cz/kontakt`
- `https://weblyx.cz/portfolio`

Expected Results:
- ✅ "Page is eligible for rich results"
- ✅ No errors
- ⚠️ Warnings are acceptable (e.g., recommended fields)

### 4. Schema.org Validator

1. Visit: https://validator.schema.org/
2. Select "Code Snippet" tab
3. Copy the JSON-LD content from your page source
4. Paste and validate
5. Fix any errors reported

### 5. Manual Inspection

#### Browser DevTools
1. Open browser DevTools (F12)
2. Go to Elements/Inspector tab
3. Search for `<script type="application/ld+json">`
4. Verify JSON is properly formatted
5. Check for syntax errors in Console

#### JSON-LD Structure Verification

Example valid structure:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Weblyx",
  "url": "https://weblyx.cz",
  "logo": {
    "@type": "ImageObject",
    "url": "https://weblyx.cz/logo.png"
  },
  "description": "...",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Praha",
    "addressCountry": "CZ"
  }
}
```

### 6. Production Deployment Checks

After deploying to production:

#### A. Search Console Integration
1. Add property to Google Search Console
2. Submit sitemap
3. Wait 2-7 days for indexing
4. Check "Enhancements" section for rich results status

#### B. Monitor Rich Results
- Navigate to Search Console → Enhancements
- Check for:
  - FAQs
  - Breadcrumbs
  - Organization
  - Local Business

#### C. Structured Data Report
- Review "Valid items" count
- Fix any "Invalid items"
- Address warnings if necessary

### 7. Common Issues & Fixes

#### Issue: Schema Not Found
**Symptoms:** No `<script type="application/ld+json">` in page source

**Solutions:**
- Ensure page is server-side rendered (not client-side)
- Check if Firebase data is being fetched
- Verify JsonLd component is imported and used
- Check for JavaScript errors in console

#### Issue: Invalid JSON
**Symptoms:** JSON syntax errors in validator

**Solutions:**
- Check for unescaped quotes in strings
- Verify all required properties are present
- Ensure proper nesting of objects
- Validate JSON structure

#### Issue: Missing Required Properties
**Symptoms:** Validator reports missing required fields

**Solutions:**
- Review Schema.org documentation for type
- Add missing required properties to generator
- Ensure Firestore data includes all necessary fields

#### Issue: Duplicate Schemas
**Symptoms:** Multiple identical schemas on same page

**Solutions:**
- Check for duplicate JsonLd components
- Verify conditional rendering logic
- Remove redundant schema generators

### 8. Performance Checks

#### Page Speed Impact
Schema.org JSON-LD has minimal impact on performance:
- Typical size: 1-5 KB per page
- No render-blocking
- No JavaScript execution needed
- Search engine bots only

#### Monitoring
- Use Lighthouse to check performance score
- Verify Core Web Vitals unchanged
- Monitor page load times

### 9. Ongoing Maintenance

#### Weekly
- Check Google Search Console for new errors
- Review rich results performance

#### Monthly
- Re-test pages with Rich Results Test
- Update schema data if business info changes
- Add schemas for new page types

#### Quarterly
- Review Schema.org updates
- Update implementation for new features
- Optimize based on search performance data

## Expected Rich Results

After successful implementation and indexing (2-7 days), expect:

### Search Results Enhancements
1. **FAQs** - Expandable Q&A in search results
2. **Breadcrumbs** - Navigation path under title
3. **Organization Logo** - Logo in Knowledge Panel
4. **Business Info** - Address, hours, contact in local results
5. **Star Ratings** (future) - When review schema added
6. **Price Range** - From Offer schemas

### Benefits Timeline
- **Immediate:** Proper indexing of structured data
- **1-2 weeks:** Breadcrumbs may appear
- **2-4 weeks:** FAQs may show in results
- **1-3 months:** Full rich results implementation
- **3-6 months:** Improved rankings from structured data

## Troubleshooting Commands

### Check if page is server-rendered
```bash
curl http://localhost:3000 | grep "application/ld+json"
```

### Extract JSON-LD from page
```bash
curl -s http://localhost:3000 | grep -o '<script type="application/ld+json">.*</script>' | sed 's/<[^>]*>//g'
```

### Validate JSON locally
```bash
# Install jq if not installed
brew install jq

# Extract and validate
curl -s http://localhost:3000 | grep -o '<script type="application/ld+json">.*</script>' | sed 's/<script type="application\/ld+json">//g' | sed 's/<\/script>//g' | jq .
```

## Success Criteria

✅ All pages have valid Schema.org markup
✅ No errors in Google Rich Results Test
✅ Schemas visible in page source
✅ JSON-LD validates with Schema.org validator
✅ No performance degradation
✅ Breadcrumbs appear in Search Console (within 1-2 weeks)
✅ Rich results appear in search (within 2-4 weeks)

## Resources

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Documentation](https://schema.org/)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

## Support

If you encounter issues:
1. Check browser console for errors
2. Validate JSON-LD syntax
3. Review Schema.org documentation
4. Test with Rich Results Test
5. Check Firestore data availability
6. Verify server-side rendering is working

---

**Last Updated:** 2025-11-20
**Implementation Status:** ✅ Complete
**Next Review:** After production deployment
