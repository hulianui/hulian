import { manifest, CATEGORIES, componentMeta } from "../../lib/manifest";
import { DOCS_LOCALE } from "../../lib/docs-locale";
import { ComponentQuickJump } from "../../components/component-quick-jump";
import { ComponentCard } from "../../components/component-card";

export default function ComponentsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header>
        <h1 className="text-2xl font-semibold">{DOCS_LOCALE === "en" ? "Components" : "组件"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {DOCS_LOCALE === "en"
            ? "Search the complete HulianUI component catalog."
            : "瑚琏吸取式聚合组件库 · 博采众长"}
        </p>
      </header>

      <ComponentQuickJump placement="catalog" />

      {CATEGORIES.map((cat) => {
        const catItems = manifest.filter((m) => m.category === cat.key);
        if (catItems.length === 0) return null;
        const categoryLabel = componentMeta(catItems[0]).categoryLabel;
        return (
          <section key={cat.key} id={cat.key} className="scroll-mt-24 space-y-6">
            <h2 className="text-base font-semibold text-foreground">
              {categoryLabel}
              <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">
                {catItems.length}
              </span>
            </h2>
            {cat.groups.map((g) => {
              const items = catItems.filter((m) => m.group === g.key);
              if (items.length === 0) return null;
              const groupLabel = componentMeta(items[0]).groupLabel;
              return (
                <div key={g.key} className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {groupLabel}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((m) => (
                      <ComponentCard
                        key={m.slug}
                        slug={m.slug}
                        name={m.name}
                        description={componentMeta(m).description}
                        categoryKey={cat.key}
                        animated={m.tags?.includes("animated")}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
