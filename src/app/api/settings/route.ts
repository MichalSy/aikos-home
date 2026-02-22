import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function handleGetSettings(req: NextRequest) {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('GET /api/settings error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

async function handleSaveSettings(req: NextRequest) {
  try {
    const body = await req.json();
    await saveSettings(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/settings error:', error.message);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

export const GET = requireAuth(handleGetSettings);
export const POST = requireAuth(handleSaveSettings);
