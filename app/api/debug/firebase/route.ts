import { NextResponse } from 'next/server';
import { adminDbInstance } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Check if Firebase Admin is initialized
    if (!adminDbInstance) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin not initialized',
        env: {
          hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
          nodeEnv: process.env.NODE_ENV,
        }
      });
    }

    // Try to read leads collection
    const leadsSnapshot = await adminDbInstance.collection('leads').get();
    const leads: any[] = [];

    leadsSnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      leads.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin is working!',
      stats: {
        totalLeads: leads.length,
        leads: leads,
      },
      env: {
        hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
