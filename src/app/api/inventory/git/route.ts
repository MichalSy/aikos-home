import { NextRequest, NextResponse } from 'next/server';
import { sshExec } from '@michalsy/aiko-webapp-core/server';
import { requireAuth } from '@/lib/auth';

const SHARED_BRAIN = '/home/aiko/shared-brain';

async function gitStatus() {
  try {
    const { stdout } = await sshExec(`cd ${SHARED_BRAIN} && git status --short`);
    const changes = stdout.trim().split('\n').filter(Boolean);
    return NextResponse.json({ changes, hasChanges: changes.length > 0 });
  } catch (error: any) {
    console.error('Git status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function gitCommitPush(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Commit message required' }, { status: 400 });
    }
    
    // Add all changes
    await sshExec(`cd ${SHARED_BRAIN} && git add -A`);
    
    // Commit
    const { stdout: commitOut } = await sshExec(
      `cd ${SHARED_BRAIN} && git commit -m "${message.replace(/"/g, '\\"')}"`
    );
    
    // Push
    await sshExec(`cd ${SHARED_BRAIN} && git push`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Committed and pushed successfully',
      commit: commitOut
    });
  } catch (error: any) {
    // Check if it's just "nothing to commit"
    if (error.message?.includes('nothing to commit')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Nothing to commit' 
      });
    }
    console.error('Git commit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleGit(req: NextRequest) {
  const method = req.method;
  
  if (method === 'GET') {
    return gitStatus();
  } else if (method === 'POST') {
    return gitCommitPush(req);
  }
  
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(gitStatus);
export const POST = requireAuth(gitCommitPush);
