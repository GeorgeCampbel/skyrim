import { describe, it, expect } from "vitest";
import {
  getSharedEffects,
  isValidCombo,
  isStrictTriple,
  computePotion,
  candidateContributions,
  comboToSlug,
  slugToIngredientIds,
  allValidPairs,
} from "./alchemy";
import type { Ingredient, Effect } from "@/src/data/types";

const EFFECTS: Effect[] = [
  { id: "restore-health", name: "Restore Health", type: "beneficial", category: "restore" },
  { id: "fortify-health", name: "Fortify Health", type: "beneficial", category: "fortify" },
  { id: "fortify-conjuration", name: "Fortify Conjuration", type: "beneficial", category: "fortify" },
  { id: "damage-magicka-regen", name: "Damage Magicka Regen", type: "harmful", category: "damage" },
  { id: "damage-stamina-regen", name: "Damage Stamina Regen", type: "harmful", category: "damage" },
  { id: "lingering-damage-magicka", name: "Lingering Damage Magicka", type: "harmful", category: "damage" },
  { id: "resist-magic", name: "Resist Magic", type: "beneficial", category: "resist" },
  { id: "fortify-stamina", name: "Fortify Stamina", type: "beneficial", category: "fortify" },
  { id: "ravage-magicka", name: "Ravage Magicka", type: "harmful", category: "damage" },
  { id: "damage-health", name: "Damage Health", type: "harmful", category: "damage" },
];

const BLUE_MOUNTAIN_FLOWER: Ingredient = {
  id: "blue-mountain-flower",
  name: "Blue Mountain Flower",
  effects: ["restore-health", "fortify-conjuration", "fortify-health", "damage-magicka-regen"],
  source: "base",
  isPlantable: true,
  locationHints: [],
};

const WHEAT: Ingredient = {
  id: "wheat",
  name: "Wheat",
  effects: ["restore-health", "fortify-health", "damage-stamina-regen", "lingering-damage-magicka"],
  source: "base",
  isPlantable: true,
  locationHints: [],
};

const LAVENDER: Ingredient = {
  id: "lavender",
  name: "Lavender",
  effects: ["resist-magic", "fortify-stamina", "ravage-magicka", "fortify-conjuration"],
  source: "base",
  isPlantable: true,
  locationHints: [],
};

const VOID_SALTS: Ingredient = {
  id: "void-salts",
  name: "Void Salts",
  effects: ["weakness-to-shock", "resist-magic", "damage-health", "fortify-magicka"],
  source: "base",
  isPlantable: false,
  locationHints: [],
};

describe("getSharedEffects", () => {
  it("returns Restore Health + Fortify Health for Blue Mountain Flower + Wheat", () => {
    const shared = getSharedEffects([BLUE_MOUNTAIN_FLOWER, WHEAT], EFFECTS);
    const ids = shared.map((e) => e.id);
    expect(ids).toContain("restore-health");
    expect(ids).toContain("fortify-health");
    expect(ids).toHaveLength(2);
  });

  it("returns empty for ingredients with no shared effects", () => {
    const shared = getSharedEffects([WHEAT, VOID_SALTS], EFFECTS);
    expect(shared).toHaveLength(0);
  });

  it("returns empty for fewer than 2 ingredients", () => {
    expect(getSharedEffects([WHEAT], EFFECTS)).toHaveLength(0);
    expect(getSharedEffects([], EFFECTS)).toHaveLength(0);
  });

  it("finds Fortify Conjuration shared by Blue Mountain Flower + Lavender", () => {
    const shared = getSharedEffects([BLUE_MOUNTAIN_FLOWER, LAVENDER], EFFECTS);
    const ids = shared.map((e) => e.id);
    expect(ids).toContain("fortify-conjuration");
    expect(ids).toHaveLength(1);
  });
});

describe("isValidCombo", () => {
  it("Blue Mountain Flower + Wheat is valid", () => {
    expect(isValidCombo([BLUE_MOUNTAIN_FLOWER, WHEAT], EFFECTS)).toBe(true);
  });

  it("Wheat + Void Salts is not valid", () => {
    expect(isValidCombo([WHEAT, VOID_SALTS], EFFECTS)).toBe(false);
  });
});

