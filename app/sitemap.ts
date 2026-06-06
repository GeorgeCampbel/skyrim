import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import ingredientsData from "@/src/data/ingredients.json";
import effectsData from "@/src/data/effects.json";
import type { Ingredient, Effect } from "@/src/data/types";
import { allValidPairs } from "@/src/lib/alchemy";

const BASE_URL = "https://georgecampbel.github.io/skyrim";
const NOW = new Date().toISOString().split("T")[0];

export default function sitemap(): MetadataRoute.Sitemap {
  const ingredients = ingredientsData as Ingredient[];
  const effects = effectsData as Effect[];

  const urls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: NOW, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/alchemy`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/alchemy/potions`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
  ];

  for (const ing of ingredients) {
    urls.push({
      url: `${BASE_URL}/alchemy/${ing.id}`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const effect of effects) {
    urls.push({
      url: `${BASE_URL}/alchemy/${effect.id}`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  const pairs = allValidPairs(ingredients, effects);
  for (const pair of pairs) {
    const slug = [...pair]
      .map((i) => i.id)
      .sort()
      .join("+");
    urls.push({
      url: `${BASE_URL}/alchemy/${slug}`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return urls;
}
