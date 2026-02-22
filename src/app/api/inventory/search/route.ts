import { NextRequest, NextResponse } from 'next/server';
import { sshExec } from '@michalsy/aiko-webapp-core/server';
import { requireAuth } from '@/lib/auth';

async function searchNuggets(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json({ names: [] });
    }

    // Sanitize: escape single quotes for shell safety
    const safeQuery = query.replace(/'/g, "'\\''");

    // Update index before search (fast, ~500ms, no LLM)
    await sshExec(`/home/aiko/.bun/bin/qmd update 2>/dev/null || true`);
    const { stdout } = await sshExec(`/home/aiko/.bun/bin/qmd search '${safeQuery}' 2>/dev/null || true`);

    // Parse: extract nugget names from lines like:
    // qmd://shared-brain/nuggets/<name>/nugget.md:1 #hash
    const names: string[] = [];
    const regex = /qmd:\/\/shared-brain\/nuggets\/([a-zA-Z0-9_-]+)\/nugget\.md/g;
    let match;
    while ((match = regex.exec(stdout)) !== null) {
      if (!names.includes(match[1])) {
        names.push(match[1]);
      }
    }

    return NextResponse.json({ names, query });
  } catch (error: any) {
    console.error('Search nuggets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = requireAuth(searchNuggets);
