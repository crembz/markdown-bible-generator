# Changelog

## [v1.0.0] — 2026-07-14

Initial release.

### Features
- Download Bible translations from bolls.life (KJV, ESV, NKJV, etc.)
- Convert HTML text to markdown
- Output formats: single file, per-book, per-chapter, per-verse
- Cross-platform builds (Windows .exe, macOS .dmg, Linux .AppImage)
- Desktop UI with translation picker, progress tracking, and folder selection

### Technical
- Electron desktop app with TypeScript main process
- cheerio for HTML stripping, custom formatter for markdown output
- Book names hardcoded (1–66 Protestant canon, 67–88 apocrypha/deuterocanonical)
- Full translation download (no per-book filtering)
