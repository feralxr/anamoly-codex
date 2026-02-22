import { useEffect, useState } from 'react';
import { api } from '../api';

export default function DevlogFeed() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api('/devlogs').then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <section className="border border-stone-700 p-4 bg-black/60">
      <h2 className="text-lime-300 glitch mb-2">FACILITY BULLETIN // DEVLOG</h2>
      <div className="space-y-2 max-h-80 overflow-auto">
        {logs.map((log) => (
          <article key={log.id} className="border-l-2 border-red-800 pl-3">
            <div className="text-xs text-red-300">[{log.tag}] {new Date(log.created_at).toLocaleDateString()}</div>
            <h3 className="text-stone-100">{log.title}</h3>
            <p className="text-stone-400 text-sm">{log.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
