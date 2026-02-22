import { NextRequest, NextResponse } from 'next/server';
import { getQuests, createQuest } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function handleGetQuests(req: NextRequest) {
  try {
    const quests = await getQuests();
    return NextResponse.json(quests);
  } catch (error: any) {
    console.error('GET /api/quests error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch quests', details: error.message }, { status: 500 });
  }
}

async function handleCreateQuest(req: NextRequest) {
  try {
    const { title, description = '', priority = 'medium', sort_order = 0 } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const id = await createQuest({ title, description, priority, sort_order });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('POST /api/quests error:', error.message);
    return NextResponse.json({ error: 'Failed to create quest', details: error.message }, { status: 500 });
  }
}

export const GET = requireAuth(handleGetQuests);
export const POST = requireAuth(handleCreateQuest);
