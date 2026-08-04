'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Notes from '../../../components/Notes';

interface RepoContext {
  readme: string;
  files: string[];
  commits: string[];
}

export default function RepoChat() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [context, setContext] = useState<RepoContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [input, setInput] = useState('');

  const storageKey = `chat:${owner}/${repo}`;

  const { messages, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/repo-chat' }),
  });

  // Load repo context on mount
  useEffect(() => {
    async function loadContext() {
      const res = await fetch(`/api/github/repo-context/${owner}/${repo}`);
      const data = await res.json();
      setContext(data);
      setContextLoading(false);
    }
    loadContext();
  }, [owner, repo]);

  // Load saved chat history on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setMessages(JSON.parse(saved));
  }, [storageKey, setMessages]);

  // Save chat history whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !context) return;
    sendMessage(
      { text: input },
      { body: { repoContext: { owner, repo, ...context } } }
    );
    setInput('');
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Chat about {owner}/{repo}</h1>

      {contextLoading && <p>Loading repo context...</p>}

      {context && (
        <details style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.75rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            README
          </summary>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', maxHeight: '400px', overflowY: 'auto' }}>
  {context.readme ? (
    <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    img: ({ src, alt, ...props }) => {
  let resolvedSrc = typeof src === 'string' ? src : '';
  if (resolvedSrc && !resolvedSrc.startsWith('http')) {
    resolvedSrc = `https://raw.githubusercontent.com/${owner}/${repo}/main/${resolvedSrc.replace(/^\.?\//, '')}`;
  }
  return <img src={resolvedSrc} alt={alt || ''} style={{ maxWidth: '100%', height: 'auto' }} {...props} />;
},
  }}
>
  {context.readme}
</ReactMarkdown>
  ) : (
    'No README found for this repository.'
  )}
</div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
            Files: {context.files.join(', ')}
          </p>
        </details>
      )}

      <div style={{ marginBottom: '1rem', minHeight: '300px', border: '1px solid #ccc', padding: '1rem' }}>
        {messages.map((m: any) => (
          <div key={m.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{m.role === 'user' ? 'You' : 'Groq'}:</strong>{' '}
            {m.parts?.map((part: any, i: number) =>
              part.type === 'text' ? <span key={i}>{part.text}</span> : null
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about this repo..."
          disabled={contextLoading}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" disabled={contextLoading}>Send</button>
      </form>
      <Notes storageKey={`${owner}/${repo}`} />
    </main>
  );
}