import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function changePassword(req: NextRequest) {
  try {
    const { newPassword } = await req.json();
    
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }
    
    const stmt = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
    stmt.run('kanban_password', newPassword);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/change-password error:', error.message);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}

export const POST = requireAuth(changePassword);
