import { NextRequest, NextResponse } from 'next/server';
import { setConfig } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function handleChangePassword(req: NextRequest) {
  try {
    const { newPassword } = await req.json();
    
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }
    
    await setConfig('kanban_password', newPassword);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/change-password error:', error.message);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}

export const POST = requireAuth(handleChangePassword);
