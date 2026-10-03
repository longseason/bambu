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

**The roadmap below is reference, not a script to execute.** It says what to build and why. Do not
start implementing a phase because it is written down here — wait to be asked, and then apply the
ladder. Code blocks in it are there so he can check his own work, not for you to paste in.

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

Order of work: **types → persistence → design → features → movies.**

Design mockup, five artboards at the real 900x670 window size (may not open from a local session —
the CSS values below are taken from it): https://claude.ai/artifact/CoLbKfskyuR8AvEFTfoWxZ

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

---

# Roadmap

## Phase 0 — one item shape (10 min)

Everything downstream types off a single item shape. Doing this first stops Phase 1 being written
against untyped state and then redone in Phase 2.

New `src/shared/types.ts`:

```typescript
export type ItemType = 'game' | 'movie'

export interface LibraryItem {
  id: string
  name: string
  cover: string
  exePath: string
  type: ItemType
  dateAdded: string          // ISO
  playtimeSeconds: number
  lastPlayed: string | null  // ISO
  favorite?: boolean
  collections?: string[]
}
```

1. Write the file; add `src/shared/**/*` to both tsconfig `include` arrays.
2. `App.tsx:6-7` — `useState([])` infers `never[]`, `useState(null)` infers `null`. Type both.
3. Add prop interfaces to all four components; props are implicitly `any` today
   (`GameCard.tsx:1`, `LibraryPanel.tsx:6`, `Modal.tsx:3`, `PreviewPanel.tsx:1`).
4. `LibraryPanel.tsx:41` spreads `{...game}` into `GameCard`, passing stray props. Use `item={game}`.
5. `Modal.tsx:20` — `Date.now()` as id → `crypto.randomUUID()`.

Delete while here (nothing imports them): `components/Versions.tsx`, `assets/base.css`,
`assets/electron.svg`, `assets/wavy-lines.svg`, the `ipcMain.on('ping')` at `main/index.ts:66`.
Change `index.html:4` from `<title>Electron</title>` to `Bambu`.

## Phase 1 — persistence (20–30 min)

The library survives a restart. Write `type` and `dateAdded` on every item now — that is what makes
Phase 4 migration-free.

**The dependency has a trap.** Pin `electron-store@^8.2.0`; v9+ is ESM-only and the main bundle is
CJS. Add `externalizeDepsPlugin()` to the `main` and `preload` blocks in `electron.vite.config.ts` —
both are `{}` today, so deps get bundled, which breaks `conf`'s dynamic requires.

New `src/main/store.ts` owns all disk access and exports `loadItems()` / `saveItems()`. A
`normalizeItem` on load backfills `type`, `playtimeSeconds`, `lastPlayed` and `dateAdded`, so later
phases need no migration. `saveItems` must reject a non-array — that payload crosses from the
renderer and is untrusted.

1. Register `library:load` and `library:save` with `ipcMain.handle` in `main/index.ts` (~line 67).
2. Add `loadLibrary` / `saveLibrary` to the preload API (`preload/index.ts:5-11`).
3. Declare both in `preload/index.d.ts:6-11`. Replace the `Promise<any>` on `searchGame` and
   `getArtwork` with real types while there.
4. Wire the two effects in `App.tsx` (below).
5. `Modal.tsx:20` — add `type`, `dateAdded`, `playtimeSeconds`, `lastPlayed` to the new item.
6. Pass `mainWindow` as parent in `handleFileOpen` (`main/index.ts:10`) so the dialog is modal.

The full path for a load — two processes, one `await`:

```
App.tsx          window.api.loadLibrary()
preload          ipcRenderer.invoke('library:load')
   ═══ process boundary ═══
main/index.ts    ipcMain.handle('library:load', ...)
main/store.ts    store.get('items')
disk             %APPDATA%/bambu/library.json
```

**The save effect needs a guard or it wipes the store on every launch:**

```typescript
const [loaded, setLoaded] = useState(false)

useEffect(() => {
  window.api.loadLibrary().then((items) => { setItems(items); setLoaded(true) })
}, [])

useEffect(() => {
  if (loaded) window.api.saveLibrary(items)
}, [items, loaded])
```

