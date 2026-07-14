# AGENTS.md

## Build & Run (electron/)

```bash
cd electron
npm install
npx tsc
node -e "const fs=require('fs'),path=require('path');fs.readdirSync('src/renderer').forEach(f=>fs.copyFileSync('src/renderer/'+f,'dist/renderer/'+f))"
npx electron .
```

Packaging: `npm run package` → `dist/Markdown Bible Generator Setup 1.0.0.exe`

## Gotchas

- **tsconfig**: `skipDefaultLibCheck: true` and `types: []` are required — omitting them causes `http-cache-semantics`/`ms` type errors.
- **Electron binary**: On Windows, `npm install` may not extract the Electron binary. If `electron.exe` is missing from `node_modules/electron/dist/`, manually download and extract from the Electron cache or run `node node_modules/electron/install.js`.
- **Renderer files** are plain HTML/CSS/JS — copied to `dist/renderer/` at build time, not bundled.
- **Windows only** — electron-builder targets NSIS (`win.target: nsis`).

## Architecture

- `src/main/` — TypeScript (Electron main process). Entry: `main.ts`
- `src/renderer/` — Plain HTML/CSS/JS (no framework). Entry: `index.html`
- IPC channels: `translations:fetch`, `bible:download`, `bible:progress`, `bible:complete`, `file:save`, `dialog:showSaveFolder`
- Bible data from `bolls.life` — full translation download, no per-book filtering
- Book names hardcoded in `src/main/books.ts` (1-88: Protestant + apocrypha)
- Single file output uses the translation slug as filename (e.g., `kjv.md`)
