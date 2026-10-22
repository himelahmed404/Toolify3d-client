# Deploy storefront on Vercel

**Project (already linked):** `himelahmed/toolify3d`  
**GitHub:** https://github.com/himelahmed404/Toolify3d-client  
**Alias:** https://toolify3d-himelahmed.vercel.app

1. Open the project in the [Vercel Dashboard](https://vercel.com/himelahmed/toolify3d).
2. **Settings → Environment Variables** — add every key from `.env.example` with **production** values (not localhost).
   - Currently only `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGO_URI` exist — fill the rest.
   - `API_URL` = your Render API origin (e.g. `https://toolify3d-api.onrender.com`) — no trailing slash.
   - `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` = this project’s public URL (or custom domain).
   - `MONGO_URI` = same Atlas URI as admin + API (rotate if moving to a new DB).
3. Redeploy Production after env changes.
4. If you add a custom domain, update `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, and `NEXT_PUBLIC_SITE_URL`, then redeploy.
5. Tell the Render API to allow this origin in `CLIENT_URL` and `BETTER_AUTH_URL` (see `../toolify-3d_server/RENDER.md` and `../SMOKE_TEST.md`).

CLI:

```bash
cd toolify-3d
vercel link --yes --project toolify3d   # already done locally
vercel env ls
vercel --prod
```
