import Link from "next/link";

const tools = [
  {
    href: "/skyrim/alchemy",
    title: "Potion Mixer",
    description:
      "Find potions from ingredients you have, or discover which ingredients produce a desired effect.",
    badge: "Available",
  },
  {
    href: "#",
    title: "Enchanting Calculator",
    description: "Soul gem + skill + perks → enchantment strength and value.",
    badge: "Coming soon",
  },
  {
    href: "#",
    title: "Trainer Finder",
    description: "Every skill trainer — level cap, location, prerequisites.",
    badge: "Coming soon",
  },
  {
    href: "#",
    title: "Shout Tracker",
    description: "All 20 shouts with word wall locations. Check them off as you find them.",
    badge: "Coming soon",
  },
  {
    href: "#",
    title: "Character Generator",
    description: "Roll a random character concept — race, archetype, skill focus, and a starting blurb.",
    badge: "Coming soon",
  },
];

export default function Home() {
  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">
          Skyrim Tools
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Fast reference tools. Pick what you need.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => {
          const isAvailable = tool.badge === "Available";
          const inner = (
            <div
              className={[
                "rounded-lg border p-5 flex flex-col gap-2 transition-colors h-full",
                isAvailable
                  ? "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
                  : "border-[var(--border-muted)] bg-[var(--bg-surface)] opacity-50",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-[var(--text)]">{tool.title}</span>
                <span
                  className={[
                    "text-xs px-2 py-0.5 rounded-full shrink-0",
                    isAvailable
                      ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent-dim)]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-faint)] border border-[var(--border-muted)]",
                  ].join(" ")}
                >
                  {tool.badge}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {tool.description}
              </p>
            </div>
          );

          return isAvailable ? (
            <Link href={tool.href} key={tool.title} className="block">
              {inner}
            </Link>
          ) : (
            <div key={tool.title}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
