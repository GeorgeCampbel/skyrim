"use client";

export interface Filters {
  plantableOnly: boolean;
  effectType: "all" | "beneficial" | "harmful";
  hideMixed: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  plantableOnly: false,
  effectType: "all",
  hideMixed: false,
};

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
  hasSelection: boolean;
}

export function FilterBar({ filters, onChange, onClear, hasSelection }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <ToggleChip
        active={filters.plantableOnly}
        onClick={() => onChange({ ...filters, plantableOnly: !filters.plantableOnly })}
      >
        🌱 Plantable only
      </ToggleChip>

      <div className="flex rounded-md overflow-hidden border border-[var(--border)] text-xs">
        {(["all", "beneficial", "harmful"] as const).map((type) => (
          <button
            key={type}
            onClick={() => onChange({ ...filters, effectType: type })}
            className={[
              "px-2.5 py-1 capitalize transition-colors",
              filters.effectType === type
                ? "bg-[var(--bg-elevated)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            ].join(" ")}
          >
            {type}
          </button>
        ))}
      </div>

      <ToggleChip
        active={filters.hideMixed}
        onClick={() => onChange({ ...filters, hideMixed: !filters.hideMixed })}
      >
        Hide mixed
      </ToggleChip>

      {hasSelection && (
        <button
          onClick={onClear}
          className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors underline"
        >
          Reset all
        </button>
      )}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1 rounded-full border text-xs transition-colors",
        active
          ? "border-[var(--accent-dim)] bg-[var(--accent-glow)] text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
