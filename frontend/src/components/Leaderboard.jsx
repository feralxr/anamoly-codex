import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuthStore } from '../store/useAuthStore';

export default function Leaderboard({ gameName = 'watcher' }) {
  const [rows, setRows] = useState([]);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api(`/leaderboard/${gameName}`).then(setRows).catch(() => setRows([]));
  }, [gameName]);

  return (
    <section className="border border-red-950 p-4 bg-stone-950/70">
      <h2 className="text-lg text-lime-300 mb-3 glitch">LEADERBOARD // {gameName.toUpperCase()}</h2>
      <table className="w-full text-sm">
        <thead className="text-red-300">
          <tr><th>Rank</th><th>User</th><th>Score</th><th>Time</th><th>Date</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.username}-${row.rank}`} className={user?.username === row.username ? 'bg-red-950/40' : ''}>
              <td>{row.rank}</td>
              <td>{row.username}</td>
              <td>{row.final_score}</td>
              <td>{row.survival_seconds}s</td>
              <td>{new Date(row.session_end).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
