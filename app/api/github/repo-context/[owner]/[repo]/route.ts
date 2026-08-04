import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
  };

  let readme = '';
  try {
    const readmeres = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (readmeres.ok) {
      const readmeData = await readmeres.json();
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8').slice(0, 3000);
    }
  } catch {
    readme = 'This repository has no README.';
  }

  // File structure (top level only, keeps it light)
  let files: string[] = [];
  try {
    const contentres = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
    if (contentres.ok) {
      const contentdata = await contentres.json();
      files = contentdata.map((f: any) => f.name);
    }
  } catch {
    files = [];
  }

  let commits: string[] = [];
  try {
    const commitres = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, { headers });
    if (commitres.ok) {
      const commitdata = await commitres.json();
      commits = commitdata.map((c: any) => c.commit.message.split('\n')[0]);
    }
  } catch {
    commits = [];
  }

  return NextResponse.json({ readme, files, commits });
}