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
  source: "base" | "dawnguard" | "dragonborn" | "hearthfire" | "anniversary",
  isPlantable: boolean,       // can be grown in Hearthfire farm plots
  locationHints: string[]     // broad hints only — hold/region/vendor type, not spawn coords
}
```

**Note on Anniversary Edition content:** AE bundles ~26 Creation Club packs. The most alchemy-relevant is *Rare Curios*, which adds ~40 ingredients from Morrowind and Oblivion (Bonemeal, Saltrice, Marshmerrow, etc.). All AE ingredients share `source: "anniversary"` and are hidden unless the user enables AE in settings.

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

**Data source:** Manually curated JSON files in `/src/data/`. Skyrim ingredient data is stable and complete — no backend required. Approximate counts:
- Base game: ~100 ingredients
- Dawnguard: ~10
- Dragonborn: ~20
- Hearthfire: minor (mostly affects `isPlantable` flags on existing ingredients)
- Anniversary Edition (Rare Curios + others): ~40

**Location hint policy:** Only include hints where we are confident. Use broad descriptors only: hold names, vendor types (apothecary merchants), or environment types (tundra, swamps, caves). Do not include specific spawn coordinates. Omit location data entirely for ingredients where the right answer requires precision — a missing hint is better than a wrong one. This field is populated incrementally and may be empty for rare/AE ingredients in v1.

---

### 3.4 Filters & Settings

Filters live in two places:

**Settings modal** (gear icon, persisted to localStorage — set once, forget)
- Content flags: checkboxes for Dawnguard, Dragonborn, Hearthfire, Anniversary Edition. Base game always on.
- Alchemy skill level (numeric input, 1–100)
- Perk selections (see §3.5)
- Theme selector (see §4.3)

**Inline filter bar** (on the Potion Mixer page, always visible)
- Plantable only toggle — show only ingredients growable in Hearthfire farm plots
- Effect type — beneficial / harmful / both
- Hide mixed-effect results — hide potions that contain both beneficial and harmful effects (overridden by Purity perk)

The split keeps persistent preferences out of the main workflow without burying commonly-used filters in a modal.

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

### 4.3 CSS Framework: Mantine

**Decision: Mantine v7** (not Tailwind, not MUI, not Chakra).

Reasons:
- TypeScript-native — no extra type packages needed
- Theming is CSS-variable-based: defining multiple named themes (e.g. Nordic Dark, Parchment) is built into its design system, not a workaround
- Ships with light/dark mode toggle support out of the box
- Component library covers everything this project needs: Modal, MultiSelect, Checkbox, Switch, Slider, Tabs, Tooltip, Drawer — no reaching for additional libraries
- Mobile-responsive by default; components use a fluid grid system
- Does not impose a strong visual identity (unlike MUI/Google Material) — easy to restyle for Skyrim aesthetic
- No Tailwind dependency; uses CSS Modules internally

**Theming plan:** Three selectable themes, stored in localStorage:
| Theme | Description |
|-------|-------------|
| Nordic Dark | Dark slate grays, warm amber/gold accents — matches the vanilla Skyrim UI palette |
| Parchment | Warm cream/sepia tones, aged-paper aesthetic — high contrast light mode |
| System | Follows OS light/dark preference, using the Parchment and Nordic palettes respectively |

Theme toggle lives in the settings modal. Default is System.

### 4.4 Mobile-First Layout

**Decision: mobile-first, responsive up to desktop.**

Rationale: the site is most likely used on a phone next to a TV or console. On small screens:
- Mode toggle (ingredients / effects) is at the top as a full-width segmented control
- Filter bar collapses into a "Filters" button that opens a bottom sheet
- Results stack vertically as cards
- Settings modal becomes a full-screen bottom sheet

On tablet/desktop the layout expands: filter sidebar appears inline, results show in a grid.

### 4.5 Folder Structure

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
│   │   ├── ResultList/
│   │   └── SettingsModal/
│   ├── lib/
│   │   ├── alchemy.ts       # potion combination logic
│   │   └── value.ts         # gold value estimation
│   ├── theme/
│   │   └── themes.ts        # Mantine theme objects for each named theme
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

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | **DLC scope** | ✅ Decided | Base + Dawnguard + Dragonborn + Hearthfire always available. Anniversary Edition as an opt-in flag in settings modal. |
| 2 | **Location data** | ✅ Decided | Include broad hints (hold, environment, vendor type) where confident. Omit rather than guess. Added incrementally post-MVP. |
| 3 | **Mobile vs desktop** | ✅ Decided | Mobile-first. Responsive up to desktop. Filter bar collapses to bottom sheet on small screens. |
| 4 | **Theming** | ✅ Decided | Mantine with 3 named themes: Nordic Dark, Parchment, System. Selector in settings modal. |
| 5 | **CSS framework** | ✅ Decided | Mantine v7 — see §4.3. |
| 6 | **Saved ingredient lists** | Open | URL state for sharing + localStorage for "my ingredients" list — confirm? |
| 7 | **Max combinations shown** | Open | Propose: cap at top 50 sorted by estimated value (or effect count if no skill set), "show more" button for the rest. Confirm? |
| 8 | **Custom domain** | Open | Start with `georgecampbel.github.io/skyrim`. Easy to add a domain later. |
| 9 | **Testing strategy** | Open | Propose: Vitest unit tests for `alchemy.ts` and `value.ts` only — the combinatorics is the risky logic worth covering. No UI tests for a personal tool. Confirm? |

---

## 6. MVP Scope (First Buildable Version)

To ship something useful quickly, the MVP is:

- [ ] Ingredient + effect data files (base game + 3 DLC)
- [ ] Mode A: select ingredients → see valid potion combinations
- [ ] Mode B: select desired effects → see ingredient combinations
- [ ] Inline filter bar: plantable toggle, effect type, hide mixed results
- [ ] Settings modal: DLC content flags, perk selections, theme selector
- [ ] Mantine theme setup: Nordic Dark + Parchment + System
- [ ] Homepage with navigation cards
- [ ] GitHub Actions deploy to GitHub Pages

**Out of scope for MVP:** value estimation, shareable URLs, ingredient detail panel, AE content data, location hints, "what's missing" mode.

---

## 7. Future Tools (Roadmap Ideas)

| Tool | Description |
|------|-------------|
| Enchanting Calculator | Select soul gem size + enchanting skill + perks → enchantment magnitude and value |
| Perk Planner | Visual perk tree, mark which perks you have, plan a build |
| Smithing Calculator | Material + skill + perks → armor/weapon stats |
| Merchant Restock Tracker | Note which merchants have been visited and when they restock |
| Build Saver | Save a named character build (race, perks, skills, gear) — requires backend |
