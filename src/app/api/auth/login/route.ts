import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    let storedPw = '';
    try {
      const row = db.prepare("SELECT value FROM config WHERE key='kanban_password'").get() as {value:string} | undefined;
      if (row) storedPw = row.value;
    } catch (e) {
      console.error('Error reading password config:', e);
    }
    
    if (storedPw && password === storedPw) {
      const token = uuidv4();
      db.prepare('INSERT INTO sessions (token) VALUES (?)').run(token);
      return NextResponse.json({ success: true, token });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
