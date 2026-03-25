# Frontend: Face Detector

This frontend is built with React + Vite and performs face detection in-browser using `face-api.js`.

For full-stack architecture, API docs, and deployment instructions, see the root project README at `../README.md`.

## Frontend Tech Stack

- React 19
- Vite 7
- Zustand
- Tailwind CSS 4
- face-api.js (`TinyFaceDetector`)
- Socket.IO client

## Environment Variables

Create `frontend/.env` as needed:

- `VITE_BACKEND_URL=http://localhost:3000`
- `VITE_WS_URL=http://localhost:3000` (optional)
- `VITE_FACE_API_MODEL_URL=/models` (optional, default `/models`)
- `VITE_ENABLE_REALTIME=true` (optional)

## Model Files (Required for Local Models)

Place these files in `frontend/public/models`:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`

Without these files, detection may rely on configured fallback model URLs.

## Available Scripts

- `npm run dev` start local dev server
- `npm run build` create production build
- `npm run preview` preview production build locally
- `npm run lint` run ESLint

## Local Run

From the `frontend` directory:

```bash
npm install
npm run dev
```

Open the app on the URL printed by Vite (usually `http://localhost:5173`).

## Detection Flow (Frontend)

1. User pastes image URL or uploads local image.
2. Frontend attempts direct browser image load.
3. If URL load fails due to CORS, frontend calls backend `POST /imageproxy` to fetch an image data URL.
4. `face-api.js` detects faces and returns bounding boxes.
5. Frontend sends `POST /image` to increment user entries for leaderboard.
