import type { Metadata } from "next";
import {
  SEMANTIC_GROUPS,
  CHART_COLORS,
  GRAY_SCALE,
  type SemanticColor,
} from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";

export const metadata: Metadata = { title: "颜色 Color · 瑚琏 Hulian" };

// 棋盘格底：不透明色完全遮住它，只有 transparent 的令牌（如 hairline 在浅色主题）会露出格子，
// 让「这个色现在是透明的」在色卡上就看得见，而不是伪装成白色。
const CHECKER = {
  backgroundImage:
    "linear-gradient(45deg,var(--color-surface-hover) 25%,transparent 25%,transparent 75%,var(--color-surface-hover) 75%),linear-gradient(45deg,var(--color-surface-hover) 25%,transparent 25%,transparent 75%,var(--color-surface-hover) 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 4px 4px",
} as const;

function SwatchRow({ c }: { c: SemanticColor }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className="size-10 shrink-0 overflow-hidden rounded-[var(--radius)] border border-border"
        style={CHECKER}
        aria-hidden
      >
        <span className="block size-full" style={{ background: `var(--${c.token})` }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium">{c.label}</span>
          <Code>--{c.token}</Code>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          亮 <span className="font-mono">{c.light}</span> · 暗{" "}
          <span className="font-mono">{c.dark}</span>
        </p>
        {c.note ? <p className="mt-1 text-xs leading-relaxed text-warning">{c.note}</p> : null}
      </div>
      {c.fg ? (
        <span
          className="hidden shrink-0 rounded-[var(--radius)] px-3 py-1.5 text-xs font-medium sm:block"
          style={{ background: `var(--${c.token})`, color: `var(--${c.fg})` }}
        >
          前景示意
        </span>
      ) : null}
    </div>
  );
}

export default function ColorPage() {
  return (
    <div>
      <DocHeader
        title="颜色"
        en="Color"
        lede={
          <>
            组件只消费<strong className="text-foreground">语义色</strong>（按用途命名），它们在亮/暗主题下映射到不同的原始色。
            因此切主题只换值、不换类名。
          </>
        }
      />

      {SEMANTIC_GROUPS.map((g) => (
        <Section key={g.title} title={g.title}>
          <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface px-5">
            {g.colors.map((c) => (
              <SwatchRow key={c.token} c={c} />
            ))}
          </div>
        </Section>
      ))}

      <Section
        title="图表分类色"
        desc={<>数据序列专用，SVG 直接 var() 消费，明暗各自调亮度以保对比。</>}
      >
        <div className="flex flex-wrap gap-3">
          {CHART_COLORS.map((t, i) => (
            <div key={t} className="text-center">
              <span
                className="block size-16 rounded-[var(--radius)] border border-border"
                style={{ background: `var(--${t})` }}
                aria-hidden
              />
              <span className="mt-1.5 block font-mono text-xs text-muted">{i + 1}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="原始灰阶"
        desc={<>底层调色盘（<Code>primitives.css</Code>），明暗共用、不随主题变。语义色由它们派生。</>}
      >
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <div className="flex">
            {GRAY_SCALE.map((g) => (
              <div key={g} className="flex-1" style={{ background: `var(--${g})` }} aria-hidden>
                <div className="h-14" />
              </div>
            ))}
          </div>
          <div className="flex bg-surface">
            {GRAY_SCALE.map((g) => (
              <span
                key={g}
                className="flex-1 py-1 text-center font-mono text-[0.6rem] text-muted"
              >
                {g.replace("gray-", "")}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
