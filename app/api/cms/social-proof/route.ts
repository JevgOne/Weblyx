import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSocialProofData, updateSocialProofData } from '@/lib/turso/cms';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getSocialProofData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching social proof data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await updateSocialProofData(body);
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating social proof data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update data' },
      { status: 500 }
    );
  }
}
