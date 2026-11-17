"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Segmented } from "../segmented";
import { Paper, usePaperMode } from "./paper";
import { PaperFigure } from "./paper-figure";
import { FigureStep, ProcessFigure } from "./process-figure";
import { FigRef } from "./fig-ref";
import type { PaperMode, ProcessStep } from "./paper.types";

// 素材：Vaswani et al., "Attention Is All You Need"（arXiv:1706.03762）。
// 图 1 按原文架构图重绘；图 2 的注意力权重是手设的示意数据，不是训练好的模型输出。
// 论文正文保留英文，与原文版式一致。

// ── 图 1：Transformer 架构 ──

const ARCH_STEPS: ProcessStep[] = [
  {
    key: "a",
    label: "Input embedding",
    description: "(a) Tokens are embedded and summed with sinusoidal positional encodings.",
  },
  {
    key: "b",
    label: "Encoder self-attention",
    description:
      "(b) Every position attends to all positions of the previous layer, inside a residual connection and layer normalization.",
  },
  {
    key: "c",
    label: "Feed-forward, ×N",
    description: "(c) Position-wise feed-forward network. With (b) it forms one encoder layer, stacked N = 6 times.",
  },
  {
    key: "d",
    label: "Masked self-attention",
    description: "(d) Decoder self-attention is masked so position i only attends to positions before i.",
  },
  {
    key: "e",
    label: "Encoder–decoder attention",
    description: "(e) Queries come from the decoder; keys and values come from the encoder output.",
  },
  {
    key: "f",
    label: "Output probabilities",
    description: "(f) Feed-forward, linear projection and softmax produce next-token probabilities.",
  },
];

const EDGE =
  "fill-none stroke-muted-foreground [stroke-width:1.3] group-data-[phase=on]/step:stroke-primary";
const FLOW =
  "group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]";
const HEAD = "fill-muted-foreground group-data-[phase=on]/step:fill-primary";
const BOX =
  "stroke-muted-foreground [stroke-width:1.1] group-data-[phase=on]/step:stroke-primary group-data-[phase=on]/step:[stroke-width:2]";
const TEXT = "fill-foreground text-[13px]";
const SMALL = "fill-muted-foreground text-[11px]";

type Dir = "up" | "left" | "right";

/** 一条带箭头的连线：d 画线，(x, y) 是箭头尖。不用 SVG marker，分图里重复渲染也不会撞 id。 */
function Arrow({ d, x, y, dir = "up", flow = true }: { d: string; x: number; y: number; dir?: Dir; flow?: boolean }) {
  const head =
    dir === "up"
      ? `${x},${y} ${x - 3.5},${y + 7} ${x + 3.5},${y + 7}`
      : dir === "left"
        ? `${x},${y} ${x + 7},${y - 3.5} ${x + 7},${y + 3.5}`
        : `${x},${y} ${x - 7},${y - 3.5} ${x - 7},${y + 3.5}`;
  return (
    <>
      <path d={d} className={`${EDGE} ${flow ? FLOW : ""}`} />
      <polygon points={head} className={HEAD} />
    </>
  );
}

function Line({ d, flow = true }: { d: string; flow?: boolean }) {
  return <path d={d} className={`${EDGE} ${flow ? FLOW : ""}`} />;
}

function Block({
  x,
  y,
  h,
  fill,
  lines,
}: {
  x: number;
  y: number;
  h: number;
  fill: string;
  lines: string[];
}) {
  const cx = x + 70;
  const first = y + h / 2 + 4.5 - ((lines.length - 1) * 15) / 2;
  return (
    <>
      <rect x={x} y={y} width={140} height={h} rx={5} className={`${BOX} ${fill}`} />
      {lines.map((line, i) => (
        <text key={line} x={cx} y={first + i * 15} textAnchor="middle" className={TEXT}>
          {line}
        </text>
      ))}
    </>
  );
}

function AddNorm({ x, y }: { x: number; y: number }) {
  return <Block x={x} y={y} h={24} fill="fill-subtle" lines={["Add & Norm"]} />;
}

