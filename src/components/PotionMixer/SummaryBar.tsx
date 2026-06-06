import type { Ingredient, Effect } from "@/src/data/types";

interface SummaryBarProps {
  ingredients: Ingredient[];
  effects: Effect[];
  onClear: () => void;
}

export function SummaryBar({ ingredients, effects, onClear }: SummaryBarProps) {
  return (
    <div className="rounded-lg border border-[var(--accent-dim)] bg-[var(--accent-glow)] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 flex flex-wrap items-center gap-2 text-sm">
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map((ing) => (
            <span
              key={ing.id}
              className="px-2 py-0.5 rounded border border-[var(--accent-dim)] bg-[var(--bg-surface)] text-[var(--accent)] text-xs font-medium"
            >
              {ing.name}
            </span>
          ))}
        </div>
        <span className="text-[var(--text-muted)]">→</span>
        <div className="flex flex-wrap gap-1.5">
          {effects.map((eff) => (
            <span
              key={eff.id}
              className={[
                "px-2 py-0.5 rounded border text-xs font-medium",
                eff.type === "beneficial"
                  ? "border-[var(--beneficial)] text-[var(--beneficial)] bg-[var(--bg-surface)]"
                  : "border-[var(--harmful)] text-[var(--harmful)] bg-[var(--bg-surface)]",
              ].join(" ")}
            >
              {eff.name}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={onClear}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0 underline"
      >
        Clear
      </button>
    </div>
  );
}
