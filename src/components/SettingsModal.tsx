"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Settings } from "lucide-react";
import { useSettings } from "./SettingsProvider";
import type { PerkSettings } from "@/src/lib/settings";

const DLC_LABELS: Record<string, string> = {
  dawnguard: "Dawnguard",
  dragonborn: "Dragonborn",
  hearthfire: "Hearthfire",
  anniversary: "Anniversary Edition",
};

const PERKS: {
  key: keyof PerkSettings;
  label: string;
  note?: string;
  ranks?: number;
}[] = [
  { key: "alchemist", label: "Alchemist", ranks: 5, note: "Stronger potions" },
  { key: "physician", label: "Physician", note: "+25% restore Health/Magicka/Stamina" },
  { key: "benefactor", label: "Benefactor", note: "+25% beneficial potions" },
  { key: "poisoner", label: "Poisoner", note: "+25% harmful poisons" },
  {
    key: "purity",
    label: "Purity",
    note: "Removes negative effects from potions",
  },
  { key: "greenThumb", label: "Green Thumb", note: "2× ingredient yield from plants" },
  {
    key: "concentratedPoison",
    label: "Concentrated Poison",
    note: "Poisons last twice as long on weapons",
  },
];

export function SettingsModal() {
  const { settings, updateSettings } = useSettings();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Settings"
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <Settings size={16} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content
          className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col
            bg-[var(--bg-surface)] border-l border-[var(--border)] shadow-xl
            overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <Dialog.Title className="font-semibold text-[var(--text)]">
              Settings
            </Dialog.Title>
            <Dialog.Close className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ✕
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-6 px-5 py-5">
            {/* Theme */}
            <Section title="Theme">
              <div className="flex gap-2">
                {(["nordic", "parchment", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateSettings({ theme: t })}
                    className={[
                      "flex-1 py-1.5 text-xs rounded-md border capitalize transition-colors",
                      settings.theme === t
                        ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
                    ].join(" ")}
                  >
                    {t === "nordic" ? "Nordic Dark" : t === "parchment" ? "Parchment" : "System"}
                  </button>
                ))}
              </div>
            </Section>

            {/* DLC */}
            <Section title="Content">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Uncheck DLC you don't own to hide those ingredients.
              </p>
              <div className="flex flex-col gap-2">
                <CheckRow label="Base Game" checked disabled />
                {(Object.keys(DLC_LABELS) as Array<keyof typeof DLC_LABELS>).map(
                  (key) => (
                    <CheckRow
                      key={key}
                      label={DLC_LABELS[key]}
                      checked={settings.dlc[key as keyof typeof settings.dlc]}
                      onChange={(v) =>
                        updateSettings({
                          dlc: { ...settings.dlc, [key]: v },
                        })
                      }
                    />
                  )
                )}
              </div>
            </Section>

            {/* Alchemy skill */}
            <Section title="Alchemy Skill">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Set for potion value estimates (post-MVP feature).
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.alchemySkill ?? ""}
                  placeholder="1–100"
                  onChange={(e) =>
                    updateSettings({
                      alchemySkill: e.target.value
                        ? Math.min(100, Math.max(1, Number(e.target.value)))
                        : null,
                    })
                  }
                  className="w-20 px-3 py-1.5 rounded-md border border-[var(--border)]
                    bg-[var(--bg-elevated)] text-[var(--text)] text-sm
                    focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="text-xs text-[var(--text-muted)]">
                  {settings.alchemySkill ? `Level ${settings.alchemySkill}` : "Not set"}
                </span>
              </div>
            </Section>

            {/* Perks */}
            <Section title="Alchemy Perks">
              <div className="flex flex-col gap-2.5">
                {PERKS.map(({ key, label, note, ranks }) =>
                  ranks ? (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text)]">{label}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: ranks }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                updateSettings({
                                  perks: {
                                    ...settings.perks,
                                    [key]:
                                      settings.perks.alchemist === i + 1
                                        ? 0
                                        : (i + 1 as 1|2|3|4|5),
                                  },
                                })
                              }
                              className={[
                                "w-5 h-5 rounded text-xs border transition-colors",
                                (settings.perks.alchemist as number) > i
                                  ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                                  : "border-[var(--border)] text-[var(--text-faint)]",
                              ].join(" ")}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                      {note && (
                        <p className="text-xs text-[var(--text-muted)]">{note}</p>
                      )}
                    </div>
                  ) : (
                    <CheckRow
                      key={key}
                      label={label}
                      note={note}
                      checked={settings.perks[key] as boolean}
                      onChange={(v) =>
                        updateSettings({
                          perks: { ...settings.perks, [key]: v },
                        })
                      }
                    />
                  )
                )}
              </div>
            </Section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckRow({
  label,
  note,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  note?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={[
        "flex items-start gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-default",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 accent-[var(--accent)]"
      />
      <div>
        <span className="text-sm text-[var(--text)]">{label}</span>
        {note && <p className="text-xs text-[var(--text-muted)]">{note}</p>}
      </div>
    </label>
  );
}
