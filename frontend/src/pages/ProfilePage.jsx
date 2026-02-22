import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const [rows, setRows] = useState([]);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    api('/profile/sessions', { headers: { Authorization: `Bearer ${token}` } })
      .then(setRows)
      .catch(() => setRows([]));
  }, [token]);

  return (
    <Layout>
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-lime-300 glitch text-3xl mb-4">PERSONNEL DOSSIER</h1>
        <table className="w-full text-sm border border-stone-800">
          <thead className="text-red-300">
            <tr>
              <th>Game</th><th>Start</th><th>End</th><th>Survival</th><th>Score</th><th>Death</th><th>Faced</th><th>Survived</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id || r._id}>
                <td>{r.game_name || r.gameName}</td><td>{new Date(r.session_start || r.sessionStart).toLocaleString()}</td><td>{new Date(r.session_end || r.sessionEnd).toLocaleString()}</td>
                <td>{r.survival_seconds || r.survivalSeconds}s</td><td>{r.final_score || r.finalScore}</td><td>{r.cause_of_death || r.causeOfDeath}</td><td>{r.anomalies_faced || r.anomaliesFaced}</td><td>{r.anomalies_survived || r.anomaliesSurvived}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </Layout>
  );
}
