import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api';
import { useAuthStore } from '../store/useAuthStore';

const watcherRules = [
  'When dense fog arrives, stop moving immediately.',
  'If the black figure appears, find room R and close the door.',
  'Do not enter inverted or already-open doors.',
  'During blackout, do not move until light returns.',
  'If your mirror reflection moves first, leave at once.'
];

export default function GameFlowPage() {
  const { slug } = useParams();
  const [phase, setPhase] = useState('loader');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const startTime = useMemo(() => new Date(), []);

  const narrateRules = () => {
    watcherRules.forEach((rule, index) => {
      const utterance = new SpeechSynthesisUtterance(rule);
      utterance.pitch = 0.5;
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      setTimeout(() => speechSynthesis.speak(utterance), index * 1600);
    });
  };

  const simulateDeath = async () => {
    const end = new Date();
    const survivalSeconds = Math.floor((end - startTime) / 1000) + 45;
    const body = {
      gameName: slug,
      sessionStart: startTime.toISOString(),
      sessionEnd: end.toISOString(),
      survivalSeconds,
      causeOfDeath: 'You entered an inverted room.',
      anomaliesFaced: 4,
      anomaliesSurvived: 3,
      sanityRemaining: 42,
      ruleBreakDeath: true
    };

    let saved = null;
    if (token) {
      saved = await api('/sessions', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    }

    setResult(saved || { ...body, final_score: 0 });
    setPhase('end');
  };

  return (
    <Layout>
      <main className="max-w-4xl mx-auto p-6 text-center">
        {phase === 'loader' && (
          <section className="border border-red-900 p-6 space-y-4">
            <h1 className="glitch text-4xl text-lime-200">INITIALIZING {slug?.toUpperCase()}</h1>
            <p>Initializing environment... Detecting anomalies... You have been warned...</p>
            <button className="btn-terminal" onClick={() => setPhase('warning')}>CONTINUE</button>
          </section>
        )}

        {phase === 'warning' && (
          <section className="border border-red-800 p-6">
            <h2 className="text-red-400 text-2xl">⚠ ANOMALY DETECTED</h2>
            <p>CLASSIFICATION: {slug?.toUpperCase()} // THREAT: EXTREME</p>
            <p className="my-3">Follow the rules. Deviation is fatal.</p>
            <button className="btn-terminal" onClick={() => { narrateRules(); setPhase('rules'); }}>ENTER — IF YOU DARE</button>
          </section>
        )}

        {phase === 'rules' && (
          <section className="space-y-3 border border-stone-700 p-6">
            {watcherRules.map((r) => <p key={r}>{r}</p>)}
            <button className="btn-terminal" onClick={() => setPhase('game')}>I UNDERSTAND — BEGIN</button>
          </section>
        )}

        {phase === 'game' && (
          <section className="space-y-4 border border-stone-700 p-8">
            <h2 className="text-3xl text-lime-300 glitch">THE WATCHER // LIVE</h2>
            <p>3D play scene placeholder with HUD and anomaly logic hook points.</p>
            <button className="btn-terminal" onClick={simulateDeath}>TRIGGER TEST DEATH</button>
          </section>
        )}

        {phase === 'end' && result && (
          <section className="space-y-2 border border-red-900 p-8 bg-black">
            <h2 className="text-red-400 text-3xl glitch">SESSION TERMINATED</h2>
            <p>Cause of Death: {result.cause_of_death}</p>
            <p>Total Survival: {result.survival_seconds}s</p>
            <p>Anomalies Faced: {result.anomalies_faced}</p>
            <p>Anomalies Survived: {result.anomalies_survived}</p>
            <p>Sanity Remaining: {result.sanity_remaining}%</p>
            <p className="text-lime-200">Final Score: {result.final_score}</p>
            <div className="flex justify-center gap-3">
              <button className="btn-terminal" onClick={() => window.location.reload()}>TRY AGAIN</button>
              <button className="btn-terminal" onClick={() => navigate('/')}>RETURN HOME</button>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