/** 输入嵌入 + 位置编码（编码器 / 解码器各一份，side 决定「Positional Encoding」写在哪一侧）。 */
function EmbedStack({ cx, label, side }: { cx: number; label: string; side: "left" | "right" }) {
  const wave = side === "left" ? cx - 46 : cx + 46;
  const textX = side === "left" ? cx - 66 : cx + 66;
  const anchor = side === "left" ? "end" : "start";
  return (
    <>
      <Arrow d={`M${cx} 674V658`} x={cx} y={652} />
      <Block x={cx - 70} y={622} h={30} fill="fill-danger-subtle" lines={[label]} />
      <Arrow d={`M${cx} 622V604`} x={cx} y={598} />
      <circle cx={cx} cy={586} r={11} className="fill-bg stroke-muted-foreground [stroke-width:1.2]" />
      <path d={`M${cx - 7} 586H${cx + 7}M${cx} 579V593`} className="fill-none stroke-muted-foreground [stroke-width:1.3]" />
      <circle cx={wave} cy={586} r={13} className="fill-bg stroke-muted-foreground [stroke-width:1.2]" />
      <path d={`M${wave - 10} 586q2.5 -8 5 0t5 0t5 0t5 0`} className="fill-none stroke-muted-foreground [stroke-width:1.3]" />
      <path
        d={side === "left" ? `M${wave + 13} 586H${cx - 11}` : `M${wave - 13} 586H${cx + 11}`}
        className="fill-none stroke-muted-foreground [stroke-width:1.3]"
      />
      <text x={textX} y={582} textAnchor={anchor} className={TEXT}>
        Positional
      </text>
      <text x={textX} y={596} textAnchor={anchor} className={TEXT}>
        Encoding
      </text>
    </>
  );
}

/** 从 ⊕ 往上分成 Q、K、V 三路进注意力块。 */
function Fork({ cx, top }: { cx: number; top: number }) {
  return (
    <>
      <Line d={`M${cx} 575V546`} />
      {[cx - 30, cx, cx + 30].map((x) => (
        <Arrow key={x} d={x === cx ? `M${cx} 546V${top + 7}` : `M${cx} 546H${x}V${top + 7}`} x={x} y={top} />
      ))}
    </>
  );
}

function TransformerArchitecture() {
  return (
    <svg
      viewBox="0 0 600 704"
      role="img"
      aria-label="Transformer architecture: encoder on the left, decoder on the right"
      className="mx-auto block h-auto w-full max-w-[540px]"
    >
      <FigureStep at="b c">
        <rect x={80} y={330} width={180} height={232} rx={10} className="fill-foreground/[0.03] stroke-muted-foreground [stroke-width:1.1]" />
        <text x={72} y={452} textAnchor="end" className={TEXT}>
          N×
        </text>
      </FigureStep>
      <FigureStep at="d e f">
        <rect x={340} y={172} width={180} height={390} rx={10} className="fill-foreground/[0.03] stroke-muted-foreground [stroke-width:1.1]" />
        <text x={528} y={372} className={TEXT}>
          N×
        </text>
      </FigureStep>

      <FigureStep at="a">
        <text x={170} y={690} textAnchor="middle" className={TEXT}>
          Inputs
        </text>
        <EmbedStack cx={170} label="Input Embedding" side="left" />
      </FigureStep>

      <FigureStep at="b">
        <Fork cx={170} top={532} />
        <Arrow d="M170 558H92V462H93" x={100} y={462} dir="right" flow={false} />
        <Block x={100} y={490} h={42} fill="fill-warning-subtle" lines={["Multi-Head", "Attention"]} />
        <Arrow d="M170 490V481" x={170} y={474} />
        <AddNorm x={100} y={450} />
      </FigureStep>

      <FigureStep at="c">
        <Arrow d="M170 450V432" x={170} y={425} />
        <Arrow d="M170 438H92V357H93" x={100} y={357} dir="right" flow={false} />
        <Block x={100} y={385} h={40} fill="fill-info-subtle" lines={["Feed", "Forward"]} />
        <Arrow d="M170 385V376" x={170} y={369} />
        <AddNorm x={100} y={345} />
      </FigureStep>

      <FigureStep at="d">
        <text x={430} y={684} textAnchor="middle" className={TEXT}>
          Outputs
        </text>
        <text x={430} y={699} textAnchor="middle" className={SMALL}>
          (shifted right)
        </text>
        <EmbedStack cx={430} label="Output Embedding" side="right" />
        <Fork cx={430} top={532} />
        <Arrow d="M430 558H508V462H507" x={500} y={462} dir="left" flow={false} />
        <Block x={360} y={490} h={42} fill="fill-warning-subtle" lines={["Masked Multi-Head", "Attention"]} />
        <Arrow d="M430 490V481" x={430} y={474} />
        <AddNorm x={360} y={450} />
      </FigureStep>

      <FigureStep at="e">
        <Line d="M170 345V300H300V415H430" />
        <Arrow d="M430 415V409" x={430} y={402} />
        <Arrow d="M390 415V409" x={390} y={402} />
        <Arrow d="M430 450V432H470V409" x={470} y={402} />
        <Arrow d="M430 440H508V332H507" x={500} y={332} dir="left" flow={false} />
        <Block x={360} y={360} h={42} fill="fill-warning-subtle" lines={["Multi-Head", "Attention"]} />
        <Arrow d="M430 360V351" x={430} y={344} />
        <AddNorm x={360} y={320} />
        <text x={296} y={292} textAnchor="middle" className={SMALL}>
          K, V
        </text>
        <text x={476} y={428} className={SMALL}>
          Q
        </text>
      </FigureStep>

      <FigureStep at="f">
        <Arrow d="M430 320V297" x={430} y={290} />
        <Arrow d="M430 308H508V222H507" x={500} y={222} dir="left" flow={false} />
        <Block x={360} y={250} h={40} fill="fill-info-subtle" lines={["Feed", "Forward"]} />
        <Arrow d="M430 250V241" x={430} y={234} />
        <AddNorm x={360} y={210} />
        <Arrow d="M430 210V160" x={430} y={153} />
        <Block x={360} y={125} h={28} fill="fill-success-subtle" lines={["Linear"]} />
        <Arrow d="M430 125V115" x={430} y={108} />
        <Block x={360} y={80} h={28} fill="fill-warning-subtle" lines={["Softmax"]} />
        <Arrow d="M430 80V67" x={430} y={60} />
        <text x={430} y={34} textAnchor="middle" className={TEXT}>
          Output
        </text>
        <text x={430} y={50} textAnchor="middle" className={TEXT}>
          Probabilities
        </text>
      </FigureStep>
    </svg>
  );
}

