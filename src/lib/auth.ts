import { NextRequest, NextResponse } from 'next/server';
import db from './db';

export function isAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  
  const token = auth.split(' ')[1];
  return !!db.prepare('SELECT 1 FROM sessions WHERE token = ?').get(token);
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest, context: any) => {
    if (!isAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, context);
  };
}
