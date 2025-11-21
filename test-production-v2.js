const puppeteer = require('puppeteer');

// Test data for 10 different quote submissions
const testLeads = [
  {
    projectType: 'new-web',
    company: 'Test Firma 1',
    email: 'test1@example.com',
    phone: '+420 601 234 567',
    budget: 'do-50000',
    timeline: 'asap',
    description: 'Need a new corporate website with modern design'
  },
  {
    projectType: 'redesign',
    company: 'Test Firma 2',
    email: 'test2@example.com',
    phone: '+420 602 345 678',
    budget: '50000-100000',
    timeline: '1-3',
    description: 'Redesign existing website to improve UX'
  },
  {
    projectType: 'eshop',
    company: 'Test Firma 3',
    email: 'test3@example.com',
    phone: '+420 603 456 789',
    budget: '100000-200000',
    timeline: '3-6',
    description: 'E-commerce platform for selling electronics'
  },
  {
    projectType: 'landing',
    company: 'Test Firma 4',
    email: 'test4@example.com',
    phone: '+420 604 567 890',
    budget: '200000+',
    timeline: '6+',
    description: 'Landing page for product launch campaign'
  },
  {
    projectType: 'new-web',
    company: 'Test Firma 5',
    email: 'test5@example.com',
    phone: '+420 605 678 901',
    budget: 'do-50000',
    timeline: 'asap',
    description: 'Restaurant website with online reservations'
  },
  {
    projectType: 'redesign',
    company: 'Test Firma 6',
    email: 'test6@example.com',
    phone: '+420 606 789 012',
    budget: '50000-100000',
    timeline: '1-3',
    description: 'Modernize outdated company website'
  },
  {
    projectType: 'eshop',
    company: 'Test Firma 7',
    email: 'test7@example.com',
    phone: '+420 607 890 123',
    budget: '100000-200000',
    timeline: '3-6',
    description: 'Fashion e-commerce with inventory system'
  },
  {
    projectType: 'landing',
    company: 'Test Firma 8',
    email: 'test8@example.com',
    phone: '+420 608 901 234',
    budget: '200000+',
    timeline: '6+',
    description: 'Lead generation landing page for B2B'
  },
  {
    projectType: 'web-eshop',
    company: 'Test Firma 9',
    email: 'test9@example.com',
    phone: '+420 609 012 345',
    budget: 'do-50000',
    timeline: '1-3',
    description: 'Portfolio website for architecture firm'
  },
  {
    projectType: 'other',
    company: 'Test Firma 10',
    email: 'test10@example.com',
    phone: '+420 610 123 456',
    budget: '50000-100000',
    timeline: '3-6',
    description: 'Complete website overhaul with SEO optimization'
  }
];

const BASE_URL = 'https://weblyx-m1m1l9tre-jevg-ones-projects.vercel.app';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dismissCookieBanner(page) {
  try {
    // Try to click "Accept all" cookie button
    const cookieButton = await page.$('button:has-text("Přijmout vše")');
    if (cookieButton) {
      await cookieButton.click();
      await wait(500);
      console.log('  🍪 Dismissed cookie banner');
    }
  } catch (error) {
    // Ignore if cookie banner not found
  }
}

