//fetching username requesed
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `GitHub API error: ${response.status}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}