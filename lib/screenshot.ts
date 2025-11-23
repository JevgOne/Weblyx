import puppeteer from 'puppeteer';

export interface ScreenshotOptions {
  url: string;
  fullPage?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  quality?: number; // 1-100 for JPEG
  format?: 'png' | 'jpeg' | 'webp';
}

export async function captureScreenshot(options: ScreenshotOptions): Promise<Buffer> {
  const {
    url,
    fullPage = true,
    viewport = { width: 1920, height: 1080 },
    quality = 90,
    format = 'png',
  } = options;

  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport(viewport);

    // Set user agent (to avoid bot detection)
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait a bit for animations/fonts to load
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshotOptions: any = {
      fullPage,
      type: format,
    };

    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = quality;
    }

    const screenshot = await page.screenshot(screenshotOptions);

    return Buffer.from(screenshot);
  } catch (error: any) {
    console.error('Screenshot capture error:', error);
    throw new Error(`Failed to capture screenshot: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function captureMultipleScreenshots(url: string): Promise<{
  desktop: Buffer;
  tablet: Buffer;
  mobile: Buffer;
}> {
  const results = await Promise.all([
    // Desktop
    captureScreenshot({
      url,
      viewport: { width: 1920, height: 1080 },
      fullPage: false, // Just above the fold
    }),
    // Tablet
    captureScreenshot({
      url,
      viewport: { width: 768, height: 1024 },
      fullPage: false,
    }),
    // Mobile
    captureScreenshot({
      url,
      viewport: { width: 375, height: 667 },
      fullPage: false,
    }),
  ]);

  return {
    desktop: results[0],
    tablet: results[1],
    mobile: results[2],
  };
}
