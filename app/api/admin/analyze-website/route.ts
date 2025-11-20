import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/web-analyzer';
import { adminDbInstance } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { url, contactEmail, contactName, businessName } = await request.json();

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

    // Run analysis
    const analysis = await analyzeWebsite(url);

    // Add contact info if provided
    if (contactEmail) analysis.contactEmail = contactEmail;
    if (contactName) analysis.contactName = contactName;
    if (businessName) analysis.businessName = businessName;

    // Save to database
    let analysisId: string | undefined;

    if (adminDbInstance) {
      const result = await adminDbInstance.collection('web_analyses').add({
        ...analysis,
        analyzedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      analysisId = result.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        id: analysisId,
      },
    });
  } catch (error: any) {
    console.error('Web analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze website'
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve all analyses
export async function GET(request: NextRequest) {
  try {
    if (!adminDbInstance) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Check if we're using mock Firebase
    if (typeof adminDbInstance.collection === 'function') {
      // Mock Firebase
      const snapshot = await adminDbInstance.collection('web_analyses').orderBy('analyzedAt').get();
      const analyses: any[] = [];

      snapshot.docs.forEach((doc: any) => {
        analyses.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort manually for mock
      analyses.sort((a, b) => {
        const aDate = a.analyzedAt?.toDate ? a.analyzedAt.toDate() : new Date(a.analyzedAt);
        const bDate = b.analyzedAt?.toDate ? b.analyzedAt.toDate() : new Date(b.analyzedAt);
        return bDate.getTime() - aDate.getTime();
      });

      return NextResponse.json({
        success: true,
        data: analyses,
      });
    } else {
      // Real Firebase - use modular API
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const db = adminDbInstance as any;
      const q = query(collection(db, 'web_analyses'), orderBy('analyzedAt', 'desc'));
      const snapshot = await getDocs(q);

      const analyses: any[] = [];
      snapshot.forEach((doc) => {
        analyses.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return NextResponse.json({
        success: true,
        data: analyses,
      });
    }
  } catch (error: any) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch analyses'
      },
      { status: 500 }
    );
  }
}
