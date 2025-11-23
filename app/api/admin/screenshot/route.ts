import { NextRequest, NextResponse } from 'next/server';
import { captureScreenshot, captureMultipleScreenshots } from '@/lib/screenshot';

export async function POST(request: NextRequest) {
  try {
    const { url, device, fullPage } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // If device is 'all', capture all devices
    if (device === 'all') {
      const screenshots = await captureMultipleScreenshots(normalizedUrl);

      // Convert buffers to base64 for JSON response
      return NextResponse.json({
        success: true,
        data: {
          desktop: screenshots.desktop.toString('base64'),
          tablet: screenshots.tablet.toString('base64'),
          mobile: screenshots.mobile.toString('base64'),
        },
      });
    }

    // Single device screenshot
    const viewport = getViewportForDevice(device);
    const screenshot = await captureScreenshot({
      url: normalizedUrl,
      viewport,
      fullPage: fullPage !== false, // Default to true
    });

    // Return as base64
    return NextResponse.json({
      success: true,
      data: {
        screenshot: screenshot.toString('base64'),
        device: device || 'desktop',
      },
    });
  } catch (error: any) {
    console.error('Screenshot API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to capture screenshot',
      },
      { status: 500 }
    );
  }
}

function getViewportForDevice(device?: string) {
  switch (device) {
    case 'mobile':
      return { width: 375, height: 667 }; // iPhone SE
    case 'tablet':
      return { width: 768, height: 1024 }; // iPad
    case 'desktop':
    default:
      return { width: 1920, height: 1080 }; // Full HD
  }
}
