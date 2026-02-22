import { Howl } from 'howler';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import AnomalyCards from '../components/AnomalyCards';
import Leaderboard from '../components/Leaderboard';
import DevlogFeed from '../components/DevlogFeed';

const drone = new Howl({ src: [], volume: 0.2, loop: true });

export default function HomePage() {
  useEffect(() => {
    drone.fade(0, 0.2, 800);
    return () => drone.stop();
  }, []);

  return (
    <Layout>
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="min-h-[50vh] border border-red-950 p-6 bg-gradient-to-b from-black to-stone-950">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-6xl text-center text-lime-200 glitch tracking-[0.6em]"
          >
            ANOMALY
          </motion.h1>
          <p className="text-center text-stone-300 mt-4">How long can you survive the rules?</p>
        </section>

        <AnomalyCards />
        <Leaderboard gameName="watcher" />
        <DevlogFeed />
      </main>
    </Layout>
  );
}
