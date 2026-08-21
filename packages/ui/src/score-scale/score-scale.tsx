import { memo } from "react";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { resolveGrade, DEFAULT_GRADES } from "../score-ring/score-ring.grade";
import { toSegments, toPercent } from "./score-scale.geometry";
import type { ScoreScaleProps } from "./score-scale.types";

// 分档评分尺：整条量程按等级带着色，游标停在 value 所在的位置 —— 表达的是「落在哪一档」。
//
// 为什么不复用 Meter：Meter 画的是**填充长度**（`bg-primary` 的指示条从左端长到 value），
// 那是「占了多少 / 完成了多少」的隐喻，越长越满。评分尺里 36 分左边那截绿色**不属于这个值**，
// 它是量程刻度；用填充条画 36 分，读者接收到的是"进行中、还差一截"，说的是相反的话。
// 结构上也接不上：Meter 的指示条宽度由 Base UI 内联自算、皮肤禁写 width/left/transform
// （meter.tsx:7-8 的几何禁区），MeterProps 也不收 children，叠不进分段与游标。
//
// 等级模型直接从 ScoreRing 借（`../score-ring/score-ring.grade`），不在这里第二次定义：
// 同一份 grades 喂给环和尺必须画出同一套档，评级 SSOT 只能有一处。
//
// RSC 安全：无 hook、无事件、无浏览器 API，几何全是渲染期算术，可直接用在 server component 里。
function ScoreScaleImpl({
  value,
  min = 0,
  max = 100,
  grades = DEFAULT_GRADES,
  size = "md",
  label,
  showGrade = true,
  showRange = false,
  segmentGap = false,
  markers,
  formatValueText,
  className,
  ...rest
}: ScoreScaleProps) {
  const percent = toPercent(value, min, max);
  const segments = toSegments(grades, min, max);
  // 夹紧后再查档：游标已经停在端点，等级就该是端点所在的那一档，否则色带与等级字互相打架。
  // （resolveGrade 的签名不接受空数组 —— 空 grades 时运行期会拿到 undefined，这里显式挡掉。）
  const clamped = min + ((max - min) * percent) / 100;
  const grade = grades.length > 0 ? resolveGrade(clamped, grades) : undefined;
  const toneColor = resolveTone(grade?.tone);

  // 默认 valuetext 念的是**原始 value 与满分**，不是夹紧后的位置：超量程这件事只能靠它交代
  // （aria-valuenow 必须落在 min–max 内，游标也已经被夹住，可见层已经没有地方说"超了"）。
  // 不含任何语言词 —— 等级文字来自调用方的 grades，中文量词请走 formatValueText。
  const valueText = formatValueText
    ? formatValueText({ value, min, max, percent, grade })
    : `${value} / ${max}${grade ? `, ${grade.label}` : ""}`;

  const track = size === "sm" ? "h-1.5" : "h-2.5";
  const cursor = size === "sm" ? "h-3.5 w-1.5" : "h-5 w-2";
  const markerLabels = (markers ?? []).filter((m) => m.label != null);
  const showFooter = showRange || markerLabels.length > 0;

  return (
    <div
      {...rest}
      className={cn("w-full", className)}
      role="meter"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      aria-label={rest["aria-label"] ?? (typeof label === "string" ? label : undefined)}
    >
      {label != null || (showGrade && grade) ? (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
          {label != null ? <span className="text-muted-foreground">{label}</span> : <span />}
          {showGrade && grade ? (
            <span className="font-semibold" style={{ color: toneColor }}>
              {grade.label}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* 几何根在轨道**外面**：游标比轨道高、要两端出头，放进 overflow-hidden 的轨道里会被裁成
          一截；而轨道又必须 overflow-hidden 才能让首尾段吃到 rounded-full 的圆角。 */}
      <div className="relative">
        <div
          className={cn(
            "relative flex w-full overflow-hidden rounded-full bg-track",
            track,
            // 段间缝走 flex gap：段宽是百分比，缝是像素，两者相加超出 100% 时由 flex-shrink
            // 按比例吸收（一条 300px 的尺上分界线偏移 < 1%）。用 margin 则直接把最后一段挤出裁剪区。
            segmentGap && "gap-[2px]",
          )}
        >
          {segments.map((seg) => (
            <div
              key={`${seg.from}-${seg.label}`}
              data-slot="segment"
              className="h-full"
              // 段宽来自 grades 的区间宽度，与 value 无关 —— 这正是它和 Meter 的分界线。
              // 颜色是调用方给的任意 CSS 色（经 resolveTone 补 --color- 前缀），只能走 style。
              style={{ width: `${seg.widthPercent}%`, backgroundColor: resolveTone(seg.tone) }}
            />
          ))}
          {/* 参照线画在轨道**内**：它是"另一个值在量程上的位置"，不出头才不会和游标抢读。
              端点上的参照线被轨道裁掉一半，正好读作贴边。 */}
          {(markers ?? []).map((marker, i) => (
            <div
              key={`marker-${i}-${marker.value}`}
              data-slot="marker"
              className={cn(
                "absolute inset-y-0 w-[2px] -translate-x-1/2",
                marker.tone ? undefined : "bg-foreground",
              )}
              style={{
                left: `${toPercent(marker.value, min, max)}%`,
                backgroundColor: resolveTone(marker.tone),
              }}
              aria-hidden
            />
          ))}
        </div>
        {/* 游标：`bg-foreground` 胶囊 + 一圈 `ring-surface`。
            判据是**明度差**，两个主题各自算一遍（oklch 的 L）：
              浅色 前景 gray-900 L=0.21 vs 色带 *-700 L≈0.50 → ΔL≈0.29；胶囊外那圈 surface(白 L=1)
                   压在色带上再补一道 ΔL≈0.50 的缝，把游标从色带里剥出来。
              深色 前景 gray-50 L=0.985 vs 色带 *-400/500 L≈0.68–0.78 → ΔL≈0.21；ring 换成
                   surface(gray-900 L=0.21)，缝的 ΔL≈0.5，与浅色同构。
            两个 token 都随主题翻面（连 [data-surface="inverse"] 的反色面板也一起翻），所以不存在
            "哪个主题下白游标看不见"这种一侧成立一侧失效的写法 —— 实物那种写死的纯白只在深色卡上立得住。
            issue 提的 hairline 描边这里用不了：它在浅色主题就是 transparent（semantic.css:55），
            描边会在最需要它的那一侧整个消失。 */}
        <div
          data-slot="cursor"
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-surface",
            cursor,
          )}
          // 位置来自 value，与段宽是两个独立的量。已夹进 0–100，不会溢出容器。
          style={{ left: `${percent}%` }}
          aria-hidden
        />
      </div>

      {showFooter ? (
        <div className="relative mt-1 flex h-4 justify-between text-xs text-muted-foreground">
          {showRange ? (
            <>
              <span>{min}</span>
              <span>{max}</span>
            </>
          ) : null}
          {markerLabels.map((marker, i) => (
            <span
              key={`marker-label-${i}-${marker.value}`}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${toPercent(marker.value, min, max)}%` }}
            >
              {marker.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
ScoreScaleImpl.displayName = "ScoreScale";

// 评分尺成组出现（体检报告一屏十几项指标、风控面板一排维度），父级一动就整排重算段宽与游标位置。
// props 全是原语时 React 无法自己 bailout，只能靠 memo —— 与 ScoreRing/Meter 同一处方。
// 内部几何是一遍数组扫描，memo 一挡就整块不跑，无需再叠 useMemo。
export const ScoreScale = memo(ScoreScaleImpl);
ScoreScale.displayName = "ScoreScale";
