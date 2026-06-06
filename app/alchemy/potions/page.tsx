import ingredientsData from "@/src/data/ingredients.json";
import effectsData from "@/src/data/effects.json";
import type { Ingredient, Effect } from "@/src/data/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Potions — Skyrim Alchemy",
  description:
    "Browse all Skyrim alchemy effects and the ingredients that produce them. Complete reference for beneficial and harmful effects.",
};

export default function PotionsPage() {
  const ingredients = ingredientsData as Ingredient[];
  const effects = (effectsData as Effect[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const beneficial = effects.filter((e) => e.type === "beneficial");
  const harmful = effects.filter((e) => e.type === "harmful");

  function ingredientsForEffect(effectId: string): Ingredient[] {
    return ingredients
      .filter((i) => i.effects.includes(effectId))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">
          All Potion Effects
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Every alchemy effect in Skyrim, with ingredients that produce it.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <EffectGroup title="Beneficial" effects={beneficial} getIngredients={ingredientsForEffect} />
        <EffectGroup title="Harmful" effects={harmful} getIngredients={ingredientsForEffect} />
      </div>
    </div>
  );
}

function EffectGroup({
  title,
  effects,
  getIngredients,
}: {
  title: string;
  effects: Effect[];
  getIngredients: (id: string) => Ingredient[];
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
        {title}
      </h2>
      <div className="flex flex-col gap-4">
        {effects.map((effect) => {
          const ings = getIngredients(effect.id);
          return (
            <div
              key={effect.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background:
                      effect.type === "beneficial"
                        ? "var(--beneficial)"
                        : "var(--harmful)",
                  }}
                />
                <a
                  href={`/skyrim/alchemy/${effect.id}`}
                  className="font-medium text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                >
                  {effect.name}
                </a>
                <span className="text-xs text-[var(--text-faint)] ml-auto">
                  {ings.length} ingredient{ings.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] flex flex-wrap gap-x-1.5 gap-y-1">
                {ings.map((ing, idx) => (
                  <span key={ing.id}>
                    <a
                      href={`/skyrim/alchemy/${ing.id}`}
                      className="hover:text-[var(--text)] transition-colors"
                    >
                      {ing.name}
                    </a>
                    {idx < ings.length - 1 && (
                      <span className="text-[var(--text-faint)]">,</span>
                    )}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
