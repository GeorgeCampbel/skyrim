"use client";

import { useState, useMemo } from "react";
import type { Ingredient, Effect } from "@/src/data/types";
import {
  EMPTY_SELECTION,
  toggleIngredient,
  toggleEffect,
  currentPotion,
  type AlchemySelection,
} from "@/src/lib/alchemyState";
import { IngredientColumn, EffectColumn } from "./AlchemyColumn";
import { SummaryBar } from "./SummaryBar";
import { FilterBar, DEFAULT_FILTERS, type Filters } from "./FilterBar";

interface PotionMixerProps {
  ingredients: Ingredient[];
  effects: Effect[];
  initialSelection?: AlchemySelection;
}

type MobileTab = "ingredients" | "effects";

export function PotionMixer({
  ingredients,
  effects,
  initialSelection = EMPTY_SELECTION,
}: PotionMixerProps) {
  const [selection, setSelection] = useState<AlchemySelection>(initialSelection);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [mobileTab, setMobileTab] = useState<MobileTab>("ingredients");

  const filteredIngredients = useMemo(() => {
    let list = ingredients;
    if (filters.plantableOnly) list = list.filter((i) => i.isPlantable);
    return list;
  }, [ingredients, filters.plantableOnly]);

  const filteredEffects = useMemo(() => {
    if (filters.effectType === "all") return effects;
    return effects.filter((e) => e.type === filters.effectType);
  }, [effects, filters.effectType]);

  const potion = useMemo(
    () => currentPotion(selection, ingredients, effects),
    [selection, ingredients, effects]
  );

  const visiblePotion = useMemo(() => {
    if (!potion) return null;
    if (!filters.hideMixed) return potion;
    const allBeneficial = potion.effects.every((e) => e.type === "beneficial");
    return allBeneficial ? potion : null;
  }, [potion, filters.hideMixed]);

  function handleToggleIngredient(id: string) {
    setSelection((s) => toggleIngredient(s, id));
  }

  function handleToggleEffect(id: string) {
    setSelection((s) => toggleEffect(s, id));
  }

  function handleClear() {
    setSelection(EMPTY_SELECTION);
  }

  const hasSelection =
    selection.ingredientIds.length > 0 || selection.effectIds.length > 0;

  const columnHeight = "calc(100vh - 220px)";

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={handleClear}
        hasSelection={hasSelection}
      />

      {/* Summary bar — appears when valid potion exists */}
      {visiblePotion && (
        <SummaryBar
          ingredients={visiblePotion.ingredients}
          effects={visiblePotion.effects}
          onClear={handleClear}
        />
      )}

      {/* Mobile tab switcher */}
      <div className="flex md:hidden rounded-md overflow-hidden border border-[var(--border)] text-sm">
        {(["ingredients", "effects"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={[
              "flex-1 py-2 capitalize transition-colors",
              mobileTab === tab
                ? "bg-[var(--bg-elevated)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            ].join(" ")}
          >
            {tab}
            {tab === "ingredients" && selection.ingredientIds.length > 0 && (
              <span className="ml-1.5 text-xs text-[var(--accent)]">
                ({selection.ingredientIds.length})
              </span>
            )}
            {tab === "effects" && selection.effectIds.length > 0 && (
              <span className="ml-1.5 text-xs text-[var(--accent)]">
                ({selection.effectIds.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two columns — desktop: side by side; mobile: tabbed */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Ingredients column */}
        <div className={mobileTab !== "ingredients" ? "hidden md:flex flex-col gap-2" : "flex flex-col gap-2"}>
          <ColumnHeader>
            Ingredients
            {selection.ingredientIds.length > 0 && (
              <span className="text-[var(--accent)] text-xs font-normal ml-1">
                {selection.ingredientIds.length}/3 selected
              </span>
            )}
          </ColumnHeader>
          <div style={{ maxHeight: columnHeight }} className="overflow-y-auto pr-1">
            <IngredientColumn
              ingredients={filteredIngredients}
              allIngredients={ingredients}
              selection={selection}
              onToggleIngredient={handleToggleIngredient}
              allEffects={effects}
            />
          </div>
        </div>

        {/* Effects column */}
        <div className={mobileTab !== "effects" ? "hidden md:flex flex-col gap-2" : "flex flex-col gap-2"}>
          <ColumnHeader>
            Effects
            {selection.effectIds.length > 0 && (
              <span className="text-[var(--accent)] text-xs font-normal ml-1">
                {selection.effectIds.length} selected
              </span>
            )}
          </ColumnHeader>
          <div style={{ maxHeight: columnHeight }} className="overflow-y-auto pr-1">
            <EffectColumn
              effects={filteredEffects}
              allIngredients={ingredients}
              selection={selection}
              onToggleEffect={handleToggleEffect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
      {children}
    </h2>
  );
}
