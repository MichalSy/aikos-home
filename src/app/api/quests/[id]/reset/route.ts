import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function resetQuest(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questId = parseInt(params.id);
    
    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
    }
    
    // Delete all tasks for this quest
    db.prepare('DELETE FROM tasks WHERE quest_id = ?').run(questId);
    
    // Reset quest to TODO and not ready
    db.prepare(`
      UPDATE quests 
      SET status = 'todo', is_ready = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(questId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/quests/[id]/reset error:', error.message);
    return NextResponse.json({ error: 'Failed to reset quest' }, { status: 500 });
  }
}

export const POST = requireAuth(resetQuest);
