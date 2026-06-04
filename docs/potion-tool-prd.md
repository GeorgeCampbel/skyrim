# PRD: Skyrim Reference Site — Potion Tool (v1)

## 1. Overview

A personal-use web reference site for Skyrim (Special Edition + all DLC). The goal is fast, friction-free access to tools that the existing wikis make unnecessarily hard to use. The site starts with a potion/alchemy tool and is designed to grow into additional tools over time.

---

## 2. Site Structure

### Homepage
- Minimal content — acts as a navigation hub to tools only
- Cards or large buttons for each tool (Potion Mixer, future tools)
- No hero text, no lore fluff, no search landing

### Tools (v1)
- **Potion Mixer** — the focus of this PRD

### Planned future tools (not in scope for v1)
- Enchanting calculator (soul gem + skill + perks → enchantment strength)
- Perk planner / build planner
- Item value / weight calculator

---

## 3. Potion Mixer Tool

### 3.1 Core Concept

Skyrim alchemy works as follows:
- Every ingredient has exactly **4 effects**
- You combine **2 or 3 ingredients** at an alchemy table
- A potion gains an effect only if **at least 2 of the chosen ingredients share that effect**
- More ingredient overlap = more effects on the resulting potion

### 3.2 Two Entry Modes

**Mode A — "I have these ingredients"**
- User selects ingredients they have on hand (multi-select, searchable)
- App shows all valid potions that can be brewed from any 2–3 of the selected ingredients
- Results list each combination with the effects it would produce
- Sort options: by number of effects, by estimated value (if skill/perks are set), alphabetically

**Mode B — "I want this effect"**
- User selects one or more desired effects from a list
- App shows all ingredient combinations that would produce those effects together
- User can add multiple target effects and see combinations that satisfy all of them

Both modes should be accessible from the same page — a toggle or tab at the top, not separate routes.

---

### 3.3 Data Model

#### Ingredient
```
{
  id: string,
  name: string,
  effects: [effectId, effectId, effectId, effectId],  // ordered, first = most potent
  source: "base" | "dawnguard" | "dragonborn" | "hearthfire",
  isPlantable: boolean,       // can be grown in Hearthfire farm plots
  locations: string[]         // general location hints (optional, v1)
}
```

#### Effect
```
{
  id: string,
  name: string,
  type: "beneficial" | "harmful",
  category: "restore" | "fortify" | "resist" | "damage" | "other"
}
```

#### Potion Result (computed, not stored)
```
{
  ingredients: Ingredient[],   // 2 or 3
  effects: Effect[],           // only shared effects
  estimatedValue: number | null
}
```

**Data source:** Manually curated JSON files in `/src/data/`. Skyrim ingredient data is stable and complete — no backend required. There are ~100 base game ingredients + ~30 DLC ingredients.

---

### 3.4 Filters & Display Options

**Filter panel (persistent sidebar or collapsible)**

| Filter | Description |
|--------|-------------|
| DLC source | Checkboxes: Base Game, Dawnguard, Dragonborn, Hearthfire. Off = hide that ingredient from results |
| Plantable only | Toggle: show only ingredients growable in Hearthfire farm plots |
| Effect type | Show only beneficial / harmful / both |
| Hide negative effects | Hide results that include any harmful effect (overridden by Purity perk) |

---

### 3.5 Alchemy Perks

Optional perk panel the user can configure once and persist via localStorage. Applied perks modify how results are displayed (primarily value estimation and effect filtering).

**Perks to support:**

| Perk | Ranks | Effect on tool |
|------|-------|----------------|
| Alchemist | 5 | Multiplies estimated potion value (20/40/60/80/100% bonus) |
| Physician | 1 | +25% strength to potions that restore Health, Magicka, or Stamina |
| Benefactor | 1 | +25% strength to potions with only beneficial effects |
| Poisoner | 1 | +25% strength to poisons with only harmful effects |
| Purity | 1 | Removes all negative effects from potions; removes all positive effects from poisons. When enabled: negative effects are stripped from potion results and do not count toward value |
| Green Thumb | 1 | Display note only: "You gather 2x ingredients from plants" |
| Concentrated Poison | 1 | Display note only: "Your poisons last twice as long on weapons" |

Perks are saved to localStorage so they persist between sessions without needing an account.

---

### 3.6 Potion Value Estimation

When alchemy skill level (1–100) and relevant perks are set, display an estimated gold value for each result. This uses the standard Skyrim formula:

```
Base value = sum of (effect base value × magnitude multiplier)
Final value = base value × (1 + 0.015 × skill) × perk multipliers
```

This is a guide value, not exact — display as "~450 gold" to set expectations. Skill level defaults to blank (no estimate shown) until the user sets it.

---

### 3.7 Suggested Additional Features

These are worth discussing before building:

1. **Shareable URLs** — Encode the current ingredient selection or effect filter into the URL query string so you can bookmark or share a specific query. No backend needed; pure URL state.

2. **"What's missing" mode** — Given a desired potion effect, show which single ingredient you'd need to add to your current selection to unlock that effect.

3. **Ingredient detail panel** — Click any ingredient to see all 4 effects, its source DLC, whether it's plantable, and a brief location hint (e.g. "common in The Rift, sold by apothecaries").

4. **Conflict highlighter** — When a potion would have both beneficial and harmful effects, visually flag it. Relevant for deciding whether to use Purity.

5. **Result export / shopping list** — A simple "copy to clipboard" of the recipe list, useful for noting what to farm.

