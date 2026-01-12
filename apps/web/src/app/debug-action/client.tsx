'use client';

import { useState } from 'react';
import { testSessionAction } from './actions';

export function TestSessionClient() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const response = await testSessionAction();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Programmatic Server Action Call</h2>
      <button onClick={handleClick} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Loading...' : 'Call Action Programmatically'}
      </button>
      {result && (
        <pre style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>{result}</pre>
      )}
    </div>
  );
}
