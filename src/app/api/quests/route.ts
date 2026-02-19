import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getQuests(req: NextRequest) {
  try {
    const quests = db.prepare(`
      SELECT id, title, description, status, is_ready, priority, sort_order, created_at, updated_at 
      FROM quests 
      ORDER BY sort_order ASC
    `).all() as any[];
    
    const questsWithTasks = quests.map(quest => {
      const tasks = db.prepare(`
        SELECT id, quest_id, title, description, status, is_ready, sort_order, result, created_at, updated_at 
        FROM tasks 
        WHERE quest_id = ? 
        ORDER BY sort_order ASC
      `).all(quest.id);
      return { ...quest, tasks };
    });
    
    return NextResponse.json(questsWithTasks);
  } catch (error: any) {
    console.error('GET /api/quests error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch quests', details: error.message }, { status: 500 });
  }
}

async function createQuest(req: NextRequest) {
  try {
    const { title, description = '', priority = 'medium', sort_order = 0 } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const stmt = db.prepare(`
      INSERT INTO quests (title, description, status, is_ready, priority, sort_order) 
      VALUES (?, ?, 'todo', 0, ?, ?)
    `);
    const info = stmt.run(title, description, priority, sort_order);
    
    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (error: any) {
    console.error('POST /api/quests error:', error.message);
    return NextResponse.json({ error: 'Failed to create quest', details: error.message }, { status: 500 });
  }
}

export const GET = requireAuth(getQuests);
export const POST = requireAuth(createQuest);
