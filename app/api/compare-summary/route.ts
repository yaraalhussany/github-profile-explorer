import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  const { userA, userB, question } = await req.json();

  const prompt = `Compare these two GitHub developers for a recruiter.

Developer A — ${userA.name || userA.login}: ${userA.bio || 'No bio'}, ${userA.public_repos} repos, ${userA.followers} followers
Developer B — ${userB.name || userB.login}: ${userB.bio || 'No bio'}, ${userB.public_repos} repos, ${userB.followers} followers

${question ? `Specifically answer this question in short: ${question}` : 'Give a short, balanced 3-4 sentence comparison of their apparent strengths and activity levels.'}`;

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    });
    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate comparison' }, { status: 500 });
  }
}