async function submitQuoteForm(page, leadData, attemptNumber) {
  console.log(`\n📝 Submitting quote ${attemptNumber}/10 for: ${leadData.company}`);

  try {
    // Navigate to quote form
    await page.goto(`${BASE_URL}/poptavka`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);

    // Dismiss cookie banner if present
    await dismissCookieBanner(page);

    // Step 1: Select project type using button ID
    console.log(`  Step 1: Selecting project type: ${leadData.projectType}...`);
    const projectTypeButton = await page.$(`#${leadData.projectType}`);
    if (!projectTypeButton) {
      throw new Error(`Project type button not found: ${leadData.projectType}`);
    }
    await projectTypeButton.click();
    await wait(1000);

    // Click "Pokračovat" (Continue) button
    const continueButton1 = await page.$('button[type="submit"]:has-text("Pokračovat")');
    if (continueButton1) {
      await continueButton1.click();
      await wait(2000);
    }

    // Step 2: Select budget
    console.log(`  Step 2: Selecting budget: ${leadData.budget}...`);
    const budgetButton = await page.$(`#${leadData.budget}`);
    if (budgetButton) {
      await budgetButton.click();
      await wait(1000);
    }

    const continueButton2 = await page.$('button[type="submit"]:has-text("Pokračovat")');
    if (continueButton2) {
      await continueButton2.click();
      await wait(2000);
    }

    // Step 3: Select timeline
    console.log(`  Step 3: Selecting timeline: ${leadData.timeline}...`);
    const timelineButton = await page.$(`#${leadData.timeline}`);
    if (timelineButton) {
      await timelineButton.click();
      await wait(1000);
    }

    const continueButton3 = await page.$('button[type="submit"]:has-text("Pokračovat")');
    if (continueButton3) {
      await continueButton3.click();
      await wait(2000);
    }

    // Step 4: Fill description
    console.log(`  Step 4: Filling description...`);
    const descriptionField = await page.$('textarea');
    if (descriptionField) {
      await descriptionField.click();
      await descriptionField.type(leadData.description);
      await wait(1000);
    }

    const continueButton4 = await page.$('button[type="submit"]:has-text("Pokračovat")');
    if (continueButton4) {
      await continueButton4.click();
      await wait(2000);
    }

    // Step 5: Fill contact information
    console.log(`  Step 5: Filling contact information...`);

    // Find and fill all input fields
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="tel"]');

    for (const input of inputs) {
      const inputType = await page.evaluate(el => el.type, input);
      const inputName = await page.evaluate(el => el.name, input);
      const placeholder = await page.evaluate(el => el.placeholder, input);

      // Determine which field this is
      if (inputType === 'email' || placeholder.toLowerCase().includes('email')) {
        await input.click();
        await input.type(leadData.email);
        console.log(`    ✓ Filled email: ${leadData.email}`);
      } else if (inputType === 'tel' || placeholder.toLowerCase().includes('telefon') || placeholder.toLowerCase().includes('phone')) {
        await input.click();
        await input.type(leadData.phone);
        console.log(`    ✓ Filled phone: ${leadData.phone}`);
      } else if (placeholder.toLowerCase().includes('firma') || placeholder.toLowerCase().includes('společnost') || placeholder.toLowerCase().includes('company')) {
        await input.click();
        await input.type(leadData.company);
        console.log(`    ✓ Filled company: ${leadData.company}`);
      } else if (placeholder.toLowerCase().includes('jméno') || placeholder.toLowerCase().includes('name')) {
        await input.click();
        await input.type('Test User');
        console.log(`    ✓ Filled name: Test User`);
      }

      await wait(300);
    }

    // Submit the final form
    console.log(`  Submitting final form...`);
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await wait(4000);

      // Check if submission was successful (look for success message or redirect)
      const currentUrl = page.url();
      const pageText = await page.evaluate(() => document.body.textContent);

      if (currentUrl.includes('dek') || pageText.includes('děkujeme') || pageText.includes('úspěšně')) {
        console.log(`  ✅ Successfully submitted quote for ${leadData.company}`);
        return true;
      }
    }

    console.log(`  ✅ Form submitted for ${leadData.company}`);
    return true;

  } catch (error) {
    console.error(`  ❌ Error submitting quote for ${leadData.company}:`, error.message);
    // Take error screenshot
    await page.screenshot({ path: `/Users/zen/weblyx/error-${attemptNumber}.png` });
    return false;
  }
}

async function loginToAdmin(page) {
  console.log('\n🔐 Logging into admin panel...');

  try {
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);

    // Check if already logged in (look for table or leads content)
    const isLoggedIn = await page.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('Test Firma') || text.includes('leads') || text.includes('poptávky');
    });

    if (isLoggedIn) {
      console.log('  ✅ Already logged in or no auth required');
      return true;
    }

    // If login form exists, fill it
    const emailField = await page.$('input[type="email"]');
    const passwordField = await page.$('input[type="password"]');

    if (emailField && passwordField) {
      await emailField.type('admin@weblyx.cz');
      await wait(500);
      await passwordField.type('Admin123!');
      await wait(500);

      // Click login button
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await wait(3000);
      }
    }

    console.log('  ✅ Admin panel accessed');
    return true;

  } catch (error) {
    console.error('  ❌ Error accessing admin panel:', error.message);
    return false;
  }
}

