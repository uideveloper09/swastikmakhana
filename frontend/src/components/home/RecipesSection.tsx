import { T } from "@/lib/theme";

const RECIPES = [
  {
    title: "Makhana Kheer",
    desc: "A festive classic — roasted makhana simmered in cardamom milk.",
    time: "25 min",
    emoji: "🍮",
  },
  {
    title: "Spiced Makhana Chaat",
    desc: "Toss with onion, tomato, chutney and a squeeze of lemon.",
    time: "10 min",
    emoji: "🥗",
  },
  {
    title: "Caramel Makhana",
    desc: "Sweet crunch coated in golden caramel — perfect for gifting.",
    time: "15 min",
    emoji: "🍯",
  },
];

export function RecipesSection() {
  return (
    <section id="recipes" className="bg-linen py-16 sm:py-24">
      <div className="site-container">
        <div className="text-center">
          <p className="section-label">From Our Kitchen</p>
          <h2 className="section-heading mx-auto mt-2">Makhana Recipes</h2>
          <div className="accent-divider mx-auto mt-4 w-16" />
          <p className="section-subheading mx-auto">
            Simple, delicious ways to enjoy Swastik Makhana every day.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {RECIPES.map((recipe) => (
            <div key={recipe.title} className="card-premium group overflow-hidden">
              <div
                className="flex h-40 items-center justify-center text-5xl transition group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(12,74,78,0.08) 0%, rgba(232,168,56,0.14) 100%)`,
                }}
              >
                {recipe.emoji}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-forest">
                    {recipe.title}
                  </h3>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: T.primary }}
                  >
                    {recipe.time}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textMuted }}>
                  {recipe.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
