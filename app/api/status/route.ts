import { NextResponse } from 'next/server';
import { adminDbInstance } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Check environment
    const nodeEnv = process.env.NODE_ENV;
    const hasBase64 = !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const base64Length = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length || 0;

    // Check if adminDbInstance is mock or real
    const isMock = !adminDbInstance || adminDbInstance.constructor.name === 'MockFirestoreAdmin';

    // Try to get leads count
    let leadsCount = 0;
    let leadsError = null;
    try {
      const snapshot = await adminDbInstance.collection('leads').get();
      leadsCount = snapshot.docs.length;
    } catch (error: any) {
      leadsError = error.message;
    }

    return NextResponse.json({
      environment: {
        NODE_ENV: nodeEnv,
        hasFirebaseBase64: hasBase64,
        base64Length: base64Length,
      },
      firebase: {
        isMock: isMock,
        instanceType: adminDbInstance?.constructor?.name || 'null',
      },
      database: {
        leadsCount: leadsCount,
        error: leadsError,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
