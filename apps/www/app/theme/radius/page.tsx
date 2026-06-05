import type { Metadata } from "next";
import { RADIUS_TOKEN, RADIUS_SCALE } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";

export const metadata: Metadata = { title: "圆角 Radius · 瑚琏 Hulian" };

export default function RadiusPage() {
  return (
    <div>
      <DocHeader
        title="圆角"
        en="Radius"
        lede={
          <>
            瑚琏的基准圆角是单一 token <Code>--radius = {RADIUS_TOKEN.rem}</Code>（
            {RADIUS_TOKEN.px}px）。组件统一用 <Code>rounded-[var(--radius)]</Code>，改一处即全站同步。
          </>
        }
      />

      <Section title="基准 token">
        <div className="flex items-center gap-5 rounded-[var(--radius)] border border-border bg-surface p-5">
          <span
            className="size-20 shrink-0 border border-border bg-surface-hover"
            style={{ borderRadius: RADIUS_TOKEN.rem }}
            aria-hidden
          />
          <div>
            <Code>--radius</Code>
            <p className="mt-1 font-mono text-sm text-muted">
              {RADIUS_TOKEN.rem} · {RADIUS_TOKEN.px}px
            </p>
          </div>
        </div>
      </Section>

      <Section title="完整阶梯" desc="从细微到全圆，按真实曲率绘制。">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RADIUS_SCALE.map((r) => (
            <div key={r.name} className="text-center">
              <span
                className="mx-auto block size-20 border border-border bg-surface-hover"
                style={{ borderRadius: r.rem }}
                aria-hidden
              />
              <span className="mt-2 block truncate font-mono text-xs text-foreground">
                {r.name.replace("rounded-", "")}
              </span>
              <span className="block font-mono text-[0.65rem] text-muted">{r.rem}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
