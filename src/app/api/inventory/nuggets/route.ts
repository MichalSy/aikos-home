import { NextResponse } from 'next/server';
import { 
  sshListDir, 
  sshDirExists, 
  sshFileExists, 
  sshReadFile,
  sshWriteFile 
} from '@michalsy/aiko-webapp-core/server';
import { requireAuth } from '@/lib/auth';

const SHARED_BRAIN = '/home/aiko/shared-brain';

interface NuggetInfo {
  name: string;
  path: string;
  title?: string;
}

async function listNuggets(): Promise<NuggetInfo[]> {
  const exists = await sshDirExists(`${SHARED_BRAIN}/nuggets`);
  if (!exists) return [];
  
  const dirs = await sshListDir(`${SHARED_BRAIN}/nuggets`);
  
  const nuggets: NuggetInfo[] = [];
  for (const dir of dirs) {
    const nuggetPath = `${SHARED_BRAIN}/nuggets/${dir}/nugget.md`;
    const hasNugget = await sshFileExists(nuggetPath);
    if (hasNugget) {
      // Read first line to get title
      let title = dir;
      try {
        const content = await sshReadFile(nuggetPath);
        const firstLine = content.split('\n')[0];
        if (firstLine.startsWith('# ')) {
          title = firstLine.slice(2).trim();
        }
      } catch {}
      
      nuggets.push({
        name: dir,
        path: `nuggets/${dir}/nugget.md`,
        title,
      });
    }
  }
  
  return nuggets.sort((a, b) => a.name.localeCompare(b.name));
}

async function handleGetNuggets() {
  try {
    const nuggets = await listNuggets();
    return NextResponse.json({ nuggets });
  } catch (error: any) {
    console.error('List nuggets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = requireAuth(handleGetNuggets);
