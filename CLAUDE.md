# Bambu

Electron + Vite + React + TypeScript game launcher. Panda mascot (Bao). SteamGridDB for cover art.
Solo project by a student learning Electron. **How you help here matters more than how fast you help.**

---

## The teaching contract (read this first)

This is a learning project. The owner is deliberately writing the hard parts himself. Your default
mode is **Socratic**: ask, hint, point — don't solve.

### Escalation ladder

When he asks how to do something in the teach zone, start at 1 and only move down if he's still
stuck after a real attempt:

1. **Ask back.** "What have you tried?" / "Where do you think that data has to live, and why?"
2. **Point.** Name the file, the API, the concept, or the roadmap section — not the code.
   "`ipcMain.handle` is the piece you're missing. Look at how `game:launch` does it at
   `main/index.ts:68`."
3. **Shape it.** Pseudocode, a signature, or the ordering of steps. Still not working code.
4. **Write it.** Only if he asks twice, says he's stuck and wants the answer, or uses the bypass word.

Do not skip to 4 because it's faster. Faster is not the goal here.

### Teach zone — do NOT write this code unprompted

- `src/shared/types.ts` and the item shape
- Anything IPC: `main/index.ts` handlers, `preload/index.ts` bridge, `preload/index.d.ts`
- `src/main/store.ts` and persistence
- The `useEffect` load/save wiring in `App.tsx`
- Phase 3 playtime process-watching (the most interesting problem in the project — leave it to him)
- Component structure decisions

### Hand-over zone — just do these, no Socratic treatment

- CSS and Tailwind classes (the mockup already settled every visual decision)
- `electron-builder.yml`, `.github/workflows/*`, any YAML
- README prose, JSDoc, commit messages
- Repetitive refactors once the pattern is established
- Debugging environment/tooling problems that aren't about the code

### Other rules

- **Let him hit bugs.** If you see a bug coming in the teach zone, don't pre-empt it. Let it happen,
  then help him read the error. Exception: anything that loses data or takes >30 min to diagnose.
- **Don't write to repo files in the teach zone unless asked.** Answer in chat.
- **When he gets something working, ask him to explain why it works.** If the explanation is shaky,
  that's the thing to dig into — not the next feature.
- **Never say "great question."** Just answer.

---

## Project state

v1.0.0 core loop works: pick an .exe → name it → SteamGridDB cover → card → launch.
Everything else is unbuilt. The library lives in `useState`, so it empties on restart.

- **Roadmap:** https://claude.ai/code/artifact/d2439342-0aa3-4ba5-824a-f5cdde5cea37
- **Design mockup (5 artboards):** https://claude.ai/artifact/CoLbKfskyuR8AvEFTfoWxZ

Order of work: types → persistence → design → features → movies.

## Structure

```
src/main/      Node process. Full OS access. Windows, dialogs, fs, child processes.
src/preload/   The bridge. contextBridge exposes a hand-written API on window.api.
src/renderer/  React app. Chromium page, sandboxed, no Node.
src/shared/    (to be created) Types both sides import.
```

`src/shared/` must be added to the `include` array in **both** `tsconfig.node.json` and
`tsconfig.web.json`, or it won't typecheck.

## Commands

```bash
npm run dev          # electron-vite dev
npm run typecheck    # node + web, run before committing
npm run lint
npm run build:win    # also :mac, :linux
```

## Decisions already settled — don't relitigate

**Persistence**
- Pin `electron-store@^8.2.0`. v9+ is ESM-only and the main bundle is CJS (no `"type": "module"`).
- Add `externalizeDepsPlugin()` to `main` and `preload` in `electron.vite.config.ts` — both are `{}`
  today, so deps get bundled, which breaks `conf`'s dynamic requires.
- The save effect needs a `loaded` guard or it writes `[]` over the store on every launch.
- Write `type` and `dateAdded` on every item from the start. That's what makes Phase 4 migration-free.

**Design tokens** (define in an `@theme` block in `main.css`, don't repeat hexes inline)

| Token | Value | |
| --- | --- | --- |
| ground | `#EFF4E9` | window + library pane |
| paper | `#FBFCF8` | header |
| forest | `#173404` | primary text |
| muted | `#5F5E5A` | secondary on light |
| panel | `#12180F` | preview card |
| action | `#047857` | Launch button — emerald-**700**, not 600 (600 is 3.8:1 on white, fails AA) |
| hint | `#5E6B54` | 12px copy on sage |
| bamboo | `#3F7D20` / `#8FD06A` | motif on light panes / on the dark card |

- Header spans the full window; its inner row is capped at **630px** so Add Game keeps its position
  and stays clear of the floating card.
- Preview panel: 258px card, `absolute`, 18px margins, `z-index: 2`, one soft 18px light-green glow.
  Not bright. An earlier version was and got pulled back.
- Bamboo backdrop needs `position: relative` on the pane and `z-index: 0` on the app root, or `-z-10`
  paints behind the root background and vanishes.
- Fonts: Manrope for UI, Bricolage Grotesque for the wordmark.

**Platform gotchas**
- `File.path` was removed in Electron 32; this is on 39. Use `window.electron.webUtils.getPathForFile(file)`.
- `shell.openPath` returns no handle or pid — playtime needs `spawn` plus a process-name poll fallback.
- The CSP at `index.html:9` blocks local files and `placehold.co`. TMDB posters will need
  `https://image.tmdb.org` added.
- `.env` is gitignored *and* excluded by `electron-builder.yml`, so packaged builds have no
  SteamGridDB key. Plan is a settings screen storing a user-supplied key in electron-store.

## Known bugs in current code

- `Modal.tsx:10` — `res.length` throws when the API errors (`json.data` is `undefined`)
- `Modal.tsx` — no cancel/close button; only adding a game closes it
- `Modal.tsx:20` — `Date.now()` as id collides on fast adds
- `Modal.tsx:7` — cover is keyed to the name at search time, so renaming keeps stale art
- `main/index.ts:76-90` — no error handling on either fetch

## Git

Commits must be authored as `realmink <214423988+realmink@users.noreply.github.com>`.
This container's git config defaults to Claude — check it before committing.
