# Bible Markdown Generator

Desktop app that downloads Bible translations from [bolls.life](https://bolls.life) and generates markdown output.

![Electron](https://img.shields.io/badge/Electron-280000?style=for-the-badge&logo=electron&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## Quick Start

```bash
cd electron
npm install
npx tsc
node -e "const fs=require('fs'),path=require('path');fs.readdirSync('src/renderer').forEach(f=>fs.copyFileSync('src/renderer/'+f,'dist/renderer/'+f))"
npx electron .
```

## Build Executable

```bash
cd electron
npm install
npx tsc
node -e "const fs=require('fs'),path=require('path');fs.readdirSync('src/renderer').forEach(f=>fs.copyFileSync('src/renderer/'+f,'dist/renderer/'+f))"
npm run package
```

Output: `dist/Markdown Bible Generator Setup 1.0.0.exe` (Windows NSIS installer).

## Key Architecture

```
electron/
  src/
    main/
      main.ts              → Electron app entry, BrowserWindow setup, IPC registration
      api/
        client.ts            → BollsClient (https.get, fetches languages.json)
        downloader.ts        → Downloader (fetches translation JSON)
      processor.ts           → html_to_markdown() (cheerio strips tags, decodes entities)
      formatter.ts           → format_bible() (single/book/chapter/verse output)
      file-writer.ts         → write_output() (writes files to disk via fs/promises)
      books.ts               → BOOK_NAMES dict (hardcoded 1-88, ported from Python)
      preload.ts             → contextBridge for renderer IPC
    renderer/
      index.html             → UI layout (dropdowns, progress, output)
      styles.css             → Styling (dark theme)
      script.js              → IPC handlers, state management, UI logic
  package.json
  tsconfig.json
  electron-builder.yml
```

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `translations:fetch` | renderer → main | Fetch available translations from bolls.life |
| `translations:response` | main → renderer | Emit translations list to UI |
| `bible:download` | renderer → main | Start download for selected translation (full) |
| `bible:progress` | main → renderer | Progress updates (percent, status) |
| `bible:complete` | main → renderer | Emit result (file paths or error) |
| `file:save` | renderer → main | Save output to disk (dialog + write) |
| `dialog:showSaveFolder` | renderer → main | Open folder picker dialog |

## Output Formats

| Format | Example |
|--------|---------|
| single | `{translation}.md` (e.g., `kjv.md`) |
| book | `Genesis.md` |
| chapter | `Genesis/01_Genesis.md` |
| verse | `Genesis/01/01_Genesis_1_1.md` |

## API Notes

- Translations list: `https://bolls.life/static/bolls/app/views/languages.json`
  - Nested: `language → translations[] → {short_name, full_name, updated, dir}`
- Full download: `https://bolls.life/static/translations/{slug}.json`
  - Flat array: `{book, book_name, chapter, verse, text}` (text is HTML)
- Book names are **hardcoded** in `src/main/books.ts`, NOT from the API.
- Book IDs: 1-66 = Protestant canon, 67-88 = apocrypha/deuterocanonical (KJV has 89 books, ESV/NKJV have 66).
- All translations are downloaded in full (no per-book filtering).
- Single file output uses the translation slug as the filename (e.g., `kjv.md`, `esv.md`).

## Stack

- **Electron** (desktop shell)
- **TypeScript** (main process only)
- **Plain HTML/CSS** (UI — no React/Vue overhead)
- **JavaScript** (renderer — simple DOM manipulation)
- **Node.js built-ins** (`https`, `fs`, `path`) + **cheerio 1.0.0-rc.12** (HTML stripping in main process)
- **electron-builder** (packaging to .exe)