Without `loaded`, effect 2 fires on mount with the initial `[]` and overwrites what effect 1 is
still fetching.

## Phase 2 — the design pass (45–60 min)

The real work is a component restructure; the CSS is the easy half.

```jsx
<div className="h-screen relative z-0 flex flex-col bg-ground">
  <Header ... />                 {/* full window width */}
  <div className="flex flex-1 min-h-0">
    <LibraryPanel ... />         {/* unchanged 70% */}
  </div>
  <PreviewPanel ... />           {/* absolutely positioned card */}
</div>
```

1. **New `components/Header.tsx`** — logo, search, sort, Add Game. Inner row capped at `w-[630px]`.
2. **Lift state from `LibraryPanel` to `App`.** `isModalOpen`, `gamePath` and `handleAddGame`
   (`LibraryPanel.tsx:8-19`) move up, since the header now triggers the modal. This is the real
   refactor in this phase.
3. **Rewrite `PreviewPanel.tsx:10-11`** from `flex-1` to the floating card:
   `absolute top-[18px] right-[18px] w-[258px] bottom-[18px] z-20 rounded-[20px] bg-panel
   overflow-hidden p-[18px] flex flex-col`, with
   `box-shadow: 0 0 0 1px rgba(169,214,142,0.20), 0 16px 34px -14px rgba(0,0,0,0.50), 0 0 18px rgba(141,190,110,0.16)`.
4. **Fix the empty panel state.** `PreviewPanel.tsx:2-4` returns `<div className="flex-1" />`, and
   `flex-1` is meaningless once absolute. Render the Bao empty state: Bao at 96px, a heading, one
   tongue-in-cheek line, muted bamboo at the bottom. No disabled Launch button, no dash-filled rows.
5. **Panel contents:** cover 168x252 centred, title 17px/700, Launch button, three label/value rows
   (Playtime, Date added, Last played) split by 1px `#1F2A1D` rules, icon buttons pinned `mt-auto`.
6. **Define the tokens** in an `@theme` block in `main.css` (currently one `@import` line).
7. **New `lib/format.ts`** — `formatPlaytime(seconds)`, `formatDate(iso)`, both returning an em dash
   for null so pre-Phase-1 items still render.
8. **Search folds in here:** `query` state in `App`, case-insensitive filter on name.
9. `EmptyLibrary.tsx` copy is wrong for zero search results. Add a second empty state.
10. **New `components/BambooBackdrop.tsx`** — stalks, node bands and leaves as one inline SVG,
    `aria-hidden`, `pointer-events-none`, `absolute inset-0 -z-10`. Keep stalks in the grid gutters
    and the bottom band so no cover lands on one.

## Phase 3 — features

| Feature | Est | Version |
| --- | --- | --- |
| Playtime + last played | 45–60 min | 1.1.0 |
| Sort: recent / alphabetical / most played | 15 min | 1.2.0 |
| Drag and drop an .exe | 20 min | 1.3.0 |
| Favorites / collections | 30–45 min | 1.4.0 |
| Edit game via PreviewPanel | 20–30 min | 1.4.0 |
| Remove from library | 20 min | 1.4.0 |
| Cover-art carousel in Add Game | 20–30 min | 1.4.0 |
| Packaging + GitHub release | 45 min | 1.5.0 |
| README with gif + architecture writeup | 30 min | — |
| Tests: add-game flow, name/art decoupling | 30–45 min | — |

**Playtime** is the hard one, and the most interesting problem in the project. `shell.openPath`
returns no handle and no pid, so switch to `child_process.spawn(exePath, { detached: true })` and
listen for `exit`. Add a poll fallback matching `basename(exePath)`, because launchers often exit
immediately and hand off to a child. Accumulate and stamp **in main, writing straight to the store** —
the renderer may be closed when the game exits. Hoist `mainWindow` out of `createWindow`
(`main/index.ts:21`) to module scope so you can `webContents.send`. Preload gets `onPlaytimeUpdate(cb)`
via `ipcRenderer.on`, returning an unsubscribe.

**Drag and drop:** `File.path` was removed in Electron 32 and this is on 39, so it is `undefined`.
Use `window.electron.webUtils.getPathForFile(file)`.

