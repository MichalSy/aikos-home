import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getSettings(req: NextRequest) {
  try {
    const settings: Record<string, string> = {};
    const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{key: string, value: string}>;
    
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('GET /api/settings error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

async function saveSettings(req: NextRequest) {
  try {
    const body = await req.json();
    
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    Object.entries(body).forEach(([key, value]) => {
      stmt.run(key, value);
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/settings error:', error.message);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

export const GET = requireAuth(getSettings);
export const POST = requireAuth(saveSettings);
