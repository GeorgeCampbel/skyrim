import type { Ingredient, Effect, PotionResult } from "@/src/data/types";

/** Effects shared by at least 2 of the given ingredients. */
export function getSharedEffects(
  ingredients: Ingredient[],
  allEffects: Effect[]
): Effect[] {
  if (ingredients.length < 2) return [];

  const effectCounts = new Map<string, number>();
  for (const ingredient of ingredients) {
    for (const effectId of ingredient.effects) {
      effectCounts.set(effectId, (effectCounts.get(effectId) ?? 0) + 1);
    }
  }

  const sharedIds = [...effectCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([id]) => id);

  return sharedIds
    .map((id) => allEffects.find((e) => e.id === id))
    .filter((e): e is Effect => e !== undefined);
}

/** True if the ingredient combination produces at least one potion effect. */
export function isValidCombo(
  ingredients: Ingredient[],
  allEffects: Effect[]
): boolean {
  return getSharedEffects(ingredients, allEffects).length > 0;
}

/** True if every ingredient in a 3-ingredient combo contributes at least one
 *  effect to the final potion (i.e. no dead-weight third ingredient). */
export function isStrictTriple(
  ingredients: [Ingredient, Ingredient, Ingredient],
  allEffects: Effect[]
): boolean {
  const potionEffects = new Set(
    getSharedEffects(ingredients, allEffects).map((e) => e.id)
  );
  if (potionEffects.size === 0) return false;
  return ingredients.every((ing) =>
    ing.effects.some((eid) => potionEffects.has(eid))
  );
}

/** Compute the full potion result for a combination. */
export function computePotion(
  ingredients: Ingredient[],
  allEffects: Effect[]
): PotionResult {
  return {
    ingredients,
    effects: getSharedEffects(ingredients, allEffects),
  };
}

/** All effects belonging to a single ingredient, resolved to Effect objects. */
export function resolveIngredientEffects(
  ingredient: Ingredient,
  allEffects: Effect[]
): Effect[] {
  return ingredient.effects
    .map((id) => allEffects.find((e) => e.id === id))
    .filter((e): e is Effect => e !== undefined);
}

/** Effect IDs that appear in at least one of the given ingredients. */
export function unionEffectIds(ingredients: Ingredient[]): Set<string> {
  const ids = new Set<string>();
  for (const ing of ingredients) {
    for (const eid of ing.effects) ids.add(eid);
  }
  return ids;
}

/** Given selected ingredients, which effect IDs would be promoted
 *  (i.e. shared with at least one selected ingredient) if `candidate` were added? */
export function candidateContributions(
  selected: Ingredient[],
  candidate: Ingredient
): Set<string> {
  const selectedEffectIds = unionEffectIds(selected);
  const shared = new Set<string>();
  for (const eid of candidate.effects) {
    if (selectedEffectIds.has(eid)) shared.add(eid);
  }
  return shared;
}

/** Enumerate all valid 2-ingredient combos from a list of ingredients. */
export function allValidPairs(
  ingredients: Ingredient[],
  allEffects: Effect[]
): [Ingredient, Ingredient][] {
  const pairs: [Ingredient, Ingredient][] = [];
  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      const pair: [Ingredient, Ingredient] = [ingredients[i], ingredients[j]];
      if (isValidCombo(pair, allEffects)) pairs.push(pair);
    }
  }
  return pairs;
}

/** Enumerate all strict valid 3-ingredient combos from a list of ingredients. */
export function allStrictTriples(
  ingredients: Ingredient[],
  allEffects: Effect[]
): [Ingredient, Ingredient, Ingredient][] {
  const triples: [Ingredient, Ingredient, Ingredient][] = [];
  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      for (let k = j + 1; k < ingredients.length; k++) {
        const triple: [Ingredient, Ingredient, Ingredient] = [
          ingredients[i],
          ingredients[j],
          ingredients[k],
        ];
        if (isStrictTriple(triple, allEffects)) triples.push(triple);
      }
    }
  }
  return triples;
}

/** Canonical URL slug for an ingredient combo: sorted alphabetically, joined with "+". */
export function comboToSlug(ingredients: Ingredient[]): string {
  return [...ingredients]
    .map((i) => i.id)
    .sort()
    .join("+");
}

/** Parse a combo slug back into ingredient IDs. */
export function slugToIngredientIds(slug: string): string[] {
  return slug.split("+");
}
