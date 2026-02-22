# ANOMALY CODEX — Setup Guide (Local + Production)

This is a command-by-command setup guide for:
1. **Local development**
2. **Production backend on Render**
3. **Production frontend on Firebase Hosting**

---

## 0) Prerequisites

Install these first:
- Node.js 20+
- npm 10+
- Git
- MongoDB Atlas account
- Firebase CLI

### Verify tools
```bash
node -v
npm -v
git --version
firebase --version
```

If Firebase CLI is missing:
```bash
npm install -g firebase-tools
```

---

## 1) Clone and enter project

```bash
git clone <YOUR_REPO_URL> anamoly-codex
cd anamoly-codex
```

---

## 2) Create MongoDB Atlas database

### 2.1 Create cluster
1. Open MongoDB Atlas
2. Create a cluster (free tier is fine)
3. Create database user
4. Add IP Access List entry:
   - For local testing: add your current IP
   - For Render deployment: add `0.0.0.0/0` (or locked CIDR if you know it)

### 2.2 Get connection string
In Atlas → Connect → Drivers, copy URI:

```text
mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>?retryWrites=true&w=majority
```

Set `<DB_NAME>` to something like `anomaly`.

---

## 3) Local backend setup (Express + MongoDB Atlas)

### 3.1 Configure backend env

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` to this shape:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/anomaly?retryWrites=true&w=majority
JWT_SECRET=<LONG_RANDOM_SECRET>
ADMIN_KEY=<LONG_RANDOM_ADMIN_KEY>
```

### 3.2 Install dependencies + run backend

```bash
npm install
npm run dev
```

You should see:
```text
Server listening on 4000
```

Backend URL (local):
- `http://localhost:4000`

Health check quick test:
```bash
curl http://localhost:4000/api/devlogs
```

---

## 4) Local frontend setup (React + Vite)

Open a new terminal at repo root, then:

```bash
cd frontend
npm install
```

Create frontend env:
```bash
cat > .env << 'ENVEOF'
VITE_API_URL=http://localhost:4000/api
ENVEOF
```

Run frontend:
```bash
npm run dev
```

Open:
- `http://localhost:5173`

---

## 5) Local end-to-end smoke test

### 5.1 Register user (from frontend)
- Go to `/auth`
- Switch to register
- Create username/password

### 5.2 Test backend auth via curl
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"tester1","password":"pass1234"}'
```

### 5.3 Test admin devlog API
```bash
curl -X POST http://localhost:4000/api/devlogs \
  -H "Content-Type: application/json" \
  -H "x-admin-key: <YOUR_ADMIN_KEY_FROM_ENV>" \
  -d '{"tag":"UPDATE","title":"Initial Ops Note","description":"Systems nominal."}'
```

---

## 6) Production backend on Render

You need:
- A Render account
- MongoDB Atlas cluster already created

### 6.1 Push repo to GitHub
```bash
git add .
git commit -m "chore: prep deployment"
git push origin <your-branch>
```

### 6.2 Create backend Web Service on Render
1. Render Dashboard → **New** → **Web Service**
2. Connect your repo
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 6.3 Set backend env vars on Render
In service settings, add:
- `PORT=10000` (Render usually injects PORT automatically)
- `MONGODB_URI=<Atlas connection string>`
- `JWT_SECRET=<LONG_RANDOM_SECRET>`
- `ADMIN_KEY=<LONG_RANDOM_ADMIN_KEY>`

### 6.4 Atlas network allowlist for Render
In MongoDB Atlas IP Access List, ensure your Render backend can connect:
- easiest: `0.0.0.0/0`
- more secure: restrict to known egress ranges if available

### 6.5 Deploy + verify
After deploy, test:
```bash
curl https://<your-render-service>.onrender.com/api/devlogs
```

Keep this URL:
- `https://<your-render-service>.onrender.com/api`

---

## 7) Production frontend on Firebase Hosting

You need:
- Firebase project created in Firebase Console

### 7.1 Build frontend with production API URL
From repo root:

```bash
cd frontend
npm install
cat > .env.production << 'ENVEOF'
VITE_API_URL=https://<your-render-service>.onrender.com/api
ENVEOF
npm run build
```

### 7.2 Initialize Firebase Hosting
From repo root:

```bash
cd ..
firebase login
firebase init hosting
```

When prompted:
- Select your Firebase project
- Public directory: `frontend/dist`
- Single-page app rewrite: **Yes**
- Overwrite `index.html`: **No**

### 7.3 Deploy Hosting
```bash
firebase deploy --only hosting
```

You’ll get a live URL like:
- `https://<project-id>.web.app`

---

## 8) CORS and production wiring checklist

If frontend can’t call backend, verify:
- Frontend `.env.production` points to Render API URL
- Backend is up on Render
- Render service has all env vars
- Atlas IP access list allows Render
- Backend CORS allows your Firebase domain (currently backend uses permissive CORS)

Recommended hardening (later):
- Restrict CORS origin to your Firebase domains
- Rotate `JWT_SECRET` and `ADMIN_KEY`
- Add rate limiting and helmet middleware

---

## 9) Useful operational commands

### Local backend
```bash
cd backend
npm run dev
```

### Local frontend
```bash
cd frontend
npm run dev
```

### Frontend production build
```bash
cd frontend
npm run build
npm run preview
```

### Firebase redeploy
```bash
firebase deploy --only hosting
```

---

## 10) Quick trouble fixes

### Mongo auth/connect errors
- Re-check `MONGODB_URI`
- Ensure Atlas DB user/password is correct
- Ensure Atlas IP allowlist includes your source IP (local) and Render egress

### npm install fails with permissions/network
```bash
npm cache clean --force
npm install
```

### Firebase route 404 on refresh
- Ensure SPA rewrite is enabled in `firebase.json`

---

## 11) Minimal production architecture

- **Frontend**: Firebase Hosting (`frontend/dist`)
- **Backend API**: Render Web Service (`backend`)
- **Database**: MongoDB Atlas
- **Auth**: JWT issued by backend
- **Data flow**: Firebase app → Render API → MongoDB Atlas

