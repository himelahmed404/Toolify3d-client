# Deploy storefront on Vercel

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → import `0xW1zard/Toolify3d-client`.
2. Framework Preset: **Next.js**. Root Directory: `.` (repo root).
3. **Environment Variables** — add every key from `.env.example` with production values.
   - `API_URL` = your Render API origin (e.g. `https://toolify3d-api.onrender.com`) — no trailing slash.
   - `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` = this project’s public URL (or custom domain).
   - `MONGO_URI` = same Atlas URI as admin + API.
4. Deploy.
5. If you add a custom domain, update `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, and `NEXT_PUBLIC_SITE_URL`, then redeploy.
6. Tell the Render API to allow this origin in `CLIENT_URL` and `BETTER_AUTH_URL` (see `../toolify-3d_server/RENDER.md`).

CLI (optional):

```bash
npx vercel link
npx vercel env pull   # after envs are set in dashboard
npx vercel --prod
```
