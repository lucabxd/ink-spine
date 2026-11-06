# Ink and Spine

A single-file React ebook reader (library, admin, Supabase backend, fanart gallery, read-aloud
audio player, and a Google Play Books–style fullscreen reading mode).

## Structure

- `src/index.html` — the entire app (markup, styles and React code in one file). The Supabase
  URL and anon key are **not** in this file — they're placeholders (`__SUPABASE_URL__`,
  `__SUPABASE_ANON_KEY__`) filled in at build time by `build.js`.
- `src/_headers` — Netlify header rules, including the Content-Security-Policy. Netlify only
  applies these when they're deployed as a real HTTP header file; the CSP `<meta>` tag inside
  `index.html` is a fallback for other static hosts and can't enforce `frame-ancestors` on its own.
- `build.js` — a small Node script (no dependencies) that copies `src/` to `dist/`, injecting the
  real Supabase credentials from environment variables into `dist/index.html`. This is what keeps
  the credentials out of git.
- `dist/` — build output. Not committed (see `.gitignore`); Netlify (or you, locally) regenerates
  it on every build.

## Environment variables

Two are required, both from your Supabase project's **Settings → API** page:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` `public` key |

**On Netlify:** Site settings → Environment variables → add both, then trigger a deploy (or just
push a commit). Netlify runs `node build.js` automatically per `netlify.toml`.

**Locally:**

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
node build.js
npx serve dist
```

Opening `src/index.html` directly in a browser will *not* work — it still has the unfilled
placeholders. Always build first.

## Deploying

Connect this repo in the Netlify dashboard (**Add new site → Import an existing project**). The
build command (`node build.js`) and publish directory (`dist`) are already set in `netlify.toml`,
so once the two environment variables above are added, it deploys automatically on every push to
`main`.

## Notes

- The anon key is still visible to anyone who views the page source on the live site — that's
  normal for a client-side Supabase key, which is designed to be public and is constrained by your
  Row Level Security policies, not by secrecy. Keeping it out of git just means it isn't sitting in
  your commit history or visible to anyone who can read the repo but shouldn't see production
  config.
- The **local voice (Kokoro)** option expects a Kokoro-FastAPI server running on the reader's own
  machine at `http://localhost:8880`.
