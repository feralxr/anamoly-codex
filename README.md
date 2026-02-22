# ANOMALY CODEX

Monorepo scaffold for a horror-themed anomaly survival platform.

## Structure
- `frontend/` React + Vite app with terminal-horror UX, auth, game flow screens, leaderboard and devlog feed.
- `backend/` Express + PostgreSQL API with JWT auth, session logging, leaderboards, and admin devlog posting.

## Backend setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### backend `.env` keys
- `PORT=4000`
- `DATABASE_URL=postgresql://user:password@localhost:5432/anomaly`
- `JWT_SECRET=change-me`
- `ADMIN_KEY=change-me`
- `DB_SSL=false`

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Optional frontend env:
- `VITE_API_URL=http://localhost:4000/api`
