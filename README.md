# Grammar Tower: Rising Lava Race
> **A Real-Time 3D Multiplayer Educational Game for Grammar Learning & Speed Typing**

![Grammar Tower Title](.playwright-cli/r3-title-multiplayer.png)

## 📌 Project Overview
**Grammar Tower: Rising Lava Race** is a 3D web-based educational game inspired by popular Roblox tower experiences like *Spelling Race* and *Type or Die*. Designed for academic grammar mastery, players type correct grammatical forms or select quick choices to stack procedural 3D Roblox stud blocks beneath their feet before boiling molten lava catches up from below.

---

## 🎮 Live Game URL
Play live right now directly in any browser (desktop, tablet, or mobile):
🔗 **[Live Game on Google Cloud Run](https://ais-pre-56nadha4qomho4jpxarh74-808969040858.asia-southeast1.run.app)**

---

## 🚀 Key Features

### 1. Real-Time Online Multiplayer
- **Authoritative Server (`server.ts`)**: Built with Node.js and WebSockets (`ws`), synchronizing lava elevation and player heights at 10Hz.
- **Matchmaking & Lobbies**: Players can join public rooms (e.g. `ARENA-1`) or create private room codes (`ROOM-4291`).
- **Live Competitor Towers**: Real racers ascend on adjacent 3D towers in the volcanic caldera.
- **In-Game Live Chat**: Send real-time quick reactions (`GG!`, `LAVA!`, `OOF!`, `NICE!`) to other racers.
- **Solo Mode**: Includes solo play against 4 AI competitor bots with distinct speeds and avatars.

### 2. Comprehensive Grammar Curriculum
Covers 8 core English grammar modules with instant pedagogical explanations:
1. **Subject-Verb Agreement** (collective nouns, indefinite pronouns, inverted structures)
2. **Verb Tenses & Irregular Verbs** (past participles, subjunctive *were*, *lie* vs. *lay*)
3. **Homophones & Word Choice** (*affect* vs. *effect*, *their/there/they're*, *its* vs. *it's*)
4. **Pronoun Cases** (prepositional objects like *between you and me*, *who* vs. *whom*)
5. **Comparatives & Superlatives** (comparing 2 vs. 3+, irregular forms)
6. **Irregular Plural Nouns** (Greek/Latin roots, vowel mutations, -f to -ves)
7. **Prepositions & Collocations** (*capable of*, *comply with*, *immune to*)
8. **Apostrophes & Contractions** (plural possessives, possessive pronouns)

### 3. Visual Craft & Procedural Audio
- **Roblox Aesthetics (Three.js)**: Procedural blocky avatars, classic cylinder studs on bricks, squash-and-stretch jump physics, floating volcanic embers, and molten lava shaders.
- **Procedural Web Audio Engine**: Zero-dependency synthesizer generating the classic Roblox **"OOF"** sound, block clack slams, combo streak chimes, and proximity lava rumbles.
- **Mastery Analytics Dashboard**: Post-game report with accuracy percentages per grammar category for academic evaluation.
- **In-Game Study Hub**: Interactive reference guide with definitions, key rules, and contrast examples.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Three.js, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, WebSockets (`ws`), Vite Middleware
- **Testing**: Node's built-in test runner (`node:test`, `node:assert/strict`)
- **Hosting**: Google Cloud Run (Containerized Full-Stack Web App)

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npx tsx --test src/game/rules.test.ts

# 3. Start development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Deployment & Publishing Options

1. **Google Cloud Run (Active)**: Already hosted and running live at the Cloud Run URL above.
2. **itch.io**: Package the client build as a WebGL/HTML5 browser game.
3. **Render / Railway / Fly.io**: Deploy the full-stack `server.ts` repository directly with free WebSocket support.
4. **Vercel / Netlify**: Deploy as a static/serverless web app.
