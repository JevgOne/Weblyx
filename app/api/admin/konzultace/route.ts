import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { createConsultation, getConsultation, listConsultations, saveConsultation } from '@/lib/consultation/store';

/**
 * Consultation calls: the answers a client gives while the site is being scoped.
 *
 * GET            the list
 * GET ?id=…      one consultation, pre-filled with what the enquiry already knows
 * POST           starts one without an enquiry behind it
 * PUT { id, answers }   saves; called after every change, so nothing is lost mid-call
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: true, items: await listConsultations() });

  const consultation = await getConsultation(id);
  return consultation
    ? NextResponse.json({ success: true, consultation })
    : NextResponse.json({ success: false, error: 'Poptávka nenalezena.' }, { status: 404 });
}

export async function POST() {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();
  return NextResponse.json({ success: true, id: await createConsultation(user.name) });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== 'string' || !body.answers || typeof body.answers !== 'object') {
    return NextResponse.json({ success: false, error: 'Chybí data.' }, { status: 400 });
  }
  await saveConsultation(body.id, body.answers, user.name);
  return NextResponse.json({ success: true, savedAt: Date.now() });
}
