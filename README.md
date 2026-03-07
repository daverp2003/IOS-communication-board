<<<<<<< HEAD
# 💬 SymboSay — AAC Communication Board

A premium AAC (Augmentative and Alternative Communication) board built with React.
=======
# ✨ VoiceBoard Pro

A premium AAC (Augmentative and Alternative Communication) board for individuals who are unable to speak and require assistance communicating.

---

## Features

- 🎯 **240+ symbols** across 11 categories (Greetings, Feelings, Food, Drinks, Daily Living, Health, Leisure, School, Places, People, Needs)
- 🔍 **Live search** across all symbols
- 🔊 **Text-to-speech** with multiple voice profiles
- 📐 **Resizable icons** from XS to XXL (great for low vision / motor difficulties)
- ✏️ **Custom Board Builder** — drag & drop symbols onto a grid template
- 💾 **Save & load boards** — build boards for different situations
- 🎨 **3 themes** — Light, Dark, High Contrast
- 📱 **iPad-optimized** — installs as a full-screen PWA

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version)

### Installation

```bash
# Clone or unzip this project, then navigate into it
cd voiceboard

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

---

## Deploying to iPad (via Netlify)

```bash
# Build the production app
npm run build
```

Then drag the `build/` folder onto [netlify.com](https://netlify.com).  
Open the Netlify URL in **Safari on your iPad** → tap Share → **Add to Home Screen**.

See the full step-by-step guide in `VoiceBoard_iPad_Setup_Guide.docx`.

---
>>>>>>> 585a3f9eb3a482b74cd3fc42b87c873efeeab7a3

## Project Structure

```
<<<<<<< HEAD
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
=======
voiceboard/
├── public/
│   ├── index.html       # HTML entry point with PWA meta tags
│   └── manifest.json    # PWA manifest (controls home screen behavior)
├── src/
│   ├── App.js           # Main application (all components in one file)
│   └── index.js         # React entry point
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

---

## Customization

All symbols and categories are defined at the top of `src/App.js` in the `EMOJI_SYMBOLS` and `CATEGORIES` objects. You can:

- Add new symbols by adding entries to any category array
- Add a new category by adding to both `EMOJI_SYMBOLS` and `CATEGORIES`
- Each symbol needs: `id` (unique number), `label` (text), `emoji`, and `color` (hex)

---

## Built With

- [React 18](https://reactjs.org)
- Web Speech API (text-to-speech)
- HTML5 Drag and Drop API
- Progressive Web App (PWA) standards

---

## License

Built for personal and therapeutic use.
>>>>>>> 585a3f9eb3a482b74cd3fc42b87c873efeeab7a3
