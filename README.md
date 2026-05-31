# The Block — Training App

A mobile-first web app for the 1 Jun – 17 Jul training block: 3 runs + 3 lifts a week,
golf on Saturdays, spine-safe (grade 2 L5-S1), with progress that saves on your phone.

Built with React + Vite. It's a PWA, so once it's live you can "Add to Home Screen"
and it behaves like a real app — full screen, own icon, no browser bars.

---

## Quick start (run it on your laptop first)

You need [Node.js](https://nodejs.org) (v18+). Then, in this folder:

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173) to see it.

---

## Putting it on your phone — the easy way (Vercel)

This is the simplest path. No command line needed after you've pushed to GitHub.

1. **Create a GitHub repo.** On github.com → New repository → name it `the-block` →
   Create. Then drag-and-drop *all the files in this folder* into the repo
   (the "uploading an existing file" link), or push with git if you prefer.
   Don't upload the `node_modules` folder — `.gitignore` already excludes it.
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub (free).
3. Click **Add New → Project**, pick your `the-block` repo, click **Import**.
4. Vercel auto-detects Vite — leave everything as-is and click **Deploy**.
5. After ~30 seconds you get a URL like `the-block.vercel.app`. Open it on your phone.
6. **iPhone:** Share button → *Add to Home Screen*.
   **Android:** menu (⋮) → *Add to Home screen / Install app*.

Done — tap the icon and it opens like an app. Every push to GitHub auto-redeploys.

> Netlify works exactly the same way if you prefer it ([netlify.com](https://netlify.com)).

---

## Alternative: GitHub Pages (free, no third party)

This project is already set up for it (`base: "./"` in `vite.config.js`).

```bash
npm install
npm run deploy
```

Then in your repo on GitHub: **Settings → Pages → Source: `gh-pages` branch**.
Your app will be at `https://<your-username>.github.io/the-block/`.

---

## What's in here

```
index.html              page shell + PWA meta tags
vite.config.js          build config (relative paths for any host)
package.json            dependencies + scripts
src/main.jsx            React entry point
src/App.jsx             the whole app (data + UI)
src/index.css           page background reset
public/manifest.webmanifest   PWA manifest
public/icon-*.png       home-screen icons
```

## Changing the program

Everything lives in `src/App.jsx`:
- **Exercises / sets / reps** — the `dayA`, `dayB`, `dayC` objects near the top.
- **Run durations** — the `easyRun`, `tempoRun`, `longRun` functions.
- **Dates** — `START`, `END`, and `COURSE_SATS` (the full-course Saturdays).
- **Colours / fonts** — the `CSS` string at the very bottom.

Save the file and, if running `npm run dev`, it reloads instantly.

## Notes

- Progress is stored in your browser's local storage — it stays on whatever device/browser
  you tick things off on, and isn't synced between devices.
- This is a training aid, not medical advice. With a grade 2 slip, get the leg press and any
  deadlift variation form-checked by a physio before loading them hard.
