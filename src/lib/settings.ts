import type { DLCSource } from "@/src/data/types";

export interface PerkSettings {
  alchemist: 0 | 1 | 2 | 3 | 4 | 5;
  physician: boolean;
  benefactor: boolean;
  poisoner: boolean;
  purity: boolean;
  greenThumb: boolean;
  concentratedPoison: boolean;
}

export interface AppSettings {
  theme: "nordic" | "parchment" | "system";
  dlc: Record<Exclude<DLCSource, "base">, boolean>;
  alchemySkill: number | null;
  perks: PerkSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  dlc: {
    dawnguard: true,
    dragonborn: true,
    hearthfire: true,
    anniversary: true,
  },
  alchemySkill: null,
  perks: {
    alchemist: 0,
    physician: false,
    benefactor: false,
    poisoner: false,
    purity: false,
    greenThumb: false,
    concentratedPoison: false,
  },
};

const STORAGE_KEY = "skyrim-settings";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
