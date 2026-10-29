# FrameForge AI deployment

FrameForge uses the WayinVideo AI Clipping API for actual clip analysis and rendering. The GitHub Pages deployment is static and **cannot execute the API routes**. Deploy this repository to Vercel (or another Node serverless host that supports the included API routes) for the full app.

## Required secret

In the hosting provider's server-side project environment settings, add:

- `WAYINVIDEO_API_KEY` — create an API key in the WayinVideo API dashboard.

Do not place the key in `index.html`, frontend JavaScript, or a public GitHub commit.

## Deploy on Vercel

1. Import `ronithyadav16-arch/creatorhunter-ai` from GitHub into Vercel.
2. Add `WAYINVIDEO_API_KEY` under Project Settings → Environment Variables for Production (and Preview if needed).
3. Deploy/redeploy the project.
4. Open the deployed URL and run a small test video. API usage and rendered exports may consume provider plan credits; check provider pricing before processing many clips.

## API routes in this repo

- `POST /api/clips` submits a clipping job with vertical 9:16 output, AI hook, animated captions, and ranked clip limit.
- `GET /api/clips?id=PROJECT_ID` retrieves processing status and clip results.
- `POST /api/upload` requests a signed upload URL for MP4, MOV, WebM, or AVI. The browser uploads the video directly to the provider's signed URL, then submits the returned identity to `POST /api/clips`.

## Notes

- Video processing/rendering time varies. The app must show the real provider status and not promise a fixed one-minute completion.
- Export links from the provider can expire; download completed clips promptly.
- Upload limits and API usage depend on the provider subscription.
