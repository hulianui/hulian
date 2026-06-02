"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { manifest, CATEGORIES } from "../lib/manifest";

export function ComponentTree() {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {CATEGORIES.map((cat) => {
        const items = manifest.filter((m) => m.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key}>
            <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted">
              {cat.label}
            </h3>
            <ul className="space-y-0.5">
              {items.map((m) => {
                const href = `/components/${m.slug}`;
                const active = pathname === href;
                return (
                  <li key={m.slug}>
                    <Link
                      href={href}
                      className={`flex items-center justify-between rounded-[var(--radius)] px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-surface-hover font-medium text-foreground"
                          : "text-muted hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      {m.name}
                      {m.status === "new" && (
                        <span className="rounded border border-primary px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          new
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
