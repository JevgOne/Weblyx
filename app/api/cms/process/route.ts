import { NextRequest, NextResponse } from 'next/server';
import {
  getProcessSection,
  updateProcessSection,
  getAllProcessSteps,
  createProcessStep,
  updateProcessStep,
  deleteProcessStep
} from '@/lib/turso/cms';
import { revalidatePath } from 'next/cache';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

// GET /api/cms/process - Get process section and steps
export async function GET(request: NextRequest) {
  try {
    const section = await getProcessSection();
    const steps = await getAllProcessSteps();

    return NextResponse.json({
      success: true,
      data: {
        section: section || null,
        steps: steps || []
      }
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error fetching process data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch process data' },
      { status: 500 }
    );
  }
}

// POST /api/cms/process - Create new process step
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    // Validation
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    if (!body.description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }
    if (!body.icon?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Icon is required' },
        { status: 400 }
      );
    }

    const id = await createProcessStep({
      number: body.number || '1',
      title: body.title,
      description: body.description,
      icon: body.icon,
      order: body.order || 0,
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    // Revalidate homepage (if process is shown there)
    revalidatePath('/');

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Error creating process step:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create process step' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/process - Update process section or step
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    // Check if updating section or step
    if (body.id) {
      // Update step
      await updateProcessStep(body.id, {
        number: body.number,
        title: body.title,
        description: body.description,
        icon: body.icon,
        order: body.order,
        enabled: body.enabled,
      });

      // Revalidate homepage
      revalidatePath('/');

      return NextResponse.json({ success: true });
    } else {
      // Update section
      if (!body.heading?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Heading is required' },
          { status: 400 }
        );
      }

      await updateProcessSection({
        heading: body.heading,
        subheading: body.subheading || '',
        enabled: body.enabled !== undefined ? body.enabled : true,
      });

      // Revalidate homepage
      revalidatePath('/');

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error('Error updating process:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update process' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/process?id=xxx - Delete process step
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteProcessStep(id);

    // Revalidate homepage
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting process step:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete process step' },
      { status: 500 }
    );
  }
}
