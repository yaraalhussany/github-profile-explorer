'use client';

import { useState } from 'react';
import Notes from './components/Notes';

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

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [question, setQuestion]=useState('');

  async function Search() {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setUser(null);
    setRepos([]);
    setSummary('');

    try {
      const userres = await fetch(`/api/github/user/${username}`);
      if (!userres.ok) throw new Error('This username does not exist');
      const userdata = await userres.json();
      setUser(userdata);

      const reposres = await fetch(`/api/github/user/${username}/repos`);
      const reposdata = await reposres.json();
      setRepos(reposdata);
    } catch (err) {
      setError('Could not find that user. Check the username and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function Summarize() {
    if (!user) return;
    setSummarizing(true);
    setSummary('');
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, repos, question }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary('Could not generate summary.');
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div className="flex items-center justify-center gap-2">
  <div className="bg-white rounded p-1">
  <img src="/icons8-github.svg" alt="GitHub Profile Explorer icon" width={32} height={32} />
</div>
  <h1 className="text-center">GitHub Profile Explorer</h1>
</div>

      <div className="flex justify-center gap-2 mb-4">
  <input
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && Search()}
    placeholder="Enter GitHub username"
    className="flex-1 max-w-sm px-3 py-2 border rounded"
  />
  <button
    onClick={Search}
    disabled={loading}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
  >
    {loading ? `Searching for ${username}` : 'Search'}
  </button>
</div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user && (
        <div style={{ marginBottom: '2rem' }}>
          <img src={user.avatar_url} width={80} style={{ borderRadius: '50%' }} />
          <h2>{user.name || user.login}</h2>
          <p>{user.bio}</p>
          <p>
            {user.public_repos} repos · {user.followers} followers · {user.following} following
          </p>
          <a href={user.html_url} target="_blank">View on GitHub</a>

          <div>
            <input
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="Ask Groq"
  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
/>
<button onClick={Summarize} disabled={summarizing} style={{ marginTop: '0.5rem' }}>
  {summarizing ? 'Summarizing with Groq..' : 'Ask Groq'}
</button>
{summary && <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{summary}</p>}
          </div>

          <Notes storageKey={user.login} />
        </div>
      )}

      {repos.length > 0 && (
        <div>
          <h3>Repositories</h3>
          {repos.map((repo) => (
            <div key={repo.id} style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>
              <a href={repo.html_url} target="_blank"><strong>{repo.name}</strong></a>
              <p>{repo.description}</p>
              <small>{repo.language} · ⭐ {repo.stargazers_count}</small>
              <a href={`/repo-chat/${user?.login}/${repo.name}`} style={{ display: 'block', marginTop: '0.25rem' }}>
  Ask about this repo
</a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}