# Deploy Cloudy-Toy on Cloudflare (Workers + OpenNext)

Do NOT use the old "Pages" screen with Framework preset "None". It cannot run this Next.js app.
Use **Workers** (Workers Builds) with the OpenNext adapter. The config files are already in this project:
`wrangler.jsonc`, `open-next.config.ts`, and `.open-next` is in `.gitignore`.

## What changed in the code for Cloudflare
- **Next.js 14 -> 15.** The current Cloudflare adapter needs Next.js 15.5.28 or newer, so the code was migrated: page `params` / `searchParams` are now awaited, and the Supabase server client is async. Run `npm install next@15 eslint-config-next@15` (step 1).
- `sharp` (image resizing) does not run on Cloudflare Workers, so uploads are no longer resized.
  Images are checked (JPEG/PNG/WebP, max 5 MB) and saved as they are. Tell the admin to upload photos under about 1 MB for a fast shop.
- Payment-proof bucket now also accepts JPEG/PNG. If your `payment-proofs` bucket already exists, open Supabase > Storage > payment-proofs > Edit bucket and allow `image/jpeg, image/png, image/webp`.

## Steps
1. **Update packages on your PC** (this also updates package-lock.json, which Cloudflare needs). In the project folder:

       npm install next@15 eslint-config-next@15
       npm install -D @opennextjs/cloudflare wrangler

   Then run `npm run build` once. It must succeed.
2. **Push to GitHub** (GitHub Desktop: Commit, then Push origin). Commit `package.json` AND `package-lock.json`.
3. **Cloudflare dashboard > Workers & Pages > Create application > Import a repository** (the Workers/Git option, not the "Pages" tab). Pick `Cloudy-Toy` > Next.
4. Settings:
   - Worker name: `cloudy-toy` (must be exactly the same as `name` in wrangler.jsonc)
   - Leave "Build output directory" alone: it does not exist for Workers. If you see it, you are on the old Pages screen; go back.
   - Production branch: `main`
   - Root directory / Path: **leave EMPTY**. Never type the repository name there.
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
5. **Variables.** Add each of these as **Build variables** AND as runtime **Variables and secrets** (use "Secret" type for keys):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`, and optional `NEXT_PUBLIC_TELEGRAM_URL`.
6. Click **Save and Deploy**. Your site is at `https://cloudy-toy.YOUR-SUBDOMAIN.workers.dev`.
7. Put that address in `NEXT_PUBLIC_SITE_URL`, in Supabase (Authentication > URL Configuration: Site URL + Redirect URLs `https://ADDRESS/**`), and in Google Cloud (Authorized JavaScript origins). Then redeploy.
8. Custom domain: Worker > Settings > Domains & Routes > Add > Custom domain.

## If the build fails
Open Worker > Deployments/Builds > the failed build > copy the last red lines and send them.
Common causes: package-lock.json not updated (step 1), missing build variables (step 5), Next.js version too old for the adapter (step 1).

## Notes
- Cloudflare's free Workers plan has CPU/size limits. A Next.js app is large; if deploy says the Worker is too big (over 3 MB compressed on Free), use the Workers Paid plan (about $5/month).
