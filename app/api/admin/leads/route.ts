import { NextRequest, NextResponse } from 'next/server';
import { adminDbInstance } from '@/lib/firebase-admin';

// GET - Retrieve all leads
export async function GET(request: NextRequest) {
  try {
    if (!adminDbInstance) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    const leadsSnapshot = await adminDbInstance.collection('leads').get();
    const leads: any[] = [];

    leadsSnapshot.docs.forEach((doc: any) => {
      leads.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by createdAt descending (newest first)
    leads.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    console.log(`✅ Retrieved ${leads.length} leads from database`);

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leads'
      },
      { status: 500 }
    );
  }
}

// PATCH - Update lead status or details
export async function PATCH(request: NextRequest) {
  try {
    const { leadId, updates } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    if (!adminDbInstance) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    await adminDbInstance.collection('leads').doc(leadId).update({
      ...updates,
      updatedAt: new Date(),
    });

    console.log(`✅ Updated lead ${leadId}`);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update lead'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    if (!adminDbInstance) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    await adminDbInstance.collection('leads').doc(leadId).delete();

    console.log(`✅ Deleted lead ${leadId}`);

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete lead'
      },
      { status: 500 }
    );
  }
}