6. **Alchemy skill input for leveling math** — Show how much XP a given potion grants toward the next skill level. Nice-to-have, not MVP.

---

## 4. Technical Architecture

### 4.1 Recommended Stack: React SPA (no backend)

All ingredient and effect data is static and will never change. A backend (Flask or otherwise) adds deployment complexity, cold-start latency, and cost for zero benefit at this stage.

**Recommended:** Vite + React (TypeScript), with all game data in versioned JSON files in `/src/data/`.

All potion logic (effect intersection, value estimation) lives in pure TypeScript utility functions — easy to test, no server needed.

**Why not Flask:**
- No dynamic data, no user accounts, no server-side computation needed
- Flask would require a separate hosting service; adds maintenance burden
- Re-evaluate if user accounts or community features are added later

### 4.2 Free Hosting via GitHub Pages

GitHub Pages hosts static sites for free from a repo's `gh-pages` branch or `/docs` folder. With Vite:

```
# Deploy command
npm run build          # outputs to /dist
# Push /dist to gh-pages branch via GitHub Actions
```

**Recommended CI/CD:** A single GitHub Actions workflow on push to `main` that runs `npm run build` and deploys to GitHub Pages. Zero cost, automated.

**URL:** Will be `https://georgecampbel.github.io/skyrim` (or a custom domain if desired — GitHub Pages supports free custom domains with HTTPS via Let's Encrypt).

**Limitations of GitHub Pages:**
- Static only (no server-side rendering, no API routes)
- 1GB soft storage limit — not a concern here
- 100GB/month bandwidth — not a concern for personal use

### 4.3 Alternative: If a Backend Becomes Needed

If user accounts, saved builds, or community recipes are added later:
- **Backend:** FastAPI (Python) on Render free tier (not Flask — FastAPI is faster and has better async support)
- **Database:** Supabase free tier (Postgres + auth)
- **Frontend:** Stays on GitHub Pages, calls the Render API
- **Caveat:** Render free tier spins down after 15 min of inactivity — ~30s cold start. Acceptable for personal use.

### 4.4 Folder Structure

```
/
├── src/
│   ├── data/
│   │   ├── ingredients.json
│   │   └── effects.json
│   ├── components/
│   │   ├── PotionMixer/
│   │   ├── IngredientPicker/
│   │   ├── EffectPicker/
│   │   ├── PerkPanel/
│   │   └── ResultList/
│   ├── lib/
│   │   ├── alchemy.ts       # potion calculation logic
│   │   └── value.ts         # gold value estimation
│   └── pages/
│       ├── Home.tsx
│       └── PotionMixer.tsx
├── docs/
│   └── potion-tool-prd.md
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 5. Open Questions — Decisions Needed Before Building

These need answers before starting development:

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | **Scope: which Skyrim version?** | Anniversary Edition adds ~70 CC ingredients on top of the 3 DLC | Start with base + 3 DLC. Add AE as a separate filter toggle later. |
| 2 | **Ingredient location data?** | Rough location hints vs. none vs. full spawn data | Rough hints only in v1 (e.g. "forests, sold by apothecaries") — full spawn data is a separate tool |
| 3 | **Mobile vs desktop priority?** | Mobile-first responsive vs. desktop-first | Desktop-first for v1 (alchemy is a PC/console task, likely used on a second screen), responsive down to tablet |
| 4 | **Theming** | Minimal/clean utility vs. Skyrim-styled (dark stone, rune fonts) | Lean into Skyrim aesthetic slightly — dark background, earthy tones — but keep UI clean enough to be fast |
| 5 | **Saved ingredient lists** | localStorage only vs. shareable URL vs. both | URL state for sharing + localStorage for "my ingredients" list |
| 6 | **Max combinations shown** | With 20 selected ingredients there are 1140 possible 3-ingredient combos — show all? paginate? | Cap display at top 50 by estimated value, with "show more" |
| 7 | **Custom domain?** | `georgecampbel.github.io/skyrim` vs. a custom domain | Fine to start with GitHub Pages default; easy to add a domain later |
| 8 | **Testing strategy** | No tests vs. unit tests for alchemy logic only vs. full test suite | Unit tests for `alchemy.ts` and `value.ts` — the combinatorics logic is worth testing; no UI tests needed for a personal tool |

---

## 6. MVP Scope (First Buildable Version)

To ship something useful quickly, the MVP is:

- [ ] Ingredient database (base game + 3 DLC) as JSON
- [ ] Mode A: select ingredients → see valid potions
- [ ] Mode B: select desired effects → see ingredient combinations
- [ ] DLC source filter
- [ ] Plantable filter
- [ ] Perk panel (Purity + Benefactor/Poisoner minimum)
- [ ] Homepage with navigation to Potion Mixer
- [ ] GitHub Pages deploy via GitHub Actions

**Out of scope for MVP:** value estimation, shareable URLs, ingredient detail panel, AE content, location hints.

---

## 7. Future Tools (Roadmap Ideas)

| Tool | Description |
|------|-------------|
| Enchanting Calculator | Select soul gem size + enchanting skill + perks → enchantment magnitude and value |
| Perk Planner | Visual perk tree, mark which perks you have, plan a build |
| Smithing Calculator | Material + skill + perks → armor/weapon stats |
| Merchant Restock Tracker | Note which merchants have been visited and when they restock |
| Build Saver | Save a named character build (race, perks, skills, gear) — requires backend |
