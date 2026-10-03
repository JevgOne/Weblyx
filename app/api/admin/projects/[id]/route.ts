import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { getProject, updateProject } from '@/lib/turso/projects';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { id } = await props.params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ success: false, error: 'Projekt nenalezen' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: project });
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { id } = await props.params;
  if (!(await getProject(id))) {
    return NextResponse.json({ success: false, error: 'Projekt nenalezen' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Neplatná data' }, { status: 400 });
  }

  try {
    const project = await updateProject(id, body);
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ success: false, error: 'Uložení selhalo' }, { status: 500 });
  }
}
