import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool, initDb } from './db.js';
import { adminOnly, authenticate, signToken } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const scoreMultiplier = (seconds) => {
  if (seconds >= 300) return 5;
  if (seconds >= 120) return 3;
  if (seconds >= 60) return 2;
  return 1;
};

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hash]
    );
    const token = signToken(result.rows[0]);
    res.status(201).json({ token, user: result.rows[0] });
  } catch {
    res.status(409).json({ message: 'Username is taken' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get('/api/profile/sessions', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.sub]
  );
  res.json(result.rows);
});

app.post('/api/sessions', authenticate, async (req, res) => {
  const {
    gameName,
    sessionStart,
    sessionEnd,
    survivalSeconds,
    causeOfDeath,
    anomaliesFaced,
    anomaliesSurvived,
    sanityRemaining,
    ruleBreakDeath = true
  } = req.body;

  const baseScore = survivalSeconds * scoreMultiplier(survivalSeconds);
  const survivalBonus = anomaliesSurvived * 50;
  const sanityBonus = Math.min(sanityRemaining, 100);
  const deathPenalty = ruleBreakDeath ? 100 : 0;
  const finalScore = baseScore + survivalBonus + sanityBonus - deathPenalty;

  const result = await pool.query(
    `INSERT INTO sessions (
      user_id, username, game_name, session_start, session_end, survival_seconds,
      final_score, cause_of_death, anomalies_faced, anomalies_survived, sanity_remaining
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      req.user.sub,
      req.user.username,
      gameName,
      sessionStart,
      sessionEnd,
      survivalSeconds,
      finalScore,
      causeOfDeath,
      anomaliesFaced,
      anomaliesSurvived,
      sanityRemaining
    ]
  );

  res.status(201).json(result.rows[0]);
});

app.get('/api/leaderboard/:gameName', async (req, res) => {
  const result = await pool.query(
    `SELECT username, final_score, survival_seconds, session_end,
      ROW_NUMBER() OVER (ORDER BY final_score DESC, survival_seconds DESC) AS rank
     FROM sessions WHERE game_name = $1
     ORDER BY final_score DESC, survival_seconds DESC LIMIT 10`,
    [req.params.gameName]
  );
  res.json(result.rows);
});

app.get('/api/devlogs', async (_req, res) => {
  const result = await pool.query('SELECT * FROM devlogs ORDER BY created_at DESC LIMIT 50');
  res.json(result.rows);
});

app.post('/api/devlogs', adminOnly, async (req, res) => {
  const { tag, title, description } = req.body;
  if (!tag || !title || !description) return res.status(400).json({ message: 'Missing fields' });

  const result = await pool.query(
    'INSERT INTO devlogs (tag, title, description) VALUES ($1,$2,$3) RETURNING *',
    [tag, title, description]
  );

  res.status(201).json(result.rows[0]);
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
