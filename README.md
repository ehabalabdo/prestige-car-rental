<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Dc6rPCRTi-J8Rc4N4N10oK-_flUBUtJc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set environment variables in `.env.local` (create if missing):
   - `GEMINI_API_KEY=your_key` (if you use Gemini)
   - `VITE_FIREBASE_API_KEY=...`
   - `VITE_FIREBASE_AUTH_DOMAIN=...`
   - `VITE_FIREBASE_PROJECT_ID=...`
   - `VITE_FIREBASE_STORAGE_BUCKET=...`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
   - `VITE_FIREBASE_APP_ID=...`
3. Run the app:
   `npm run dev`

## Deploy (Public)

You can deploy this app as a static site (SPA) built with Vite. Ensure your production environment has the same `VITE_FIREBASE_*` variables configured.

### Vercel
- Install Vercel CLI: `npm i -g vercel`
- Login: `vercel login`
- Set env vars (repeat for each key): `vercel env add VITE_FIREBASE_API_KEY production`
- Deploy: `vercel` (first time) then `vercel --prod`

This repo includes `vercel.json` with `buildCommand: npm run build` and `outputDirectory: dist`.

### Netlify
- Install Netlify CLI: `npm i -g netlify-cli`
- Login: `netlify login`
- Init: `netlify init`
- Set env vars in Netlify dashboard (Site settings → Build & deploy → Environment).
- Deploy: `netlify deploy --prod`

This repo includes `netlify.toml` with `build` and `publish` settings.

### Firebase Hosting (optional)
- `npm i -g firebase-tools`
- `firebase login`
- `firebase init hosting` (select existing project)
- `npm run build`
- `firebase deploy`

## Environment

See [.env.example](.env.example) for the required Firebase variables. In production providers (Vercel/Netlify), add them exactly with the `VITE_` prefix so Vite exposes them at build time.
