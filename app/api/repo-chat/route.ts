import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages, repoContext } = await req.json();

  const systemPrompt = `You are a helpful assistant answering questions about the GitHub repository "${repoContext.owner}/${repoContext.repo}".

README content:
${repoContext.readme}

Top-level files/folders:
${repoContext.files.join(', ')}

Recent commit messages:
${repoContext.commits.join('\n')}

Answer questions using only this information. If something isn't covered by the context above, say you don't have that information rather than guessing.`;

  const result = streamText({
  model: groq('llama-3.3-70b-versatile'),
  system: systemPrompt,
  messages: await convertToModelMessages(messages),
});

  return result.toUIMessageStreamResponse();
}