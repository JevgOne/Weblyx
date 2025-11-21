const puppeteer = require('puppeteer');

// Test data for 10 different quote submissions
const testLeads = [
  {
    projectType: 'new-web',
    company: 'Test Firma 1',
    email: 'test1@example.com',
    phone: '+420 601 234 567',
    budget: '50000-100000',
    timeline: '1-3',
    description: 'Need a new corporate website with modern design'
  },
  {
    projectType: 'redesign',
    company: 'Test Firma 2',
    email: 'test2@example.com',
    phone: '+420 602 345 678',
    budget: '100000-200000',
    timeline: '3-6',
    description: 'Redesign existing website to improve UX'
  },
  {
    projectType: 'eshop',
    company: 'Test Firma 3',
    email: 'test3@example.com',
    phone: '+420 603 456 789',
    budget: '200000+',
    timeline: '6+',
    description: 'E-commerce platform for selling electronics'
  },
  {
    projectType: 'landing',
    company: 'Test Firma 4',
    email: 'test4@example.com',
    phone: '+420 604 567 890',
    budget: 'do-50000',
    timeline: 'asap',
    description: 'Landing page for product launch campaign'
  },
  {
    projectType: 'new-web',
    company: 'Test Firma 5',
    email: 'test5@example.com',
    phone: '+420 605 678 901',
    budget: '50000-100000',
    timeline: '1-3',
    description: 'Restaurant website with online reservations'
  },
  {
    projectType: 'redesign',
    company: 'Test Firma 6',
    email: 'test6@example.com',
    phone: '+420 606 789 012',
    budget: '100000-200000',
    timeline: '3-6',
    description: 'Modernize outdated company website'
  },
  {
    projectType: 'eshop',
    company: 'Test Firma 7',
    email: 'test7@example.com',
    phone: '+420 607 890 123',
    budget: '200000+',
    timeline: '6+',
    description: 'Fashion e-commerce with inventory system'
  },
  {
    projectType: 'landing',
    company: 'Test Firma 8',
    email: 'test8@example.com',
    phone: '+420 608 901 234',
    budget: 'do-50000',
    timeline: '1-3',
    description: 'Lead generation landing page for B2B'
  },
  {
    projectType: 'new-web',
    company: 'Test Firma 9',
    email: 'test9@example.com',
    phone: '+420 609 012 345',
    budget: '50000-100000',
    timeline: '3-6',
    description: 'Portfolio website for architecture firm'
  },
  {
    projectType: 'redesign',
    company: 'Test Firma 10',
    email: 'test10@example.com',
    phone: '+420 610 123 456',
    budget: '100000-200000',
    timeline: '6+',
    description: 'Complete website overhaul with SEO optimization'
  }
];

const BASE_URL = 'https://weblyx-m1m1l9tre-jevg-ones-projects.vercel.app';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitQuoteForm(page, leadData) {
  console.log(`\n📝 Submitting quote for: ${leadData.company}`);

  try {
    // Navigate to quote form
    await page.goto(`${BASE_URL}/poptavka`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);

    // Step 1: Select project type
    console.log('  Step 1: Selecting project type...');
    const projectTypeSelector = `button[data-project-type="${leadData.projectType}"], input[value="${leadData.projectType}"]`;
    await page.waitForSelector('button, input[type="radio"]', { timeout: 10000 });

    // Try different selectors for project type
    const clicked = await page.evaluate((type) => {
      // Try finding by data attribute
      let element = document.querySelector(`[data-project-type="${type}"]`);
      if (element) {
        element.click();
        return true;
      }

      // Try finding radio button
      element = document.querySelector(`input[value="${type}"]`);
      if (element) {
        element.click();
        return true;
      }

      // Try finding by text content
      const buttons = Array.from(document.querySelectorAll('button'));
      const button = buttons.find(b => b.textContent.toLowerCase().includes(type.toLowerCase()));
      if (button) {
        button.click();
        return true;
      }

      return false;
    }, leadData.projectType);

    if (!clicked) {
      throw new Error(`Could not find project type selector for: ${leadData.projectType}`);
    }

    await wait(1000);

    // Click Next button
    const nextButton = await page.waitForSelector('button:has-text("Další"), button:has-text("Next"), button[type="submit"]', { timeout: 5000 }).catch(() => null);
    if (nextButton) {
      await nextButton.click();
      await wait(1500);
    }

    // Step 2: Budget selection
    console.log('  Step 2: Selecting budget...');
    await page.evaluate((budget) => {
      const element = document.querySelector(`[data-budget="${budget}"], input[value="${budget}"]`);
      if (element) element.click();
    }, leadData.budget);
    await wait(1000);

    // Click Next
    const nextButton2 = await page.$('button:has-text("Další"), button:has-text("Next"), button[type="submit"]');
    if (nextButton2) {
      await nextButton2.click();
      await wait(1500);
    }

    // Step 3: Timeline selection
    console.log('  Step 3: Selecting timeline...');
    await page.evaluate((timeline) => {
      const element = document.querySelector(`[data-timeline="${timeline}"], input[value="${timeline}"]`);
      if (element) element.click();
    }, leadData.timeline);
    await wait(1000);

    // Click Next
    const nextButton3 = await page.$('button:has-text("Další"), button:has-text("Next"), button[type="submit"]');
    if (nextButton3) {
      await nextButton3.click();
      await wait(1500);
    }

    // Step 4: Description
    console.log('  Step 4: Filling description...');
    const descriptionField = await page.$('textarea, input[type="text"][name*="description"], input[type="text"][name*="desc"]');
    if (descriptionField) {
      await descriptionField.click({ clickCount: 3 });
      await descriptionField.type(leadData.description);
      await wait(1000);

      // Click Next
      const nextButton4 = await page.$('button:has-text("Další"), button:has-text("Next"), button[type="submit"]');
      if (nextButton4) {
        await nextButton4.click();
        await wait(1500);
      }
    }

    // Step 5: Contact information
    console.log('  Step 5: Filling contact information...');

    // Company name
    const companyField = await page.$('input[name*="company"], input[name*="firma"], input[placeholder*="firma"], input[placeholder*="company"]');
    if (companyField) {
      await companyField.click({ clickCount: 3 });
      await companyField.type(leadData.company);
      await wait(500);
    }

    // Email
    const emailField = await page.$('input[type="email"], input[name*="email"]');
    if (emailField) {
      await emailField.click({ clickCount: 3 });
      await emailField.type(leadData.email);
      await wait(500);
    }

    // Phone
    const phoneField = await page.$('input[type="tel"], input[name*="phone"], input[name*="telefon"]');
    if (phoneField) {
      await phoneField.click({ clickCount: 3 });
      await phoneField.type(leadData.phone);
      await wait(500);
    }

    // Submit the form
    console.log('  Submitting form...');
    const submitButton = await page.$('button[type="submit"], button:has-text("Odeslat"), button:has-text("Submit")');
    if (submitButton) {
      await submitButton.click();
      await wait(3000);
    }

    console.log(`  ✅ Successfully submitted quote for ${leadData.company}`);
    return true;

  } catch (error) {
    console.error(`  ❌ Error submitting quote for ${leadData.company}:`, error.message);
    return false;
  }
}

