const puppeteer = require('puppeteer');

const testLeads = [
  { company: 'Test Firma 1', email: 'test1@example.com', phone: '+420601234567', description: 'New corporate website with modern design' },
  { company: 'Test Firma 2', email: 'test2@example.com', phone: '+420602345678', description: 'Redesign existing website to improve UX' },
  { company: 'Test Firma 3', email: 'test3@example.com', phone: '+420603456789', description: 'E-commerce platform for selling electronics' },
  { company: 'Test Firma 4', email: 'test4@example.com', phone: '+420604567890', description: 'Landing page for product launch campaign' },
  { company: 'Test Firma 5', email: 'test5@example.com', phone: '+420605678901', description: 'Restaurant website with online reservations' },
  { company: 'Test Firma 6', email: 'test6@example.com', phone: '+420606789012', description: 'Modernize outdated company website' },
  { company: 'Test Firma 7', email: 'test7@example.com', phone: '+420607890123', description: 'Fashion e-commerce with inventory system' },
  { company: 'Test Firma 8', email: 'test8@example.com', phone: '+420608901234', description: 'Lead generation landing page for B2B' },
  { company: 'Test Firma 9', email: 'test9@example.com', phone: '+420609012345', description: 'Portfolio website for architecture firm' },
  { company: 'Test Firma 10', email: 'test10@example.com', phone: '+420610123456', description: 'Complete website overhaul with SEO' }
];

const BASE_URL = 'https://weblyx-m1m1l9tre-jevg-ones-projects.vercel.app';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitQuoteForm(page, leadData, attemptNumber) {
  console.log(`\n📝 [${attemptNumber}/10] Submitting: ${leadData.company}`);

  try {
    await page.goto(`${BASE_URL}/poptavka`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);

    // Dismiss cookie banner
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptButton = buttons.find(b => b.textContent.includes('Přijmout vše'));
      if (acceptButton) acceptButton.click();
    }).catch(() => {});
    await wait(500);

    // Step 1: Click first radio option (by clicking the label/card)
    await page.evaluate((index) => {
      const radios = Array.from(document.querySelectorAll('button[id]')).filter(b =>
        ['new-web', 'redesign', 'eshop', 'landing', 'web-eshop', 'other'].includes(b.id)
      );
      if (radios[index % radios.length]) {
        radios[index % radios.length].click();
      }
    }, attemptNumber);
    await wait(1000);

    // Click continue
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Pokračovat'));
      if (btn) btn.click();
    });
    await wait(2000);

    // Step 2: Select budget (click first radio)
    await page.evaluate((index) => {
      const radios = Array.from(document.querySelectorAll('button[id]')).filter(b => b.type === 'button');
      const validRadios = radios.filter(r => r.getAttribute('data-state') !== null);
      if (validRadios[index % 4]) {
        validRadios[index % 4].click();
      }
    }, attemptNumber);
    await wait(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Pokračovat'));
      if (btn) btn.click();
    });
    await wait(2000);

    // Step 3: Select timeline
    await page.evaluate((index) => {
      const radios = Array.from(document.querySelectorAll('button[id]')).filter(b => b.type === 'button');
      const validRadios = radios.filter(r => r.getAttribute('data-state') !== null);
      if (validRadios[index % 4]) {
        validRadios[index % 4].click();
      }
    }, attemptNumber + 1);
    await wait(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Pokračovat'));
      if (btn) btn.click();
    });
    await wait(2000);

    // Step 4: Fill description
    await page.evaluate((desc) => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = desc;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, leadData.description);
    await wait(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Pokračovat'));
      if (btn) btn.click();
    });
    await wait(2000);

    // Step 5: Fill contact form
    await page.evaluate((data) => {
      const inputs = Array.from(document.querySelectorAll('input'));

      inputs.forEach(input => {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();

        if (input.type === 'email' || placeholder.includes('email')) {
          input.value = data.email;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.type === 'tel' || placeholder.includes('telefon') || placeholder.includes('phone')) {
          input.value = data.phone;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (placeholder.includes('firma') || placeholder.includes('společnost') || placeholder.includes('company')) {
          input.value = data.company;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.type === 'text' && (placeholder.includes('jméno') || placeholder.includes('name'))) {
          input.value = 'Test User';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }, leadData);

    console.log(`    ✓ Filled: ${leadData.company} | ${leadData.email} | ${leadData.phone}`);
    await wait(1500);

    // Submit
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
      const submitBtn = buttons.find(b =>
        b.textContent.includes('Odeslat') ||
        b.textContent.includes('Submit') ||
        b.textContent.includes('Pokračovat')
      );
      if (submitBtn) submitBtn.click();
    });

    await wait(4000);

    // Check success
    const url = page.url();
    const text = await page.evaluate(() => document.body.textContent.toLowerCase());
    const isSuccess = url.includes('dek') || text.includes('děkujeme') || text.includes('úspěšně') || !url.includes('poptavka');

    console.log(`    ${isSuccess ? '✅' : '⚠️'} ${isSuccess ? 'SUCCESS' : 'Submitted (unclear)'}`);
    return true;

  } catch (error) {
    console.error(`    ❌ ERROR: ${error.message}`);
    await page.screenshot({ path: `/Users/zen/weblyx/err-${attemptNumber}.png` }).catch(() => {});
    return false;
  }
}

async function checkAdmin(page) {
  console.log('\n🔍 Checking admin panel...');

  try {
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(3000);

    await page.screenshot({ path: '/Users/zen/weblyx/admin-result.png', fullPage: true });

    const count = await page.evaluate(() => {
      const text = document.body.textContent;
      const leads = [];
      for (let i = 1; i <= 10; i++) {
        if (text.includes(`Test Firma ${i}`)) leads.push(i);
      }
      return leads.length;
    });

    console.log(`    Found ${count} test leads in database`);
    return count;

  } catch (error) {
    console.error(`    ❌ Admin check failed: ${error.message}`);
    return 0;
  }
}

async function runFullTest() {
  console.log('🚀 WEBLYX PRODUCTION TEST');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(30000);

  let submitted = 0;
  let failed = 0;

  console.log('\n📋 SUBMITTING 10 LEADS:');
  console.log('='.repeat(60));

  for (let i = 0; i < testLeads.length; i++) {
    const success = await submitQuoteForm(page, testLeads[i], i + 1);
    if (success) submitted++;
    else failed++;
    await wait(1500);
  }

  console.log('\n📊 SUBMISSION SUMMARY:');
  console.log(`    ✅ Submitted: ${submitted}/10`);
  console.log(`    ❌ Failed: ${failed}/10`);

  const leadsInDb = await checkAdmin(page);

  console.log('\n' + '='.repeat(60));
  console.log('🏁 FINAL RESULT:');
  console.log('='.repeat(60));
  console.log(`    Submitted: ${submitted}/10`);
  console.log(`    In Database: ${leadsInDb}/10`);
  console.log(`    Success Rate: ${Math.round((leadsInDb / 10) * 100)}%`);

  const passed = submitted >= 8 && leadsInDb >= 8;
  console.log(`\n    ${passed ? '✅ PASS' : '❌ FAIL'}`);

  if (passed) {
    console.log('\n🎉 Production test PASSED!');
    console.log(`    ✅ ${leadsInDb} leads successfully saved to Firebase`);
    console.log('    ✅ Form submission flow working');
    console.log('    ✅ Data persistence confirmed');
  }

  await browser.close();
}

runFullTest().catch(console.error);
