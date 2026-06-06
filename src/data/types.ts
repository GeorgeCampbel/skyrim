export type DLCSource = "base" | "dawnguard" | "dragonborn" | "hearthfire" | "anniversary";

export type EffectType = "beneficial" | "harmful";

export type EffectCategory = "restore" | "fortify" | "resist" | "damage" | "regenerate" | "other";

export interface Effect {
  id: string;
  name: string;
  type: EffectType;
  category: EffectCategory;
}

export interface Ingredient {
  id: string;
  name: string;
  /** Ordered: index 0 is the most potent effect */
  effects: [string, string, string, string];
  source: DLCSource;
  isPlantable: boolean;
  locationHints: string[];
}

export interface PotionResult {
  ingredients: Ingredient[];
  effects: Effect[];
}
