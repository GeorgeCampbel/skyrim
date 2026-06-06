import ingredientsData from "@/src/data/ingredients.json";
import effectsData from "@/src/data/effects.json";
import type { Ingredient, Effect } from "@/src/data/types";
import { PotionMixer } from "@/src/components/PotionMixer";

export const metadata = {
  title: "Potion Mixer — Skyrim Tools",
  description:
    "Find potions from ingredients you have, or discover which ingredients produce a desired effect. Full Skyrim alchemy reference.",
};

export default function AlchemyPage() {
  const ingredients = ingredientsData as Ingredient[];
  const effects = (effectsData as Effect[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedIngredients = [...ingredients].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[var(--text)]">Potion Mixer</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Select ingredients or effects to find matching potions. Up to 3 ingredients.
        </p>
      </div>
      <PotionMixer ingredients={sortedIngredients} effects={effects} />
    </div>
  );
}
