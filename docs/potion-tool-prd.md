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
- Enchanting Calculator
- Trainer Finder
- Standing Stones Reference
- Shout / Word Wall Tracker
- Missable Content Checklist
- Skill Book Finder
- Character Generator

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

**Location data source:** Location hints are fetched from [UESP](https://en.uesp.net) (the most accurate Skyrim wiki) using its MediaWiki API, processed by a one-off Node.js script in `/scripts/fetch-locations.ts`, and committed into `ingredients.json`. This is a build-time data gathering step, not a runtime fetch. UESP content is licensed CC-BY-SA; we store only factual location descriptions, not wiki prose.

**Location hint policy:** Store broad descriptors only — hold names, environment types (tundra, cave, swamp), vendor types (apothecary, general goods). Do not store specific spawn coordinates. If the UESP data for an ingredient is ambiguous or sparse, leave `locationHints: []` — a blank field is better than a wrong one.

---

### 3.4 Filters & Settings

Filters live in two places:

**Settings modal** (gear icon, persisted to localStorage — set once, forget)
- Content flags: all DLC enabled by default (base game + Dawnguard + Dragonborn + Hearthfire + Anniversary Edition). User unchecks DLC they don't own. Base game cannot be disabled.
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

1. **Shareable URLs** — The potion tool's current selection is encoded as a clean route, not query params, so it can be bookmarked, shared, and indexed. E.g. `/potions/brew/blue-mountain-flower+wheat+lavender`. Static ingredient and effect pages (`/ingredients/[slug]`, `/effects/[slug]`) are pre-rendered at build time and fully indexable.

2. **"What's missing" mode** — Given a desired potion effect, show which single ingredient you'd need to add to your current selection to unlock that effect.

3. **Ingredient detail panel** — Click any ingredient to see all 4 effects, its source DLC, whether it's plantable, and a brief location hint (e.g. "common in The Rift, sold by apothecaries").

4. **Conflict highlighter** — When a potion would have both beneficial and harmful effects, visually flag it. Relevant for deciding whether to use Purity.

5. **Result export / shopping list** — A simple "copy to clipboard" of the recipe list, useful for noting what to farm.

6. **Alchemy skill input for leveling math** — Show how much XP a given potion grants toward the next skill level. Nice-to-have, not MVP.

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Decision |
|-------|----------|
| Framework | **Next.js** (App Router, `output: 'export'`) |
| Language | TypeScript |
| Styling | **Tailwind CSS v4** |
| Components | **shadcn/ui** (Radix UI primitives + Tailwind) |
| Testing | **Vitest** (logic only) |
| Hosting | **GitHub Pages** (free, via GitHub Actions) |

No backend. All data is static JSON. No API routes, no server-side rendering at runtime — Next.js runs at build time only.

---

### 4.2 Why Next.js over plain Vite

The key requirement is **Google-indexable pages** for each ingredient and effect. Next.js App Router with static export achieves this: ingredient and effect pages are pre-rendered to HTML at build time via `generateStaticParams()`, so crawlers see real content without executing JavaScript.

The potion tool itself (`/potions`) is a Client Component (`'use client'`) — fully interactive React, just not pre-rendered beyond the shell.

```ts
// next.config.ts
const nextConfig = {
  output: 'export',   // produces /out as pure static HTML/CSS/JS
  trailingSlash: true,
}
```

---

### 4.3 Styling: Tailwind + shadcn/ui

**Tailwind CSS v4** for all layout and utility styling.

**shadcn/ui** for interactive components (Modal/Dialog, Select, Checkbox, Switch, Tooltip, Sheet/Drawer). shadcn/ui components are copied into the repo as source files — no library lock-in, fully customisable with Tailwind classes.

**Theming** uses CSS custom properties defined in `globals.css`, toggled via a `data-theme` attribute on `<html>`. Three themes:

| Theme | Description |
|-------|-------------|
| Nordic Dark | Dark slate grays, warm amber/gold accents — matches vanilla Skyrim UI palette |
| Parchment | Warm cream/sepia tones, aged-paper aesthetic — high contrast light mode |
| System | Follows OS light/dark preference, maps to Nordic/Parchment respectively |

Active theme stored in localStorage. Selector in the settings modal.

---

### 4.4 Routing & Static Generation

```
/                               → Homepage (navigation hub)
/potions                        → Potion Mixer tool (interactive, client component)
/ingredients                    → Ingredient list (static)
/ingredients/[slug]             → Individual ingredient page (statically generated)
/effects                        → Effect list (static)
/effects/[slug]                 → Individual effect page (statically generated)
```

Ingredient and effect detail pages are generated from the JSON data files at build time. The potion tool URL can encode selections as a clean path segment for shareability, though dynamic combination paths are not pre-rendered (too many permutations).

---

### 4.5 Hosting: GitHub Pages

Next.js static export outputs to `/out`. A GitHub Actions workflow on push to `main` builds and deploys this folder to GitHub Pages.

```yaml
# .github/workflows/deploy.yml (outline)
- run: npm run build          # next build → /out
- uses: actions/deploy-pages  # deploys /out to GitHub Pages
```

**URL:** `https://georgecampbel.github.io/skyrim`
Custom domain can be added at any time — GitHub Pages supports it with free HTTPS via Let's Encrypt.

**Free tier limits** (not a concern for this project):
- 1GB repo size soft limit
- 100GB/month bandwidth

---

### 4.6 Mobile-First Layout

The site is most likely used on a phone as a second screen while playing. Layout decisions:

- On mobile: mode toggle is a full-width segmented control at the top; filter bar collapses to a "Filters" button opening a bottom sheet (shadcn/ui Sheet); results stack as cards
- On tablet/desktop: filter sidebar appears inline; results display in a grid

---

### 4.7 If a Backend Is Ever Needed

If user accounts, saved builds, or community recipes are added later:
- **Backend:** FastAPI on Render free tier
- **Database:** Supabase free tier (Postgres + auth)
- **Caveat:** Render free tier spins down after 15 min of inactivity (~30s cold start). Acceptable for personal use.

---

### 4.8 Folder Structure

```
/
├── app/
│   ├── page.tsx                        # Homepage
│   ├── potions/
│   │   └── page.tsx                    # Potion Mixer (client component)
│   ├── ingredients/
│   │   ├── page.tsx                    # Ingredient list
│   │   └── [slug]/
│   │       └── page.tsx                # Individual ingredient (static)
│   └── effects/
│       ├── page.tsx                    # Effect list
│       └── [slug]/
│           └── page.tsx                # Individual effect (static)
├── src/
│   ├── data/
│   │   ├── ingredients.json
│   │   └── effects.json
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── PotionMixer/
│   │   ├── IngredientPicker/
│   │   ├── EffectPicker/
│   │   ├── PerkPanel/
│   │   ├── ResultList/
│   │   └── SettingsModal/
│   └── lib/
│       ├── alchemy.ts                  # potion combination logic
│       └── value.ts                    # gold value estimation
├── scripts/
│   └── fetch-locations.ts              # one-off: fetches location hints from UESP API, writes to ingredients.json
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
| 4 | **Theming** | ✅ Decided | 3 named themes: Nordic Dark, Parchment, System. CSS variables on `data-theme`. Selector in settings modal. |
| 5 | **CSS framework** | ✅ Decided | Tailwind CSS v4 + shadcn/ui — see §4.3. |
| 6 | **Shareable URLs** | ✅ Decided | Clean routes (not query params) for shareability and indexability. Dynamic combination paths are client-side routes; ingredient/effect pages are statically generated. |
| 7 | **Max combinations shown** | ✅ Decided | No cap — results are naturally bounded by ingredient selection and filters. |
| 8 | **Testing strategy** | ✅ Decided | Vitest unit tests for `alchemy.ts` and `value.ts` only. No UI tests. |
| 9 | **Custom domain** | Open | Start with `georgecampbel.github.io/skyrim`. Easy to add a domain later. |

---

## 6. MVP Scope (First Buildable Version)

To ship something useful quickly, the MVP is:

- [ ] Ingredient + effect data files (base game + 3 DLC)
- [ ] Mode A: select ingredients → see valid potion combinations
- [ ] Mode B: select desired effects → see ingredient combinations
- [ ] Inline filter bar: plantable toggle, effect type, hide mixed results
- [ ] Settings modal: DLC content flags, perk selections, theme selector
- [ ] Tailwind theme setup: Nordic Dark + Parchment + System via CSS variables
- [ ] Homepage with navigation cards
- [ ] GitHub Actions deploy to GitHub Pages

**Out of scope for MVP:** value estimation, shareable URLs, ingredient detail panel, AE content data, location hints, "what's missing" mode.

---

## 7. Future Tools (Roadmap Ideas)

| Tool | Description |
|------|-------------|
| **Enchanting Calculator** | Pick enchantment + soul gem + skill level + perks → effect strength and estimated value. Mirrors the potion tool. |
| **Trainer Finder** | Select a skill, see every trainer in the game: their level cap, location, hold, and any prerequisite quest. Filterable and faster than any wiki table. |
| **Standing Stones Reference** | All 13 stones with their effects, location by hold, and a brief note on which builds benefit most. Simple but much easier to digest than the wiki. |
| **Shout / Word Wall Tracker** | All 20 shouts listed with their 3 word locations. Check off words as you find them — progress saved to localStorage. |
| **Missable Content Checklist** | Quests, items, and dialogue that can be permanently locked out, with the exact conditions explained. Checkable, saved to localStorage. |
| **Skill Book Finder** | Every skill book in the game, filterable by skill. Mark books as read — saved to localStorage. |
| **Character Generator** | Shuffle/roll to get a randomised character concept: race, archetype (e.g. "Spellsword", "Stealth Archer", "Druid"), primary skill focus, and a short flavour blurb with starting suggestions. Rerollable by category so you can lock a race you like and randomise the rest. |
