import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBeforeAfterData, updateBeforeAfterData } from '@/lib/turso/cms';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getBeforeAfterData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching before/after data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await updateBeforeAfterData(body);
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating before/after data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update data' },
      { status: 500 }
    );
  }
}
