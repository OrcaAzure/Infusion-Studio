# Samsung QA Testing — Infusion Studio Mobile App

Send this guide to your QA tester on Samsung.

---

## Quick start (recommended — install as app)

### What you need
- Samsung phone (Android)
- **Chrome** or **Samsung Internet** browser
- The **HTTPS link** your developer sends you (required for install)

### Install steps (Samsung)

1. Open the link in **Chrome** or **Samsung Internet**
2. Wait for the app to load
3. Install using **one** of these:
   - Tap the **"Install Infusion Studio"** banner at the bottom, **or**
   - Menu **⋮** → **Install app** / **Add to Home screen**
4. Confirm — **Infusion Studio** icon appears on home screen
5. Open from home screen (full-screen app, no browser bar)

### Login
- **Email:** `trial@trial.com`
- **Password:** `trial123`
- Or tap **Quick enter as trial user** on the login page

### In-app QA checklist
Open **QA / Install** in the sidebar for the full test list.

| Area | What to check |
|------|----------------|
| Dashboard | Stats, charts load |
| Ingredients | List, search, detail, pairings |
| Blend Creator | Drag ingredients, save blend |
| Oven Infusion | Shared recipe feed |
| Timer | Start/pause/reset |
| Dark mode | Toggle in sidebar |
| Install | App opens from home screen |

---

## For the developer — share with QA today

### Option A: Public URL (best)

**1. Deploy to Vercel**
```bash
npm install -g vercel
vercel
```
Set environment variables in Vercel dashboard:
- `DATABASE_URL` = `file:./dev.db` (include `prisma/dev.db` in repo for QA) **or** use PostgreSQL
- `AUTH_SECRET` = any random 32+ char string
- `AUTH_URL` = your Vercel URL (e.g. `https://infusion-studio.vercel.app`)
- `SKIP_AUTH` = `true` (optional, lets QA browse without login)

**2. Send QA tester:**
- Your Vercel URL
- Link to `/qa` for install instructions: `https://YOUR-URL.vercel.app/qa`

### Option B: Tunnel (instant, no deploy)

**1. Start the app locally**
```bash
npm run db:seed
npm run build
npm start
```

**2. In another terminal, create a public HTTPS tunnel**
```bash
npm run qa:tunnel
```
Copy the `https://....loca.lt` or ngrok URL.

**3. Update `.env`**
```
AUTH_URL=https://YOUR-TUNNEL-URL
```
Restart `npm start`.

**4. Send QA the tunnel URL** — they install from Samsung browser.

> Note: Tunnels expire when you close the terminal.

### Option C: Android APK (Samsung sideload)

Requires **Android Studio** + JDK 17 on your machine.

**1. Deploy or tunnel first** — APK loads your live URL.

**2. Set server URL and build**
```bash
# Windows PowerShell
$env:CAPACITOR_SERVER_URL="https://YOUR-PUBLIC-URL"
npm run android:build
```

**3. APK location**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**4. Send APK to QA** — she installs via:
- Settings → Security → Install unknown apps → allow Files/Chrome
- Open APK → Install

---

## Troubleshooting (Samsung)

| Issue | Fix |
|-------|-----|
| No "Install app" option | Must use HTTPS; try Chrome |
| Login fails | Check AUTH_URL matches the URL she's using |
| Blank screen in APK | Rebuild APK with correct CAPACITOR_SERVER_URL |
| Page won't load | Server must be running / deployed |

---

## Support
QA page in app: `/qa`
