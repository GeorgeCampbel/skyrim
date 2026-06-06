import type { CardState } from "@/src/lib/alchemyState";

interface AlchemyCardProps {
  label: string;
  state: CardState;
  onClick: () => void;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export function AlchemyCard({
  label,
  state,
  onClick,
  disabled = false,
  badge,
}: AlchemyCardProps) {
  const isSelected = state === "selected";
  const isMuted = state === "muted";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full text-left px-3 py-2 rounded-md border text-sm transition-all duration-150",
        "flex items-center gap-2",
        isSelected &&
          "border-[var(--card-selected-border)] bg-[var(--card-selected-bg)] text-[var(--accent)] font-medium shadow-sm",
        !isSelected &&
          !isMuted &&
          "border-[var(--card-default-border)] bg-[var(--card-default-bg)] text-[var(--text)] hover:border-[var(--accent-dim)] hover:bg-[var(--bg-elevated)]",
        isMuted &&
          "border-[var(--border-muted)] bg-transparent text-[var(--text-faint)] cursor-default",
        disabled && !isMuted && "opacity-40 cursor-not-allowed",
      ]
        .filter(Boolean)
        .join(" ")}
      style={isMuted ? { opacity: "var(--card-muted-opacity)" } : undefined}
    >
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {badge && <span className="shrink-0 flex items-center">{badge}</span>}
      {isSelected && (
        <span className="shrink-0 text-[var(--accent)] opacity-70 leading-none">✓</span>
      )}
    </button>
  );
}
