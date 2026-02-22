import { useNavigate } from 'react-router-dom';

const anomalies = [
  { name: 'THE WATCHER', desc: 'It only moves when you look.', difficulty: 'MODERATE', slug: 'watcher', unlocked: true },
  { name: 'THE VOID', desc: 'The floor is disappearing.', difficulty: 'COMING SOON', unlocked: false },
  { name: 'THE MIMIC', desc: 'Something is pretending to be normal.', difficulty: 'COMING SOON', unlocked: false },
  { name: 'THE FOG', desc: 'Visibility is not your only problem.', difficulty: 'COMING SOON', unlocked: false }
];

export default function AnomalyCards() {
  const navigate = useNavigate();

  return (
    <section className="grid md:grid-cols-2 gap-4">
      {anomalies.map((anomaly) => (
        <button
          key={anomaly.name}
          onClick={() => (anomaly.unlocked ? navigate(`/game/${anomaly.slug}`) : alert('NOT YET DISCOVERED'))}
          className="text-left border border-stone-700 p-4 bg-stone-950 hover:border-red-700 hover:shadow-[0_0_15px_rgba(180,20,20,0.6)] transition-all"
        >
          <h3 className="glitch text-xl text-lime-200">{anomaly.name}</h3>
          <p className="text-stone-400">{anomaly.desc}</p>
          <span className="text-xs text-red-400">{anomaly.difficulty}</span>
        </button>
      ))}
    </section>
  );
}
