import type { Metadata } from "next";
import { DURATIONS, EASINGS, MOTION_FREQUENCY } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code, Note, Panel } from "../_components/doc-kit";

export const metadata: Metadata = { title: "动效 Motion · 瑚琏 Hulian" };

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
        title="动效"
        en="Motion"
        lede={
          <>
            动效不是装饰，是<strong className="text-foreground">对操作的回应</strong>
            。瑚琏把缓动曲线与时长收敛成 token，让 <Code>ease-out</Code> 工具类和 motion 驱动的动画
            走同一条曲线 —— 不统一的库会让人说不出哪里怪，只觉得「有的地方脆、有的地方糊」。
          </>
        }
      />

      <Section
        title="先问：该不该动"
        desc="按用户一天看到它多少次决定，而不是按好不好看。高频动作上的动画只会让人觉得软件慢。"
      >
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">频率</th>
                <th className="px-4 py-2.5 font-medium">典型场景</th>
                <th className="px-4 py-2.5 font-medium">结论</th>
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
            瑚琏的 <Code>Command</Code> 命令面板刻意没有缩放进场、只留 150ms 淡入 —— ⌘K
            是键盘高频入口，位移进场会让每一次唤起都慢半拍。
          </Note>
        </div>
      </Section>

      <Section
        title="缓动曲线"
        desc="悬停任意一行的轨道即可对比手感。CSS 内置的 ease-out 太弱，瑚琏统一换成更果断的曲线。"
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
            <strong className="text-foreground">不要用 ease-in。</strong>{" "}
            它开头慢，而开头正是用户注视最紧的那一刻 —— 同样 200ms，ease-in 会显得比 ease-out
            迟钝。瑚琏刻意没有覆盖 Tailwind 的 <Code>--ease-in</Code>，就是为了不给它背书。
          </Note>
        </div>
      </Section>

      <Section title="时长" desc="界面动效一律控制在 300ms 内。180ms 的下拉比 400ms 的「感觉」响应快得多。">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Token</th>
                <th className="px-4 py-2.5 font-medium">时长</th>
                <th className="px-4 py-2.5 font-medium">工具类</th>
                <th className="px-4 py-2.5 font-medium">用于</th>
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

      <Section title="按压反馈" desc="任何可按下的元素都必须对按压有即时回应，否则界面像没听见。">
        <Panel>
          <p className="text-sm leading-relaxed text-muted">
            按下缩到 <Code>0.97</Code>（大面积卡片用 <Code>0.99</Code>，因为 scale
            会连带缩放子元素，整卡缩 3% 会像跳了一下）。两种接法：
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border bg-bg p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
            <span className="text-muted">{"// 已经在用 motion 的组件"}</span>
            {"\n"}
            {"import { pressable } from \"@hulianui/ui\";"}
            {"\n"}
            {"<m.button whileTap={pressable.whileTap} transition={pressable.transition} />"}
            {"\n\n"}
            <span className="text-muted">{"// 不想引 motion 运行时 —— 纯 CSS 平替，同手感"}</span>
            {"\n"}
            {"import { pressableClass } from \"@hulianui/ui\";"}
            {"\n"}
            {"<button className={cn(\"…\", pressableClass)} />"}
          </pre>
          <div className="mt-4">
            <Note>
              <Code>pressableClass</Code> 自带一份完整的 transition-property 列表（含常见颜色/阴影项），
              请放在 <Code>cn()</Code> 末尾<strong className="text-foreground">替换掉</strong>原有的{" "}
              <Code>transition-colors</Code> —— 两者并列时 tailwind-merge 只保留后写的那个，先写的会被整条丢弃。
            </Note>
          </div>
        </Panel>
      </Section>

      <Section title="浮层从触发器长出" desc="锚定在触发器上的浮层，应该从触发器的方向展开，而不是从自己中心。">
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{"/* Base UI 已把原点算好挂在 Positioner 上，接一下即可 */"}</span>
          {"\n"}
          {"<Popup className=\"origin-[var(--transform-origin)] data-[starting-style]:scale-95 …\" />"}
        </pre>
        <div className="mt-4">
          <Note>
            例外是<strong className="text-foreground">对话框</strong>（Dialog / AlertDialog /
            Modal）—— 它们不锚定任何触发器，居中出现才对，保持默认的 <Code>transform-origin: center</Code>。
            另外任何进场都不要从 <Code>scale(0)</Code> 起：现实里没有东西从「无」变出来，
            从 0.95 起配合透明度才自然。
          </Note>
        </div>
      </Section>

      <Section title="无障碍" desc="减少动效不等于没有动效。">
        <Note>
          <Code>prefers-reduced-motion</Code> 下保留有助理解的透明度与颜色过渡，去掉位移类动画。
          库内组件已内建 <Code>motion-reduce:</Code> 处理，消费方自写动效时请照此对齐。
        </Note>
      </Section>
    </div>
  );
}