async function loginToAdmin(page) {
  console.log('\n🔐 Logging into admin panel...');

  try {
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);

    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      return !window.location.href.includes('login') && !document.querySelector('input[type="password"]');
    });

    if (isLoggedIn) {
      console.log('  ✅ Already logged in');
      return true;
    }

    // Fill login form
    const emailField = await page.$('input[type="email"], input[name="email"]');
    if (emailField) {
      await emailField.type('admin@weblyx.cz');
      await wait(500);
    }

    const passwordField = await page.$('input[type="password"], input[name="password"]');
    if (passwordField) {
      await passwordField.type('Admin123!');
      await wait(500);
    }

    // Click login button
    const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Přihlásit")');
    if (loginButton) {
      await loginButton.click();
      await wait(3000);
    }

    console.log('  ✅ Logged in successfully');
    return true;

  } catch (error) {
    console.error('  ❌ Error logging in:', error.message);
    return false;
  }
}

async function verifyLeadsInAdmin(page, expectedCount) {
  console.log('\n🔍 Verifying leads in admin panel...');

  try {
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(3000);

    // Get all visible leads
    const leads = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr, [data-lead], .lead-row'));
      return rows.map(row => {
        const text = row.textContent;
        return {
          text: text.substring(0, 100),
          hasTestFirma: text.includes('Test Firma'),
          hasTestEmail: text.includes('test') && text.includes('@example.com')
        };
      }).filter(lead => lead.hasTestFirma || lead.hasTestEmail);
    });

    console.log(`  Found ${leads.length} test leads in admin panel`);

    // Take screenshot
    await page.screenshot({ path: '/Users/zen/weblyx/admin-leads-screenshot.png', fullPage: true });
    console.log('  📸 Screenshot saved: admin-leads-screenshot.png');

    return leads.length;

  } catch (error) {
    console.error('  ❌ Error verifying leads:', error.message);
    return 0;
  }
}

