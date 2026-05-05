# Electron Windows Installer TODO

## Phase 1: Dependencies & Config
- [x] 1. Update package.json: Add Electron deps (`electron@^32`, `electron-builder@^24`, `@electron-toolkit/preload`, `wait-on`, `concurrently`, `cross-env`), update scripts (`electron:dev`, `electron:build`, `dist`).
- [x] 2. Create electron-builder.json for NSIS Windows installer config.

## Phase 2: Electron Core
- [x] 3. Create electron/main.ts: Main process, BrowserWindow, dev/prod handling.
- [x] 4. Create electron/preload.ts: Context bridge for safe IPC (DB APIs).

## Phase 3: App Updates
- [x] 5. Update vite.config.ts for Electron builds.
- [ ] 6. Update index.html (Electron title/icon).
- [ ] 7. Adapt services/gemini.ts & supabase.ts for Electron env access via preload.

## Phase 4: Build & Test
- [x] 8. Run `npm install` (install new deps).
- [ ] 9. Test dev: `npm run electron:dev`.
- [ ] 10. Build installer: `npm run electron:build`.
- [ ] 11. Verify dist/ installer.exe.

**Next: Update vite.config.ts, index.html, services. Then test electron:dev.**