**Parked v1 items:** edit via PreviewPanel needs `updateItem(id, patch)` plus a `dialog:openImage`
handler, copying the chosen file into `app.getPath('userData')/covers`. Remove is `removeItem(id)`
plus clearing the selection. The carousel just needs `Modal.tsx:13` to keep the whole array instead
of `artwork[0].thumb` — `getArtwork` already returns all of it.

**Tests:** nothing is installed. Add `vitest`, `@testing-library/react`, `jsdom`, a separate
`vitest.config.ts` (the `renderer` block in `electron.vite.config.ts` won't be picked up), and a
setup file stubbing `window.api`. Two refactors make it testable: extract `createLibraryItem()` into
`src/shared/library.ts` so Modal takes `onAdd(item)`, and split `searchedName`/`sgdbId` from the
display `name` — that is also the fix for the stale-art bug below.

## Phase 4 — movies (45 min – 1.5 hrs)

With `type` written since Phase 1, this is additive.

1. Rename `games`/`selectedGame` to `items` across the four components.
2. **New `components/SideMenu.tsx`** — 56px icon rail, Games / Movies / Settings. `section` state in
   `App`, filter on `item.type` before search and sort.
3. Parameterize the picker: `main/index.ts:10-13` hardcodes `['exe','app']` → take a `kind` argument,
   with `mp4 mkv avi mov webm` for movies.
4. Keep `shell.openPath` for movies so the OS default player opens.
5. Hide the playtime row for movies; skip tracking in main.

With the rail, the library pane narrows to 574px and the header's inner row stays at 630px, so Add
Game still doesn't move. Artwork needs TMDB (`https://image.tmdb.org` must be added to the CSP).

---

## Decisions already settled — don't relitigate

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
- Bamboo: 9% on light panes, 11% in the empty library, 5.5% light green on the dark card. Needs
  `position: relative` on the pane and `z-index: 0` on the app root, or `-z-10` paints behind the
  root background and vanishes.
- Fonts: Manrope for UI, Bricolage Grotesque for the wordmark.

**Platform gotchas**
- `File.path` removed in Electron 32; this is on 39. Use `webUtils.getPathForFile(file)`.
- `shell.openPath` returns no handle or pid — playtime needs `spawn` plus a poll fallback.
- The CSP at `index.html:9` blocks local files and `placehold.co`.
- `.env` is gitignored *and* excluded by `electron-builder.yml`, so packaged builds have no
  SteamGridDB key. Plan is a settings screen storing a user-supplied key in electron-store.

## Known bugs in current code

- `Modal.tsx:10` — `res.length` throws when the API errors (`json.data` is `undefined`)
- `Modal.tsx` — no cancel/close button; only adding a game closes it
- `Modal.tsx:20` — `Date.now()` as id collides on fast adds
- `Modal.tsx:7` — cover is keyed to the name at search time, so renaming keeps stale art
- `main/index.ts:76-90` — no error handling on either fetch

## Release

Semver; current core loop is v1.0.0, each feature its own MINOR bump, v2.0 reserved for something
structurally different. Still on electron-vite template defaults:

| File | Current | Change to |
| --- | --- | --- |
| `electron-builder.yml` | `appId: com.electron.app` | `com.longseason.bambu` |
| `electron-builder.yml` | `publish: generic`, `example.com` | `provider: github`, longseason/bambu |
| `electron-builder.yml` | `maintainer: electronjs.org` | a real value |
| `electron-builder.yml` | `electronDownload.mirror: npmmirror.com` | **remove** — China mirror, slow elsewhere |
| `dev-app-update.yml` | `example.com` | the GitHub provider |
| `package.json` | template description/author/homepage | real values |

Plus `.github/workflows/release.yml`: on tag push, a win/mac/linux matrix running
`electron-builder --publish always` with `GH_TOKEN`.

## Not doing

- **On hold:** Steam library import (1–2 hrs, by far the most edge cases — `libraryfolders.vdf`,
  multiple drives, non-Steam shortcuts, protocol launches).
- **Cut:** keyboard nav, right-click menus, Bao idle reactions, hover animations.

## Git

Commits must be authored as `realmink <214423988+realmink@users.noreply.github.com>`.
This container's git config defaults to Claude — check it before committing.
