import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getConfig, createSession } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    const storedPw = await getConfig('kanban_password') || '';
    
    if (storedPw && password === storedPw) {
      const token = uuidv4();
      await createSession(token);
      return NextResponse.json({ success: true, token });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
