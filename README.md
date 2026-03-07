# 💬 SymboSay — AAC Communication Board

A premium AAC (Augmentative and Alternative Communication) board built with React for individuals who need assistance communicating.

---

## Features

- 🎯 **270+ symbols** across 11 categories (Greetings, Feelings, Food, Drinks, Daily Living, Health, Leisure, School, Places, People, Needs)
- 🔍 **Live search** across all symbols
- 🔊 **Text-to-speech** with multiple voice profiles
- 📐 **Resizable icons** from XS to XXL (great for low vision / motor difficulties)
- ✏️ **Custom Board Builder** — drag & drop symbols onto a grid template
- 💾 **Save & load boards** — build boards for different situations
- 🎨 **3 themes** — Light, Dark, High Contrast
- 👤 **Multiple profiles** — fully independent settings and boards per user
- 🔒 **Caregiver PIN lock** — protects Builder, My Boards and Settings
- ☁️ **Cloud sync** — push/pull boards and settings across devices via Supabase
- 📱 **iPad-optimized** — installs as a full-screen PWA

---

## Project Structure

```
src/
  constants/
    symbols.js        ← 270+ EMOJI_SYMBOLS and getAllSymbols()
    config.js         ← CATEGORIES, THEMES, GRID_SIZES, DEFAULT_BOARDS
  hooks/
    useSpeech.js      ← Web Speech API + iOS resume + Android polling
    useSettings.js    ← themeId + tileSize persistence per profile
    useBoards.js      ← Board CRUD + localStorage per profile
    usePIN.js         ← PIN set/check/lock with 10-min auto-lock
    useProfiles.js    ← Profile CRUD + active profile
    useSync.js        ← Supabase cloud sync — push/pull
    useCustomIcons.js ← Custom photo icons per profile
  components/
    BuilderView.jsx   ← Drag & drop board builder
    SettingsView.jsx  ← Settings tabs — Display, Voice, Theme, PIN, Sync
    MyBoardsView.jsx  ← Board library grid
    BoardCard.jsx     ← Board card — preview, open, edit, delete
    MessageBar.jsx    ← Message bar — speak/stop/backspace/clear
    SymbolTile.jsx    ← Tappable tile with scroll vs. tap detection
    PINLock.jsx       ← Full-screen animated PIN pad modal
    ProfilePicker.jsx ← Profile selection shown on launch
  styles/
    theme.js          ← Light / Dark / High Contrast themes
  App.jsx             ← Root — routing, profiles, speech, state wiring
  index.js            ← Entry point
```

---

## Getting Started

```bash
npm install
npm start
```

Opens at `http://localhost:3000`

---

## Deploy to iPad (via Vercel)

```bash
npm run build
```

Push to GitHub — Vercel auto-deploys within ~60 seconds.  
Open the Vercel URL in **Safari on your iPad** → tap Share → **Add to Home Screen**.

---

## What's Persistent

- ✅ Settings (theme, voice, tile size) — saved to localStorage per profile
- ✅ Custom boards — saved to localStorage per profile
- ✅ Cloud sync — boards and settings pushed/pulled via Supabase
