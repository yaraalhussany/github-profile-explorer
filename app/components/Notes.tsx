'use client';

import { useState, useEffect } from 'react';

export default function Notes({ storageKey }: { storageKey: string }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(`note:${storageKey}`);
    if (existing) setNote(existing);
  }, [storageKey]);

  function handleSave() {
    localStorage.setItem(`note:${storageKey}`, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div style={{ marginTop: '1rem', padding: '0.5rem', border: '1px dashed #999' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem' }}>
        <strong>Notes</strong>
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: '0.5rem' }}
        placeholder="Add a note about this profile..."
      />
      <button onClick={handleSave} style={{ marginTop: '0.5rem' }}>
        {saved ? 'Saved!' : 'Save Note'}
      </button>
    </div>
  );
}