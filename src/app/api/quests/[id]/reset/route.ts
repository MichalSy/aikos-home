import { NextRequest, NextResponse } from 'next/server';
import { resetQuest } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function handleResetQuest(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questId = parseInt(params.id);
    
    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
    }
    
    await resetQuest(questId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/quests/[id]/reset error:', error.message);
    return NextResponse.json({ error: 'Failed to reset quest' }, { status: 500 });
  }
}

export const POST = requireAuth(handleResetQuest);
