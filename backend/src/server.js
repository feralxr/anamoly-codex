import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDb, Devlog, Session, User } from './db.js';
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

  const existing = await User.findOne({ username });
  if (existing) return res.status(409).json({ message: 'Username is taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash });
  const token = signToken({ id: user._id.toString(), username: user.username });

  res.status(201).json({ token, user: { id: user._id, username: user.username } });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user._id.toString(), username: user.username });
  res.json({ token, user: { id: user._id, username: user.username } });
});

app.get('/api/profile/sessions', authenticate, async (req, res) => {
  const rows = await Session.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean();
  res.json(rows);
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

  const session = await Session.create({
    userId: req.user.sub,
    username: req.user.username,
    gameName,
    sessionStart,
    sessionEnd,
    survivalSeconds,
    finalScore,
    causeOfDeath,
    anomaliesFaced,
    anomaliesSurvived,
    sanityRemaining
  });

  res.status(201).json(session);
});

app.get('/api/leaderboard/:gameName', async (req, res) => {
  const rows = await Session.find({ gameName: req.params.gameName })
    .sort({ finalScore: -1, survivalSeconds: -1 })
    .limit(10)
    .lean();

  const ranked = rows.map((row, i) => ({
    rank: i + 1,
    username: row.username,
    final_score: row.finalScore,
    survival_seconds: row.survivalSeconds,
    session_end: row.sessionEnd
  }));

  res.json(ranked);
});

app.get('/api/devlogs', async (_req, res) => {
  const rows = await Devlog.find({}).sort({ createdAt: -1 }).limit(50).lean();
  res.json(rows);
});

app.post('/api/devlogs', adminOnly, async (req, res) => {
  const { tag, title, description } = req.body;
  if (!tag || !title || !description) return res.status(400).json({ message: 'Missing fields' });

  const row = await Devlog.create({ tag, title, description });
  res.status(201).json(row);
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect database', err);
    process.exit(1);
  });
