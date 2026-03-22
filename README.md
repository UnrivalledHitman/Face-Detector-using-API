# Face Detector using API

Using clarifai AI for API

## Deploy To Vercel

Deploy frontend and backend as two separate Vercel projects from the same repo.

### 1) Backend (Vercel Project #1)

- Root Directory: `backend`
- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty

Environment variables in Vercel (Backend project):

- `DATABASE_URL` = your Prisma Postgres connection string
- `FRONTEND_URL` = your frontend URL (use comma-separated values if needed)
- `CLARIFAI_PAT`
- `CLARIFAI_USER_ID`
- `CLARIFAI_APP_ID`
- `CLARIFAI_MODEL_ID`
- `CLARIFAI_MODEL_VERSION_ID`

After first deploy, run migrations from local backend terminal against the same cloud `DATABASE_URL`:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

### 2) Frontend (Vercel Project #2)

- Root Directory: `frontend`
- Framework Preset: `Vite`

Environment variables in Vercel (Frontend project):

- `VITE_BACKEND_URL` = deployed backend URL
- Optional: `VITE_ENABLE_REALTIME=false` (recommended on Vercel serverless backend)

### Notes

- Frontend SPA routes are handled by `frontend/vercel.json`.
- Backend API routing is handled by `backend/vercel.json` + `backend/api/index.js`.
- Local websocket realtime remains available when running the local backend server.
