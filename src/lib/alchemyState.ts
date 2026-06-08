import type { Ingredient, Effect } from "@/src/data/types";
import { getSharedEffects } from "./alchemy";

export type CardState = "selected" | "default" | "muted";

export interface AlchemySelection {
  ingredientIds: string[];
  effectIds: string[];
}

export const EMPTY_SELECTION: AlchemySelection = {
  ingredientIds: [],
  effectIds: [],
};

function hasSelection(sel: AlchemySelection): boolean {
  return sel.ingredientIds.length > 0 || sel.effectIds.length > 0;
}

export function ingredientCardState(
  ingredient: Ingredient,
  sel: AlchemySelection,
  allIngredients: Ingredient[]
): CardState {
  if (sel.ingredientIds.includes(ingredient.id)) return "selected";
  if (!hasSelection(sel)) return "default";

  const selectedIngredients = allIngredients.filter((i) =>
    sel.ingredientIds.includes(i.id)
  );
  const selectedIngredientEffectIds = new Set(
    selectedIngredients.flatMap((i) => i.effects)
  );
  const selectedEffectSet = new Set(sel.effectIds);

  // If the user has pinned specific effects, only show ingredients that have those effects
  if (selectedEffectSet.size > 0) {
    return ingredient.effects.some((e) => selectedEffectSet.has(e))
      ? "default"
      : "muted";
  }

  const sharesWithSelectedIngredient = ingredient.effects.some((e) =>
    selectedIngredientEffectIds.has(e)
  );
  return sharesWithSelectedIngredient ? "default" : "muted";
}

export function effectCardState(
  effectId: string,
  sel: AlchemySelection,
  allIngredients: Ingredient[]
): CardState {
  if (sel.effectIds.includes(effectId)) return "selected";
  if (!hasSelection(sel)) return "default";

  const selectedIngredients = allIngredients.filter((i) =>
    sel.ingredientIds.includes(i.id)
  );
  const belongsToSelectedIngredient = selectedIngredients.some((i) =>
    i.effects.includes(effectId)
  );

  return belongsToSelectedIngredient ? "default" : "muted";
}

/** Group default ingredients by which selected effects they match.
 *  Used when 2 effects are selected. */
export function groupIngredientsByEffect(
  defaultIngredients: Ingredient[],
  selectedEffectIds: string[]
): {
  matchesAll: Ingredient[];
  byEffect: { effectId: string; ingredients: Ingredient[] }[];
} {
  if (selectedEffectIds.length < 2) {
    return { matchesAll: [], byEffect: [] };
  }

  const matchesAll = defaultIngredients.filter((ing) =>
    selectedEffectIds.every((eid) => ing.effects.includes(eid))
  );
  const matchesAllIds = new Set(matchesAll.map((i) => i.id));

  const byEffect = selectedEffectIds.map((eid) => ({
    effectId: eid,
    ingredients: defaultIngredients.filter(
      (ing) => !matchesAllIds.has(ing.id) && ing.effects.includes(eid)
    ),
  }));

  return { matchesAll, byEffect };
}

/** Current potion result from the selected ingredients. */
export function currentPotion(
  sel: AlchemySelection,
  allIngredients: Ingredient[],
  allEffects: Effect[]
): { ingredients: Ingredient[]; effects: Effect[] } | null {
  if (sel.ingredientIds.length < 2) return null;
  const ingredients = allIngredients.filter((i) =>
    sel.ingredientIds.includes(i.id)
  );
  const effects = getSharedEffects(ingredients, allEffects);
  if (effects.length === 0) return null;
  return { ingredients, effects };
}

export function toggleIngredient(
  sel: AlchemySelection,
  id: string,
  maxIngredients = 3
): AlchemySelection {
  if (sel.ingredientIds.includes(id)) {
    return { ...sel, ingredientIds: sel.ingredientIds.filter((i) => i !== id) };
  }
  if (sel.ingredientIds.length >= maxIngredients) return sel;
  return { ...sel, ingredientIds: [...sel.ingredientIds, id] };
}

export function toggleEffect(
  sel: AlchemySelection,
  id: string
): AlchemySelection {
  if (sel.effectIds.includes(id)) {
    return { ...sel, effectIds: sel.effectIds.filter((e) => e !== id) };
  }
  return { ...sel, effectIds: [...sel.effectIds, id] };
}
