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
  search: string;
  onSearchChange: (v: string) => void;
}

export function FilterBar({ filters, onChange, onClear, hasSelection, search, onSearchChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
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

      <div className="relative flex-1 min-w-[140px]">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="w-full px-2.5 py-1 text-xs rounded-md border border-[var(--border)]
            bg-[var(--bg-elevated)] text-[var(--text)] placeholder:text-[var(--text-faint)]
            focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors leading-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {hasSelection && (
        <button
          onClick={onClear}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors underline whitespace-nowrap"
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
