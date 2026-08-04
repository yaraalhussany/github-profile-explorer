'use client';

import { useState } from 'react';

interface GithubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

function UserCard({ user }: { user: GithubUser | null }) {
  if (!user) return null;
  return (
    <div style={{ flex: 1, padding: '1rem', border: '1px solid #ccc' }}>
      <img src={user.avatar_url} width={80} style={{ borderRadius: '50%' }} />
      <h2>{user.name || user.login}</h2>
      <p>{user.bio}</p>
      <p>{user.public_repos} repos · {user.followers} followers · {user.following} following</p>
      <a href={user.html_url} target="_blank">View on GitHub</a>
    </div>
  );
}

export default function Compare() {
  const [usernameA, setUsernameA] = useState('');
  const [usernameB, setUsernameB] = useState('');
  const [userA, setUserA] = useState<GithubUser | null>(null);
  const [userB, setUserB] = useState<GithubUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
const [summary, setSummary] = useState('');
const [summarizing, setSummarizing] = useState(false);
  async function fetchuser(username: string): Promise<GithubUser | null> {
    const res = await fetch(`/api/github/user/${username}`);
    if (!res.ok) return null;
    return res.json();
  }

  async function Compare() {
    if (!usernameA.trim() || !usernameB.trim()) return;
    setLoading(true);
    setError('');
    setUserA(null);
    setUserB(null);

    const [a, b] = await Promise.all([fetchuser(usernameA), fetchuser(usernameB)]);

    if (!a || !b) {
      setError('One or both usernames could not be found.');
    } else {
      setUserA(a);
      setUserB(b);
    }
    setLoading(false);
  }
  async function AiCompare() {
  if (!userA || !userB) return;
  setSummarizing(true);
  setSummary('');
  try {
    const res = await fetch('/api/compare-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userA, userB, question }),
    });
    const data = await res.json();
    setSummary(data.summary);
  } catch (err) {
    setSummary('Could not generate comparison.');
  } finally {
    setSummarizing(false);
  }
}

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="text-center text-2xl font-bold">Compare GitHub Users</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={usernameA}
          onChange={(e) => setUsernameA(e.target.value)}
          placeholder="First username"
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <input
          value={usernameB}
          onChange={(e) => setUsernameB(e.target.value)}
          placeholder="Second username"
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={Compare} disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <UserCard user={userA} />
        <UserCard user={userB} />
      </div>
      {userA && userB && (
  <div style={{ marginTop: '1rem' }}>
    <input
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      placeholder="Ask about the 2 users in comparison"
      style={{ width: '100%', padding: '0.5rem' }}
    />
    <button onClick={AiCompare} disabled={summarizing} style={{ marginTop: '0.5rem' }}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {summarizing ? 'Comparing with Groq..' : 'Ask Groq'}
    </button>
    {summary && <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{summary}</p>}
  </div>
)}
    </main>
  );
}