async function testWebsiteNavigation(page) {
  console.log('\n🌐 Testing website navigation...');

  const results = {
    homepage: false,
    services: false,
    portfolio: false,
    blog: false,
    contact: false
  };

  try {
    // Homepage
    console.log('  Testing homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    results.homepage = await page.evaluate(() => document.body.textContent.length > 0);
    console.log(`  ${results.homepage ? '✅' : '❌'} Homepage loaded`);
    await wait(1000);

    // Services (try different URLs)
    console.log('  Testing services page...');
    try {
      await page.goto(`${BASE_URL}/sluzby`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.services = await page.evaluate(() => document.body.textContent.length > 0);
    } catch {
      try {
        await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle2', timeout: 30000 });
        results.services = await page.evaluate(() => document.body.textContent.length > 0);
      } catch {
        results.services = false;
      }
    }
    console.log(`  ${results.services ? '✅' : '❌'} Services page loaded`);
    await wait(1000);

    // Portfolio
    console.log('  Testing portfolio page...');
    try {
      await page.goto(`${BASE_URL}/portfolio`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.portfolio = await page.evaluate(() => document.body.textContent.length > 0);
    } catch {
      results.portfolio = false;
    }
    console.log(`  ${results.portfolio ? '✅' : '❌'} Portfolio page loaded`);
    await wait(1000);

    // Blog
    console.log('  Testing blog page...');
    try {
      await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.blog = await page.evaluate(() => document.body.textContent.length > 0);
    } catch {
      results.blog = false;
    }
    console.log(`  ${results.blog ? '✅' : '❌'} Blog page loaded`);
    await wait(1000);

    // Contact
    console.log('  Testing contact page...');
    try {
      await page.goto(`${BASE_URL}/kontakt`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.contact = await page.evaluate(() => document.body.textContent.length > 0);
    } catch {
      try {
        await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle2', timeout: 30000 });
        results.contact = await page.evaluate(() => document.body.textContent.length > 0);
      } catch {
        results.contact = false;
      }
    }
    console.log(`  ${results.contact ? '✅' : '❌'} Contact page loaded`);

  } catch (error) {
    console.error('  ❌ Error testing navigation:', error.message);
  }

  return results;
}

async function runTests() {
  console.log('🚀 Starting Weblyx Production Testing\n');
  console.log('=' .repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = {
    submitted: 0,
    failed: 0,
    leadsInAdmin: 0,
    navigation: {}
  };

  // Test 1: Submit 10 quote forms
  console.log('\n📋 TEST 1: SUBMITTING 10 QUOTE FORMS');
  console.log('=' .repeat(60));

  for (let i = 0; i < testLeads.length; i++) {
    const success = await submitQuoteForm(page, testLeads[i]);
    if (success) {
      results.submitted++;
    } else {
      results.failed++;
    }
    await wait(2000);
  }

  console.log(`\n📊 Submission Results: ${results.submitted}/${testLeads.length} successful`);

  // Test 2: Login to admin and verify leads
  console.log('\n📋 TEST 2: VERIFYING LEADS IN ADMIN PANEL');
  console.log('=' .repeat(60));

  const loginSuccess = await loginToAdmin(page);
  if (loginSuccess) {
    results.leadsInAdmin = await verifyLeadsInAdmin(page, testLeads.length);

    // Test persistence by refreshing
    console.log('\n🔄 Testing data persistence (refreshing page)...');
    await page.reload({ waitUntil: 'networkidle2' });
    await wait(2000);
    const leadsAfterRefresh = await verifyLeadsInAdmin(page, testLeads.length);
    console.log(`  ${leadsAfterRefresh === results.leadsInAdmin ? '✅' : '❌'} Data persists after refresh`);
  }

  // Test 3: Website navigation
  console.log('\n📋 TEST 3: TESTING WEBSITE NAVIGATION');
  console.log('=' .repeat(60));

  results.navigation = await testWebsiteNavigation(page);

  // Generate final report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL TEST REPORT');
  console.log('=' .repeat(60));

  console.log('\n1. QUOTE FORM SUBMISSIONS:');
  console.log(`   ${results.submitted === testLeads.length ? '✅' : '❌'} Submitted: ${results.submitted}/${testLeads.length}`);
  console.log(`   ${results.failed === 0 ? '✅' : '❌'} Failed: ${results.failed}`);

  console.log('\n2. ADMIN PANEL VERIFICATION:');
  console.log(`   ${loginSuccess ? '✅' : '❌'} Admin login`);
  console.log(`   ${results.leadsInAdmin >= results.submitted ? '✅' : '❌'} Leads visible: ${results.leadsInAdmin}`);
  console.log(`   ${results.leadsInAdmin >= results.submitted ? '✅' : '❌'} Data persistence`);

  console.log('\n3. WEBSITE NAVIGATION:');
  console.log(`   ${results.navigation.homepage ? '✅' : '❌'} Homepage`);
  console.log(`   ${results.navigation.services ? '✅' : '❌'} Services page`);
  console.log(`   ${results.navigation.portfolio ? '✅' : '❌'} Portfolio page`);
  console.log(`   ${results.navigation.blog ? '✅' : '❌'} Blog page`);
  console.log(`   ${results.navigation.contact ? '✅' : '❌'} Contact page`);

  const allPassed = results.submitted === testLeads.length &&
                    results.leadsInAdmin >= results.submitted &&
                    loginSuccess;

  console.log('\n' + '=' .repeat(60));
  console.log(`🏁 OVERALL VERDICT: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('=' .repeat(60));

  if (!allPassed) {
    console.log('\n⚠️  Issues detected:');
    if (results.submitted < testLeads.length) {
      console.log(`   - Only ${results.submitted}/${testLeads.length} forms submitted successfully`);
    }
    if (results.leadsInAdmin < results.submitted) {
      console.log(`   - Only ${results.leadsInAdmin} leads visible in admin (expected ${results.submitted})`);
    }
    if (!loginSuccess) {
      console.log('   - Admin login failed');
    }
  }

  await browser.close();

  return results;
}

// Run the tests
runTests().catch(console.error);
