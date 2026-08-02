import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { DURATIONS, EASINGS, MOTION_FREQUENCY } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code, Note, Panel } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).motion;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

const TONE_CLASS = {
  danger: "text-danger",
  warning: "text-warning",
  neutral: "text-foreground",
  success: "text-success",
} as const;

export default function MotionPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section
        title={content.frequencyTitle}
        desc={content.frequencyDescription}
      >
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">{content.frequency}</th>
                <th className="px-4 py-2.5 font-medium">{content.scenario}</th>
                <th className="px-4 py-2.5 font-medium">{content.verdict}</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {MOTION_FREQUENCY.map((r) => (
                <tr key={r.freq} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{r.freq}</td>
                  <td className="px-4 py-3 text-muted">{r.example}</td>
                  <td className={`px-4 py-3 font-medium whitespace-nowrap ${TONE_CLASS[r.tone]}`}>
                    {r.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Note>
            {content.commandNote}
          </Note>
        </div>
      </Section>

      <Section
        title={content.easingTitle}
        desc={content.easingDescription}
      >
        <div className="space-y-3">
          {EASINGS.map((e) => (
            <Panel key={e.cssVar}>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h3 className="text-sm font-medium">{e.label}</h3>
                <Code>{e.utility === "—" ? e.cssVar : e.utility}</Code>
                <span className="font-mono text-[0.7rem] text-muted">{e.curve}</span>
              </div>

              {/* 手感演示：悬停轨道 → 填充条以该曲线本身铺满。
                  用 scaleX 而不是移动圆点：只走 GPU 合成，且不必知道轨道有多宽。 */}
              <div className="group mt-3 h-2.5 overflow-hidden rounded-full bg-surface-hover">
                <span
                  aria-hidden
                  className="block h-full origin-left scale-x-0 rounded-full bg-primary transition-transform duration-500 group-hover:scale-x-100"
                  style={{ transitionTimingFunction: e.curve }}
                />
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-muted">{e.use}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-4">
          <Note>
            {content.easeInNote}
          </Note>
        </div>
      </Section>

      <Section title={content.durationTitle} desc={content.durationDescription}>
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Token</th>
                <th className="px-4 py-2.5 font-medium">{content.duration}</th>
                <th className="px-4 py-2.5 font-medium">{content.utility}</th>
                <th className="px-4 py-2.5 font-medium">{content.usedFor}</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {DURATIONS.map((d) => (
                <tr key={d.name} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{d.name}</td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap text-muted">{d.ms}ms</td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted">
                    {d.utility}
                  </td>
                  <td className="px-4 py-3 text-muted">{d.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={content.pressTitle} desc={content.pressDescription}>
        <Panel>
          <p className="text-sm leading-relaxed text-muted">
            {content.pressBody}
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border bg-bg p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
            <span className="text-muted">{`// ${content.motionComment}`}</span>
            {"\n"}
            {"import { pressable } from \"@hulianui/ui\";"}
            {"\n"}
            {"<m.button whileTap={pressable.whileTap} transition={pressable.transition} />"}
            {"\n\n"}
            <span className="text-muted">{`// ${content.cssComment}`}</span>
            {"\n"}
            {"import { pressableClass } from \"@hulianui/ui\";"}
            {"\n"}
            {"<button className={cn(\"…\", pressableClass)} />"}
          </pre>
          <div className="mt-4">
            <Note>
              {content.pressNote}
            </Note>
          </div>
        </Panel>
      </Section>

      <Section title={content.originTitle} desc={content.originDescription}>
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{`/* ${content.originComment} */`}</span>
          {"\n"}
          {"<Popup className=\"origin-[var(--transform-origin)] data-[starting-style]:scale-95 …\" />"}
        </pre>
        <div className="mt-4">
          <Note>
            {content.originNote}
          </Note>
        </div>
      </Section>

      <Section title={content.accessibilityTitle} desc={content.accessibilityDescription}>
        <Note>
          {content.accessibilityNote}
        </Note>
      </Section>
    </div>
  );
}
