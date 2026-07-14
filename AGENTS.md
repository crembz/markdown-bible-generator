# AGENTS.md — Bible Markdown Generator

## Commands (all in `electron/`)

```bash
npm install
npx tsc                          # build main process (TypeScript → dist/)
node scripts/copy-renderer.js   # copy renderer to dist/renderer/
npx electron .                   # dev run
npm run package                  # build executables → dist/
```

Dev shortcut: `npm run dev` = `tsc && copy-renderer && electron .`

## Architecture

- **TypeScript only in main process.** Renderer is plain HTML/CSS/JS — not compiled.
- `tsconfig.json` includes only `src/main/**/*`. Renderer files are untouched by tsc.
- Build output: `electron/dist/main/` (compiled JS) + `electron/dist/renderer/` (copied HTML/CSS/JS).
- App entry: `dist/main/main.js` (per `main` field in package.json).

## Build artifacts (gitignored)

`dist/`, `electron/dist/`, `out/`, `*.exe`, `*.dmg`, `*.AppImage`, `*.tgz`, `*.js.map`, `.tsbuildinfo`

## Key files

| File | Purpose |
|------|---------|
| `electron/src/main/main.ts` | Electron entry, window setup, IPC registration |
| `electron/src/main/api/client.ts` | BollsClient — fetches languages.json from bolls.life |
| `electron/src/main/api/downloader.ts` | Downloader — fetches translation JSON |
| `electron/src/main/processor.ts` | `html_to_markdown()` via cheerio |
| `electron/src/main/formatter.ts` | `format_bible()` — single/book/chapter/verse output |
| `electron/src/main/file-writer.ts` | `write_output()` — fs/promises file writing |
| `electron/src/main/books.ts` | BOOK_NAMES dict (hardcoded 1–88) |
| `electron/src/main/preload.ts` | contextBridge for renderer IPC |
| `electron/src/renderer/` | UI: index.html, styles.css, script.js |
| `electron/scripts/copy-renderer.js` | Copies renderer → dist/renderer/ |

## API

- Translations list: `https://bolls.life/static/bolls/app/views/languages.json`
- Translation data: `https://bolls.life/static/translations/{slug}.json`
- Book names are **hardcoded** in `books.ts`, not fetched from API.
- Book IDs: 1–66 Protestant canon, 67–88 apocrypha/deuterocanonical.

## IPC channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `translations:fetch` | renderer → main | Fetch available translations |
| `translations:response` | main → renderer | Emit translations list |
| `bible:download` | renderer → main | Start download |
| `bible:progress` | main → renderer | Progress updates |
| `bible:complete` | main → renderer | Result (file paths or error) |
| `file:save` | renderer → main | Save output to disk |
| `dialog:showSaveFolder` | renderer → main | Open folder picker |

## Output formats

| Format | Example |
|--------|---------|
| single | `{translation}.md` (e.g. `kjv.md`) |
| book | `Genesis.md` |
| chapter | `Genesis/01_Genesis.md` |
| verse | `Genesis/01/01_Genesis_1_1.md` |
