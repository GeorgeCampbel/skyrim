"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { useSettings } from "@/src/components/SettingsProvider";

interface PotionMixerProps {
  ingredients: Ingredient[];
  effects: Effect[];
  initialSelection?: AlchemySelection;
}

type MobileTab = "ingredients" | "effects";

function selectionToSlug(sel: AlchemySelection): string {
  const ids = [...sel.ingredientIds, ...sel.effectIds].sort();
  return ids.join("+");
}

function parseSlugToSelection(
  slug: string,
  ingredients: Ingredient[],
  effects: Effect[]
): AlchemySelection {
  if (!slug) return EMPTY_SELECTION;
  const ids = slug.split("+");
  const ingredientIds: string[] = [];
  const effectIds: string[] = [];
  for (const id of ids) {
    if (ingredients.some((i) => i.id === id)) {
      ingredientIds.push(id);
    } else if (effects.some((e) => e.id === id)) {
      effectIds.push(id);
    }
  }
  return { ingredientIds: ingredientIds.slice(0, 3), effectIds };
}

export function PotionMixer({
  ingredients,
  effects,
  initialSelection = EMPTY_SELECTION,
}: PotionMixerProps) {
  const { settings } = useSettings();
  const [selection, setSelection] = useState<AlchemySelection>(initialSelection);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [mobileTab, setMobileTab] = useState<MobileTab>("ingredients");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [effectSearch, setEffectSearch] = useState("");
  const urlInitialized = useRef(false);

  // On mount: read URL pathname (or sessionStorage redirect) and restore selection
  useEffect(() => {
    // Restore path saved by 404.html redirect
    const redirected = sessionStorage.getItem("skyrim-redirect");
    if (redirected) {
      sessionStorage.removeItem("skyrim-redirect");
      window.history.replaceState(null, "", redirected);
    }

    const pathname = redirected ?? window.location.pathname;
    const match = pathname.match(/\/alchemy\/([^/]+)\/?$/);
    if (match) {
      const parsed = parseSlugToSelection(match[1], ingredients, effects);
      const hasContent =
        parsed.ingredientIds.length > 0 || parsed.effectIds.length > 0;
      if (hasContent) {
        setSelection(parsed);
      }
    }
    urlInitialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On selection change: update URL (skip until URL has been initialized)
  useEffect(() => {
    if (!urlInitialized.current) return;
    const slug = selectionToSlug(selection);
    const base = "/skyrim/alchemy";
    const newPath = slug ? `${base}/${slug}` : base;
    window.history.replaceState(null, "", newPath);
  }, [selection]);

  const dlcFilteredIngredients = useMemo(() => {
    return ingredients.filter((i) => {
      if (i.source === "base") return true;
      return settings.dlc[i.source as keyof typeof settings.dlc] ?? true;
    });
  }, [ingredients, settings.dlc]);

  const filteredIngredients = useMemo(() => {
    let list = dlcFilteredIngredients;
    if (filters.plantableOnly) list = list.filter((i) => i.isPlantable);
    if (ingredientSearch.trim()) {
      const q = ingredientSearch.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [dlcFilteredIngredients, filters.plantableOnly, ingredientSearch]);

  const filteredEffects = useMemo(() => {
    let list = filters.effectType === "all" ? effects : effects.filter((e) => e.type === filters.effectType);
    if (effectSearch.trim()) {
      const q = effectSearch.trim().toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [effects, filters.effectType, effectSearch]);

  const potion = useMemo(
    () => currentPotion(selection, dlcFilteredIngredients, effects),
    [selection, dlcFilteredIngredients, effects]
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
          <div className="flex items-center justify-between">
            <ColumnHeader>
              Ingredients
              {selection.ingredientIds.length > 0 && (
                <span className="text-[var(--accent)] text-xs font-normal ml-1">
                  {selection.ingredientIds.length}/3 selected
                </span>
              )}
            </ColumnHeader>
          </div>
          <SearchInput
            value={ingredientSearch}
            onChange={setIngredientSearch}
            placeholder="Filter ingredients…"
          />
          <div style={{ maxHeight: columnHeight }} className="overflow-y-auto pr-1">
            <IngredientColumn
              ingredients={filteredIngredients}
              allIngredients={dlcFilteredIngredients}
              selection={selection}
              onToggleIngredient={handleToggleIngredient}
              allEffects={effects}
            />
          </div>
        </div>

        {/* Effects column */}
        <div className={mobileTab !== "effects" ? "hidden md:flex flex-col gap-2" : "flex flex-col gap-2"}>
          <div className="flex items-center justify-between">
            <ColumnHeader>
              Effects
              {selection.effectIds.length > 0 && (
                <span className="text-[var(--accent)] text-xs font-normal ml-1">
                  {selection.effectIds.length} selected
                </span>
              )}
            </ColumnHeader>
          </div>
          <SearchInput
            value={effectSearch}
            onChange={setEffectSearch}
            placeholder="Filter effects…"
          />
          <div style={{ maxHeight: columnHeight }} className="overflow-y-auto pr-1">
            <EffectColumn
              effects={filteredEffects}
              allIngredients={dlcFilteredIngredients}
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

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 text-sm rounded-md border border-[var(--border)]
          bg-[var(--bg-elevated)] text-[var(--text)] placeholder:text-[var(--text-faint)]
          focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors text-xs"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
