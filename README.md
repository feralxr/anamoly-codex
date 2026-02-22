# ANOMALY CODEX

Monorepo scaffold for a horror-themed anomaly survival platform.

## Structure
- `frontend/` React + Vite app with terminal-horror UX, auth, game flow screens, leaderboard and devlog feed.
- `backend/` Express + MongoDB Atlas API with JWT auth, session logging, leaderboards, and admin devlog posting.

## Backend setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### backend `.env` keys
- `PORT=4000`
- `MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>?retryWrites=true&w=majority`
- `JWT_SECRET=change-me`
- `ADMIN_KEY=change-me`

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Optional frontend env:
- `VITE_API_URL=http://localhost:4000/api`

## Detailed setup guide
See `README_SETUP_LOCAL_AND_PROD.md` for full command-by-command local and production deployment steps (Render + Firebase).