/** 论文是英文：图注前缀和自动引用用英文，步骤按钮等控件仍跟随界面语言。 */
const EN_LABELS = { figure: "Figure", separator: ": " };

/** 论文正文的排版（示例自带，P0 的 Paper 只管状态与形态，不接管正文样式）。 */
function Body({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="mx-auto max-w-[680px] text-[15px] leading-relaxed [&_p]:m-0 [&_p]:text-justify [&_p]:hyphens-auto [&_p+p]:indent-6">
      {children}
    </div>
  );
}

function ModeSwitch() {
  const [mode, setMode] = usePaperMode();
  return (
    <div className="mb-4 flex justify-end font-sans print:hidden">
      <Segmented
        size="sm"
        value={mode}
        onValueChange={(v) => setMode(v as PaperMode)}
        items={[
          { value: "read", label: "阅读" },
          { value: "print", label: "打印预览" },
        ]}
      />
    </div>
  );
}

function ArchitectureDemo({ id = "transformer", defaultMode = "read" }: { id?: string; defaultMode?: PaperMode }) {
  return (
    <Paper defaultMode={defaultMode} labels={EN_LABELS} className="w-full">
      <ModeSwitch />
      <Body>
        <p>
          <b>Encoder.</b> Input tokens are first embedded and summed with positional encodings{" "}
          <FigRef to={id} state="a">Figure 1(a)</FigRef>. Each of the N = 6 encoder layers has a multi-head
          self-attention sub-layer <FigRef to={id} state="b">Figure 1(b)</FigRef> and a position-wise
          feed-forward network <FigRef to={id} state="c">Figure 1(c)</FigRef>.
        </p>
        <p>
          <b>Decoder.</b> Its self-attention is masked <FigRef to={id} state="d">Figure 1(d)</FigRef>, a
          further sub-layer attends over the encoder output <FigRef to={id} state="e">Figure 1(e)</FigRef>,
          and a linear layer with softmax yields next-token probabilities{" "}
          <FigRef to={id} state="f">Figure 1(f)</FigRef>. The whole model is shown in{" "}
          <FigRef to={id} state="all" />.
        </p>
        <ProcessFigure
          id={id}
          steps={ARCH_STEPS}
          caption="The Transformer – model architecture."
          overviewDescription="All stages shown. In print, stages (a)–(f) appear as sub-figures."
        >
          <TransformerArchitecture />
        </ProcessFigure>
      </Body>
    </Paper>
  );
}

