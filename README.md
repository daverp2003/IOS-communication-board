# 💬 SymboSay — AAC Communication Board

A premium AAC (Augmentative and Alternative Communication) board built with React.

## Project Structure

```
src/
  data/
    symbols.js       ← All 280+ symbols across 11 categories
    categories.js    ← Category definitions & colours
    voices.js        ← Voice profiles, grid sizes, board colours
  hooks/
    useTTS.js        ← Text-to-speech logic
    useSettings.js   ← Settings state + localStorage persistence
    useBoards.js     ← Board management + localStorage persistence
  components/
    Board.jsx        ← Main communication board
    Builder.jsx      ← Drag & drop board builder
    MyBoards.jsx     ← Saved boards management
    Settings.jsx     ← App settings panel
    NavBar.jsx       ← Bottom navigation
    CategoryBar.jsx  ← Category selector
    MessageBar.jsx   ← Message builder bar
    SymbolTile.jsx   ← Individual symbol tile
  styles/
    theme.js         ← Light / Dark / High Contrast themes
  App.jsx            ← Root component
  index.js           ← Entry point
```

## Getting Started

```bash
npm install
npm start
```

## Deploy to iPad

```bash
npm run build
```

Drag `build/` to [netlify.com](https://netlify.com), then on iPad:  
Safari → open URL → Share → Add to Home Screen

## What's Persistent

- ✅ Settings (theme, voice, tile size) — saved to localStorage
- ✅ Custom boards — saved to localStorage
