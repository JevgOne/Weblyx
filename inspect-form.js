const puppeteer = require('puppeteer');

async function inspectForm() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('🔍 Inspecting quote form structure...\n');

  // Navigate to quote form
  await page.goto('https://weblyx-m1m1l9tre-jevg-ones-projects.vercel.app/poptavka', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Take screenshot
  await page.screenshot({ path: '/Users/zen/weblyx/form-step1.png', fullPage: true });
  console.log('📸 Screenshot saved: form-step1.png');

  // Get form structure
  const formStructure = await page.evaluate(() => {
    const result = {
      buttons: [],
      inputs: [],
      radios: [],
      checkboxes: [],
      selects: [],
      textareas: []
    };

    // Get all buttons
    document.querySelectorAll('button').forEach(btn => {
      result.buttons.push({
        text: btn.textContent.trim().substring(0, 50),
        type: btn.type,
        className: btn.className,
        id: btn.id,
        dataset: Object.assign({}, btn.dataset)
      });
    });

    // Get all inputs
    document.querySelectorAll('input').forEach(input => {
      result.inputs.push({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        value: input.value,
        className: input.className,
        dataset: Object.assign({}, input.dataset)
      });
    });

    // Get all textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      result.textareas.push({
        name: textarea.name,
        id: textarea.id,
        placeholder: textarea.placeholder,
        className: textarea.className
      });
    });

    // Get all selects
    document.querySelectorAll('select').forEach(select => {
      result.selects.push({
        name: select.name,
        id: select.id,
        className: select.className,
        options: Array.from(select.options).map(o => o.value)
      });
    });

    return result;
  });

  console.log('\n📋 FORM STRUCTURE:\n');
  console.log('BUTTONS:', JSON.stringify(formStructure.buttons, null, 2));
  console.log('\nINPUTS:', JSON.stringify(formStructure.inputs, null, 2));
  console.log('\nTEXTAREAS:', JSON.stringify(formStructure.textareas, null, 2));
  console.log('\nSELECTS:', JSON.stringify(formStructure.selects, null, 2));

  // Check page text
  const pageText = await page.evaluate(() => document.body.textContent.substring(0, 500));
  console.log('\n📄 PAGE TEXT (first 500 chars):\n', pageText);

  console.log('\n⏸️  Browser will stay open for 10 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  await browser.close();
}

inspectForm().catch(console.error);
