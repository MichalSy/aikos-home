import { NextRequest, NextResponse } from 'next/server';
import { 
  sshReadFile, 
  sshWriteFile,
  sshFileExists 
} from '@michalsy/aiko-webapp-core/server';
import { requireAuth } from '@/lib/auth';

const SHARED_BRAIN = '/home/aiko/shared-brain';

async function getNugget(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params;
    const nuggetPath = `${SHARED_BRAIN}/nuggets/${name}/nugget.md`;
    
    if (!(await sshFileExists(nuggetPath))) {
      return NextResponse.json({ error: 'Nugget not found' }, { status: 404 });
    }
    
    const content = await sshReadFile(nuggetPath);
    return NextResponse.json({ name, content, path: nuggetPath });
  } catch (error: any) {
    console.error('Get nugget error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateNugget(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params;
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    
    const nuggetPath = `${SHARED_BRAIN}/nuggets/${name}/nugget.md`;
    await sshWriteFile(nuggetPath, content);
    
    return NextResponse.json({ success: true, path: nuggetPath });
  } catch (error: any) {
    console.error('Update nugget error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = requireAuth(getNugget);
export const PUT = requireAuth(updateNugget);