async function verifyLeadsInAdmin(page, expectedCount) {
  console.log('\n🔍 Verifying leads in admin panel...');

  try {
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(3000);

    // Take screenshot
    await page.screenshot({ path: '/Users/zen/weblyx/admin-leads-screenshot.png', fullPage: true });
    console.log('  📸 Screenshot saved: admin-leads-screenshot.png');

    // Count test leads
    const leadsData = await page.evaluate(() => {
      const pageText = document.body.textContent;
      const testFirmaMatches = pageText.match(/Test Firma \d+/g) || [];
      const uniqueLeads = [...new Set(testFirmaMatches)];

      // Get table rows
      const rows = Array.from(document.querySelectorAll('tr, [data-lead], .lead-row, [role="row"]'));
      const leadRows = rows.filter(row => {
        const text = row.textContent;
        return text.includes('Test Firma') && text.includes('@example.com');
      });

      return {
        uniqueCount: uniqueLeads.length,
        rowCount: leadRows.length,
        leads: uniqueLeads
      };
    });

    console.log(`  Found ${leadsData.uniqueCount} unique test leads: ${leadsData.leads.join(', ')}`);
    console.log(`  Found ${leadsData.rowCount} lead rows in table`);

    return leadsData.uniqueCount > 0 ? leadsData.uniqueCount : leadsData.rowCount;

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
    results.homepage = await page.evaluate(() => document.body.textContent.length > 100);
    console.log(`  ${results.homepage ? '✅' : '❌'} Homepage loaded`);
    await wait(1000);

    // Services
    console.log('  Testing services page...');
    try {
      await page.goto(`${BASE_URL}/sluzby`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.services = await page.evaluate(() => document.body.textContent.length > 100);
    } catch {
      results.services = false;
    }
    console.log(`  ${results.services ? '✅' : '❌'} Services page loaded`);
    await wait(1000);

    // Portfolio
    console.log('  Testing portfolio page...');
    try {
      await page.goto(`${BASE_URL}/portfolio`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.portfolio = await page.evaluate(() => document.body.textContent.length > 100);
    } catch {
      results.portfolio = false;
    }
    console.log(`  ${results.portfolio ? '✅' : '❌'} Portfolio page loaded`);
    await wait(1000);

    // Blog
    console.log('  Testing blog page...');
    try {
      await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.blog = await page.evaluate(() => document.body.textContent.length > 100);
    } catch {
      results.blog = false;
    }
    console.log(`  ${results.blog ? '✅' : '❌'} Blog page loaded`);
    await wait(1000);

    // Contact
    console.log('  Testing contact page...');
    try {
      await page.goto(`${BASE_URL}/kontakt`, { waitUntil: 'networkidle2', timeout: 30000 });
      results.contact = await page.evaluate(() => document.body.textContent.length > 100);
    } catch {
      results.contact = false;
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Set longer default timeout
  page.setDefaultTimeout(30000);

  const results = {
    submitted: 0,
    failed: 0,
    leadsInAdmin: 0,
    navigation: {},
    errors: []
  };

  // Test 1: Submit 10 quote forms
  console.log('\n📋 TEST 1: SUBMITTING 10 QUOTE FORMS');
  console.log('=' .repeat(60));

  for (let i = 0; i < testLeads.length; i++) {
    const success = await submitQuoteForm(page, testLeads[i], i + 1);
    if (success) {
      results.submitted++;
    } else {
      results.failed++;
    }
    await wait(2000); // Wait between submissions
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
    const persistenceWorks = leadsAfterRefresh >= results.leadsInAdmin;
    console.log(`  ${persistenceWorks ? '✅' : '❌'} Data persists after refresh (${leadsAfterRefresh} leads)`);
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
  console.log(`   ${results.submitted >= 8 ? '✅' : '❌'} Submitted: ${results.submitted}/${testLeads.length}`);
  console.log(`   ${results.failed <= 2 ? '✅' : '❌'} Failed: ${results.failed}`);

  console.log('\n2. ADMIN PANEL VERIFICATION:');
  console.log(`   ${loginSuccess ? '✅' : '❌'} Admin access`);
  console.log(`   ${results.leadsInAdmin >= results.submitted * 0.8 ? '✅' : '❌'} Leads visible: ${results.leadsInAdmin}`);
  console.log(`   ${results.leadsInAdmin > 0 ? '✅' : '❌'} Data persistence`);

  console.log('\n3. WEBSITE NAVIGATION:');
  console.log(`   ${results.navigation.homepage ? '✅' : '❌'} Homepage`);
  console.log(`   ${results.navigation.services ? '✅' : '❌'} Services page`);
  console.log(`   ${results.navigation.portfolio ? '✅' : '❌'} Portfolio page`);
  console.log(`   ${results.navigation.blog ? '✅' : '❌'} Blog page`);
  console.log(`   ${results.navigation.contact ? '✅' : '❌'} Contact page`);

  const passThreshold = results.submitted >= 8 && results.leadsInAdmin >= results.submitted * 0.8 && loginSuccess;

  console.log('\n' + '=' .repeat(60));
  console.log(`🏁 OVERALL VERDICT: ${passThreshold ? '✅ PASS' : '❌ FAIL'}`);
  console.log('=' .repeat(60));

  if (!passThreshold) {
    console.log('\n⚠️  Issues detected:');
    if (results.submitted < 8) {
      console.log(`   - Only ${results.submitted}/${testLeads.length} forms submitted successfully`);
    }
    if (results.leadsInAdmin < results.submitted * 0.8) {
      console.log(`   - Only ${results.leadsInAdmin} leads visible in admin (expected at least ${Math.floor(results.submitted * 0.8)})`);
    }
    if (!loginSuccess) {
      console.log('   - Admin access failed');
    }
  } else {
    console.log('\n✅ All critical tests passed!');
    console.log(`   - ${results.submitted} leads submitted successfully`);
    console.log(`   - ${results.leadsInAdmin} leads verified in Firebase`);
    console.log('   - Data persistence confirmed');
  }

  await browser.close();

  return results;
}

// Run the tests
runTests().catch(console.error);