describe("isStrictTriple", () => {
  it("rejects a triple where one ingredient contributes nothing", () => {
    // Wheat + Void Salts share nothing; Lavender shares resist-magic with Void Salts
    // Lavender shares fortify-conjuration with Blue Mountain Flower
    // Blue Mountain Flower + Wheat share restore-health + fortify-health
    // Void Salts shares nothing with Wheat or Blue Mountain Flower here
    const triple: [Ingredient, Ingredient, Ingredient] = [
      BLUE_MOUNTAIN_FLOWER,
      WHEAT,
      VOID_SALTS,
    ];
    // Void Salts effects: weakness-to-shock, resist-magic, damage-health, fortify-magicka
    // BMF + Wheat potion: restore-health, fortify-health
    // Void Salts shares none of those → dead weight → not strict
    expect(isStrictTriple(triple, EFFECTS)).toBe(false);
  });

  it("accepts a triple where all ingredients contribute", () => {
    // BMF: restore-health, fortify-conjuration, fortify-health, damage-magicka-regen
    // Wheat: restore-health, fortify-health, damage-stamina-regen, lingering-damage-magicka
    // Lavender: resist-magic, fortify-stamina, ravage-magicka, fortify-conjuration
    // BMF+Wheat share: restore-health, fortify-health
    // BMF+Lavender share: fortify-conjuration
    // Wheat+Lavender share: (none from remaining effects)
    // Final potion: restore-health, fortify-health, fortify-conjuration
    // BMF contributes restore-health, fortify-health, fortify-conjuration ✓
    // Wheat contributes restore-health, fortify-health ✓
    // Lavender contributes fortify-conjuration ✓
    const triple: [Ingredient, Ingredient, Ingredient] = [
      BLUE_MOUNTAIN_FLOWER,
      WHEAT,
      LAVENDER,
    ];
    expect(isStrictTriple(triple, EFFECTS)).toBe(true);
  });
});

describe("computePotion", () => {
  it("returns correct ingredients and effects", () => {
    const result = computePotion([BLUE_MOUNTAIN_FLOWER, WHEAT], EFFECTS);
    expect(result.ingredients).toHaveLength(2);
    expect(result.effects.map((e) => e.id)).toContain("restore-health");
    expect(result.effects.map((e) => e.id)).toContain("fortify-health");
  });
});

describe("candidateContributions", () => {
  it("identifies which effects Lavender would add when BMF is selected", () => {
    const contributions = candidateContributions([BLUE_MOUNTAIN_FLOWER], LAVENDER);
    expect(contributions.has("fortify-conjuration")).toBe(true);
    expect(contributions.size).toBe(1);
  });

  it("returns empty set when candidate shares nothing with selection", () => {
    const contributions = candidateContributions([WHEAT], VOID_SALTS);
    expect(contributions.size).toBe(0);
  });
});

describe("comboToSlug / slugToIngredientIds", () => {
  it("produces alphabetically sorted, plus-joined slug", () => {
    const slug = comboToSlug([WHEAT, BLUE_MOUNTAIN_FLOWER, LAVENDER]);
    expect(slug).toBe("blue-mountain-flower+lavender+wheat");
  });

  it("round-trips slug to ingredient IDs", () => {
    const slug = "blue-mountain-flower+lavender+wheat";
    expect(slugToIngredientIds(slug)).toEqual([
      "blue-mountain-flower",
      "lavender",
      "wheat",
    ]);
  });
});

describe("allValidPairs", () => {
  it("finds Blue Mountain Flower + Wheat as a valid pair", () => {
    const pairs = allValidPairs(
      [BLUE_MOUNTAIN_FLOWER, WHEAT, LAVENDER, VOID_SALTS],
      EFFECTS
    );
    const slugs = pairs.map((p) => comboToSlug(p));
    expect(slugs).toContain("blue-mountain-flower+wheat");
  });

  it("does not include Wheat + Void Salts", () => {
    const pairs = allValidPairs([WHEAT, VOID_SALTS], EFFECTS);
    expect(pairs).toHaveLength(0);
  });
});
