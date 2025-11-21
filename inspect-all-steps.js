const puppeteer = require('puppeteer');

async function inspectAllSteps() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('🔍 Inspecting all form steps...\n');

  await page.goto('https://weblyx-m1m1l9tre-jevg-ones-projects.vercel.app/poptavka', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Dismiss cookies
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptButton = buttons.find(b => b.textContent.includes('Přijmout vše'));
    if (acceptButton) acceptButton.click();
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 1: Project type
  console.log('STEP 1 - PROJECT TYPE:');
  const step1Buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(btn => ({
      id: btn.id,
      text: btn.textContent.trim().substring(0, 30),
      type: btn.type
    })).filter(b => b.id && !b.text.includes('Nastavení'));
  });
  console.log(JSON.stringify(step1Buttons, null, 2));

  // Click first option and continue
  await page.click('#new-web');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
    const continueBtn = buttons.find(b => b.textContent.includes('Pokračovat'));
    if (continueBtn) continueBtn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Budget
  console.log('\nSTEP 2 - BUDGET:');
  const step2Buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(btn => ({
      id: btn.id,
      text: btn.textContent.trim().substring(0, 30),
      type: btn.type,
      dataset: Object.assign({}, btn.dataset)
    })).filter(b => b.id || b.dataset.value);
  });
  console.log(JSON.stringify(step2Buttons, null, 2));

  await page.screenshot({ path: '/Users/zen/weblyx/step2-budget.png', fullPage: true });

  // Click first budget option and continue
  const firstBudgetId = step2Buttons.find(b => b.id)?.id;
  if (firstBudgetId) {
    await page.evaluate((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.click();
    }, firstBudgetId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
      const continueBtn = buttons.find(b => b.textContent.includes('Pokračovat'));
      if (continueBtn) continueBtn.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Step 3: Timeline
  console.log('\nSTEP 3 - TIMELINE:');
  const step3Buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(btn => ({
      id: btn.id,
      text: btn.textContent.trim().substring(0, 30),
      type: btn.type,
      dataset: Object.assign({}, btn.dataset)
    })).filter(b => b.id || b.dataset.value);
  });
  console.log(JSON.stringify(step3Buttons, null, 2));

  await page.screenshot({ path: '/Users/zen/weblyx/step3-timeline.png', fullPage: true });

  console.log('\n✅ Inspection complete. Screenshots saved.');
  console.log('   - step2-budget.png');
  console.log('   - step3-timeline.png');

  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
}

inspectAllSteps().catch(console.error);
