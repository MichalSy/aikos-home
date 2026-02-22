import { NextResponse } from 'next/server';
import { sshExec } from '@michalsy/aiko-webapp-core/server';
import { requireAuth } from '@/lib/auth';

const QMD = '/home/aiko/.bun/bin/qmd';

async function reindexNuggets() {
  try {
    await sshExec(`${QMD} update 2>/dev/null || true`);
    const { stdout } = await sshExec(`${QMD} embed 2>/dev/null || true`);
    return NextResponse.json({ success: true, output: stdout });
  } catch (error: any) {
    console.error('Reindex error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = requireAuth(reindexNuggets);