// ── 图 2：缩放点积注意力（参数图） ──

const TOKENS = ["The", "animal", "didn’t", "cross", "the", "street", "because", "it", "was", "too", "tired", "."];
/** 查询词 “it” 对每个词的相似度（手设，已按方差 1 归一）。 */
const SCORES = [-0.1, 1.8, -0.6, -0.2, -0.25, 0.9, -0.3, 0.55, -0.4, -0.5, 0.8, -1];

interface AttentionState {
  dk: number;
  scaled: boolean;
}

const ATTENTION_STATES: Record<string, AttentionState> = {
  scaled64: { dk: 64, scaled: true },
  raw4: { dk: 4, scaled: false },
  raw512: { dk: 512, scaled: false },
  scaled512: { dk: 512, scaled: true },
};

function softmax(state: AttentionState) {
  const f = state.scaled ? 1 : Math.sqrt(state.dk);
  const logits = SCORES.map((s) => s * f);
  const max = Math.max(...logits);
  const e = logits.map((v) => Math.exp(v - max));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}

function AttentionBars({ state }: { state: AttentionState }) {
  const w = softmax(state);
  const x = (i: number) => 30 + i * 50;
  return (
    <svg viewBox="0 0 600 150" role="img" aria-label="Softmax weights from the query “it” to every token" className="block h-auto w-full">
      <line x1={8} x2={592} y1={100.5} y2={100.5} className="stroke-border" />
      {w.map((p, i) => {
        const h = Math.max(1, p * 84);
        return (
          <g key={TOKENS[i] + i}>
            <rect x={x(i) - 13} y={100 - h} width={26} height={h} className="fill-primary transition-all duration-300 motion-reduce:transition-none" />
            {p >= 0.06 ? (
              <text x={x(i)} y={95 - h} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {Math.round(p * 100)}%
              </text>
            ) : null}
            <text
              x={x(i)}
              y={122}
              textAnchor="middle"
              className={i === 7 ? "fill-warning text-[14px] font-bold" : "fill-foreground text-[14px]"}
            >
              {TOKENS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AttentionDemo() {
  return (
    <Paper labels={EN_LABELS} className="w-full">
      <Body>
        <p>
          {/* 引用不写死图号：单独演示时这是图 1，放进整篇论文里是图 2，交给 FigRef 自动取号。 */}
          For small d<sub>k</sub> scaling makes little difference (<FigRef to="attention" state="raw4" />, d
          <sub>k</sub> = 4). For large d<sub>k</sub> the dot products grow large in magnitude and push the softmax into
          regions with extremely small gradients: unscaled, nearly all weight collapses onto one key (
          <FigRef to="attention" state="raw512" />, unscaled). Dividing by √d<sub>k</sub> restores a usable
          distribution (<FigRef to="attention" state="scaled512" />, scaled).
        </p>
        <PaperFigure
          id="attention"
          states={ATTENTION_STATES}
          caption="Scaled dot-product attention for the query “it”. Weights are illustrative, computed from hand-set similarity scores."
          describe={(s) => `d_k = ${s.dk}, ${s.scaled ? "scaled by 1/√d_k" : "unscaled"}; largest weight ${Math.max(...softmax(s)).toFixed(2)}.`}
          controls={(fig) => (
            <>
              <span>d<sub>k</sub></span>
              {[1, 4, 16, 64, 512].map((dk) => (
                <Button
                  key={dk}
                  size="xs"
                  variant={fig.state.dk === dk ? "solid" : "ghost"}
                  aria-pressed={fig.state.dk === dk}
                  onClick={() => fig.setState({ ...fig.state, dk })}
                  className="tabular-nums"
                >
                  {dk}
                </Button>
              ))}
              <Button
                size="xs"
                variant="outline"
                aria-pressed={fig.state.scaled}
                onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}
              >
                {fig.state.scaled ? "已缩放 ÷√dₖ" : "未缩放"}
              </Button>
            </>
          )}
        >
          {(state) => <AttentionBars state={state} />}
        </PaperFigure>
      </Body>
    </Paper>
  );
}

const archCode = `<Paper>
  <p>
    … a multi-head self-attention sub-layer
    <FigRef to={id} state="b">Figure 1(b)</FigRef> …
  </p>
  <ProcessFigure
    id="transformer"
    steps={[
      { key: "a", label: "Input embedding", description: "(a) …" },
      { key: "b", label: "Encoder self-attention", description: "(b) …" },
      // …
    ]}
    caption="The Transformer – model architecture."
  >
    <svg viewBox="0 0 600 704">
      <FigureStep at="a">{/* 输入嵌入 + 位置编码 */}</FigureStep>
      <FigureStep at="b">
        <rect className="stroke-muted-foreground group-data-[phase=on]/step:stroke-primary" … />
      </FigureStep>
      <FigureStep at="b c">{/* 编码器外框，属于两步 */}</FigureStep>
    </svg>
  </ProcessFigure>
</Paper>`;

const attentionCode = `<PaperFigure
  id="attention"
  states={{
    scaled64: { dk: 64, scaled: true },
    raw512: { dk: 512, scaled: false },
    scaled512: { dk: 512, scaled: true },
  }}
  caption="Scaled dot-product attention for the query “it”."
  describe={(s) => \`d_k = \${s.dk}, \${s.scaled ? "scaled" : "unscaled"}\`}
  controls={(fig) => (
    <Button onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}>
      切换缩放
    </Button>
  )}
>
  {(state) => <AttentionBars state={state} />}
</PaperFigure>

<FigRef to="attention" state="raw512">Figure 2, unscaled</FigRef>`;

const printCode = `<Paper mode="print">
  <ProcessFigure
    id="transformer"
    steps={steps}
    caption="…"
    // 默认：主图画 "all"，每一步展开一张分图
    // printState="e" printSubfigures={["b", "e"]} 可以改
  >
    …
  </ProcessFigure>
</Paper>`;

export const paperShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "流程图：正文引用驱动讲解",
      description:
        "素材是《Attention Is All You Need》的架构图。点正文里的 Figure 1(b) 这类引用，图会切到那一步，必要时滚进视野并描边一下。当前步高亮，讲过的半透明，没讲到的很淡但不隐藏，读者始终看得到整张图。图下方可以逐步点、上一步 / 下一步、自动播放。右上角切到「打印预览」看投稿形态。",
      code: archCode,
      render: () => <ArchitectureDemo />,
    },
    {
      title: "参数图：预设加连续调节",
      description:
        "状态不只是步骤，也可以是一组参数。正文引用只认有名字的预设，控件用 setState 直接给值。这里演示缩放点积注意力：不除以 √dₖ 时，dₖ 越大，softmax 越集中到一个词上。权重是手设的示意数据。",
      code: attentionCode,
      render: () => <AttentionDemo />,
    },
    {
      title: "打印形态",
      description:
        "投稿用的 PDF 形态：每张图定格在打印态，控件不渲染，引用变回正文文字，流程图的每一步展开成 (a)(b)(c)… 分图。浏览器真的打印时，Paper 会在打印前自动切到这个形态，打印完再切回。",
      code: printCode,
      render: () => <ArchitectureDemo id="transformer-print" defaultMode="print" />,
    },
  ],
  controls: [
    { prop: "mode", type: "select", options: ["read", "print"], defaultValue: "read", label: "形态" },
  ],
  states: [
    { name: "阅读", render: () => <ArchitectureDemo /> },
    { name: "打印", render: () => <ArchitectureDemo id="transformer-print" defaultMode="print" /> },
    { name: "参数图", render: () => <AttentionDemo /> },
  ],
  renderWithProps: (p) => (
    <ArchitectureDemo key={String(p.mode)} id="transformer-playground" defaultMode={p.mode as PaperMode} />
  ),
  toCode: (p) =>
    `<Paper${p.mode === "print" ? ' mode="print"' : ""}>\n  <ProcessFigure id="transformer" steps={steps} caption="…">\n    <TransformerArchitecture />\n  </ProcessFigure>\n</Paper>`,
};
