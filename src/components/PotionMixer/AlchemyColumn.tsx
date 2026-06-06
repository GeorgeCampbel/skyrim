"use client";

import type { Ingredient, Effect } from "@/src/data/types";
import type { AlchemySelection } from "@/src/lib/alchemyState";
import {
  ingredientCardState,
  effectCardState,
  groupIngredientsByEffect,
  CardState,
} from "@/src/lib/alchemyState";
import { AlchemyCard } from "./AlchemyCard";

interface IngredientColumnProps {
  ingredients: Ingredient[];
  allIngredients: Ingredient[];
  selection: AlchemySelection;
  onToggleIngredient: (id: string) => void;
  allEffects: Effect[];
}

export function IngredientColumn({
  ingredients,
  allIngredients,
  selection,
  onToggleIngredient,
  allEffects,
}: IngredientColumnProps) {
  const atMax = selection.ingredientIds.length >= 3;

  const withState = ingredients.map((ing) => ({
    ing,
    state: ingredientCardState(ing, selection, allIngredients),
  }));

  const selected = withState.filter((x) => x.state === "selected");
  const defaultItems = withState.filter((x) => x.state === "default");
  const muted = withState.filter((x) => x.state === "muted");

  const shouldGroup = selection.effectIds.length === 2;
  const { matchesAll, byEffect } = shouldGroup
    ? groupIngredientsByEffect(
        defaultItems.map((x) => x.ing),
        selection.effectIds
      )
    : { matchesAll: [], byEffect: [] };

  const selectedEffectNames = selection.effectIds.map(
    (id) => allEffects.find((e) => e.id === id)?.name ?? id
  );

  function renderCard(
    ing: Ingredient,
    state: CardState,
    key?: string
  ) {
    const isDisabled = atMax && state !== "selected";
    return (
      <AlchemyCard
        key={key ?? ing.id}
        label={ing.name}
        state={isDisabled && state === "default" ? "default" : state}
        disabled={isDisabled && state === "default"}
        onClick={() => !isDisabled && onToggleIngredient(ing.id)}
        badge={
          ing.isPlantable ? (
            <span title="Plantable" className="text-[var(--beneficial)] text-xs">🌱</span>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {atMax && (
        <p className="text-xs text-[var(--text-muted)] text-center py-1">
          3 ingredients selected — deselect one to change
        </p>
      )}

      {/* Selected */}
      {selected.length > 0 && (
        <div className="flex flex-col gap-1">
          {selected.map(({ ing }) => renderCard(ing, "selected"))}
        </div>
      )}

      {/* Default — flat or grouped */}
      {defaultItems.length > 0 && (
        <>
          {selected.length > 0 && <Divider />}
          {shouldGroup ? (
            <div className="flex flex-col gap-3">
              {matchesAll.length > 0 && (
                <div>
                  <GroupLabel>Matches both effects</GroupLabel>
                  <div className="flex flex-col gap-1">
                    {matchesAll.map((ing) => renderCard(ing, "default"))}
                  </div>
                </div>
              )}
              {byEffect.map(({ effectId, ingredients: ings }, i) =>
                ings.length > 0 ? (
                  <div key={effectId}>
                    <GroupLabel>{selectedEffectNames[i]} only</GroupLabel>
                    <div className="flex flex-col gap-1">
                      {ings.map((ing) => renderCard(ing, "default"))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {defaultItems.map(({ ing }) => renderCard(ing, "default"))}
            </div>
          )}
        </>
      )}

      {/* Muted */}
      {muted.length > 0 && (
        <>
          {(selected.length > 0 || defaultItems.length > 0) && <Divider faint />}
          <div className="flex flex-col gap-1">
            {muted.map(({ ing }) => renderCard(ing, "muted"))}
          </div>
        </>
      )}
    </div>
  );
}

interface EffectColumnProps {
  effects: Effect[];
  allIngredients: Ingredient[];
  selection: AlchemySelection;
  onToggleEffect: (id: string) => void;
}

export function EffectColumn({
  effects,
  allIngredients,
  selection,
  onToggleEffect,
}: EffectColumnProps) {
  const withState = effects.map((eff) => ({
    eff,
    state: effectCardState(eff.id, selection, allIngredients),
  }));

  const selected = withState.filter((x) => x.state === "selected");
  const defaultItems = withState.filter((x) => x.state === "default");
  const muted = withState.filter((x) => x.state === "muted");

  function renderCard(eff: Effect, state: CardState) {
    return (
      <AlchemyCard
        key={eff.id}
        label={eff.name}
        state={state}
        onClick={() => onToggleEffect(eff.id)}
        badge={
          <span
            className={[
              "text-xs w-1.5 h-1.5 rounded-full shrink-0 inline-block",
              eff.type === "beneficial"
                ? "bg-[var(--beneficial)]"
                : "bg-[var(--harmful)]",
            ].join(" ")}
          />
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {selected.length > 0 && (
        <div className="flex flex-col gap-1">
          {selected.map(({ eff }) => renderCard(eff, "selected"))}
        </div>
      )}
      {defaultItems.length > 0 && (
        <>
          {selected.length > 0 && <Divider />}
          <div className="flex flex-col gap-1">
            {defaultItems.map(({ eff }) => renderCard(eff, "default"))}
          </div>
        </>
      )}
      {muted.length > 0 && (
        <>
          {(selected.length > 0 || defaultItems.length > 0) && <Divider faint />}
          <div className="flex flex-col gap-1">
            {muted.map(({ eff }) => renderCard(eff, "muted"))}
          </div>
        </>
      )}
    </div>
  );
}

function Divider({ faint = false }: { faint?: boolean }) {
  return (
    <div
      className="my-1 border-t"
      style={{
        borderColor: faint ? "var(--border-muted)" : "var(--border)",
      }}
    />
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-[var(--text-muted)] px-1 mb-1 mt-1">{children}</p>
  );
}
