import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  const { user, repos, question } = await req.json();

  const topLanguages = [...new Set(repos.map((r: any) => r.language).filter(Boolean))].slice(0, 5);

  const prompt = `Write a short, friendly 3-4 sentence summary of this GitHub developer for a recruiter to skim quickly.

Name: ${user.name || user.login}
Bio: ${user.bio || 'No bio provided'}
Public repos: ${user.public_repos}
Followers: ${user.followers}
Top languages used: ${topLanguages.join(', ') || 'Unknown'}
Notable repo names: ${repos.slice(0, 5).map((r: any) => r.name).join(', ')}

${question ? `answer just this question in short ${question}` : `Focus on what kind of developer they seem to be based on their activity, not just repeating the stats back.`}`;

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    });

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}