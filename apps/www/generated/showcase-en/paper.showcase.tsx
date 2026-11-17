"use client";
import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Segmented } from "../../../../packages/ui/src/segmented";
import { Slider } from "../../../../packages/ui/src/slider";
import { Paper, usePaperMode } from "../../../../packages/ui/src/paper/paper";
import { PaperFigure } from "../../../../packages/ui/src/paper/paper-figure";
import { FigureStep, ProcessFigure } from "../../../../packages/ui/src/paper/process-figure";
import { FigRef } from "../../../../packages/ui/src/paper/fig-ref";
import { EqRef } from "../../../../packages/ui/src/paper/eq-ref";
import { FigureRaster } from "../../../../packages/ui/src/paper/figure-raster";
import { PaperPresenter } from "../../../../packages/ui/src/paper/paper-presenter";
import { usePaperExport } from "../../../../packages/ui/src/paper/paper-export";
import { PaperHeader } from "../../../../packages/ui/src/paper/paper-header";
import { Bibliography, Cite } from "../../../../packages/ui/src/paper/cite";
import { usePaperTerm } from "../../../../packages/ui/src/paper/paper-term";
import { PaperEquation } from "../../../../packages/ui/src/paper/paper-equation";
import type { FigureRasterProps, PaperMode, ProcessStep } from "../../../../packages/ui/src/paper/paper.types";
const ARCH_STEPS: ProcessStep[] = [
    {
        key: "a",
        label: "Input embedding",
        description: "(a) Tokens are embedded and summed with sinusoidal positional encodings.",
    },
    {
        key: "b",
        label: "Encoder self-attention",
        description: "(b) Every position attends to all positions of the previous layer, inside a residual connection and layer normalization.",
    },
    {
        key: "c",
        label: "Feed-forward, \u00D7N",
        description: "(c) Position-wise feed-forward network. With (b) it forms one encoder layer, stacked N = 6 times.",
    },
    {
        key: "d",
        label: "Masked self-attention",
        description: "(d) Decoder self-attention is masked so position i only attends to positions before i.",
    },
    {
        key: "e",
        label: "Encoder\u2013decoder attention",
        description: "(e) Queries come from the decoder; keys and values come from the encoder output.",
    },
    {
        key: "f",
        label: "Output probabilities",
        description: "(f) Feed-forward, linear projection and softmax produce next-token probabilities.",
    },
];
const EDGE = "fill-none stroke-muted-foreground [stroke-width:1.3] group-data-[phase=on]/step:stroke-primary";
const FLOW = "group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]";
const HEAD = "fill-muted-foreground group-data-[phase=on]/step:fill-primary";
const BOX = "stroke-muted-foreground [stroke-width:1.1] group-data-[phase=on]/step:stroke-primary group-data-[phase=on]/step:[stroke-width:2]";
const TEXT = "fill-foreground text-[13px]";
const SMALL = "fill-muted-foreground text-[11px]";
type Dir = "up" | "left" | "right";
function Arrow({ d, x, y, dir = "up", flow = true }: {
    d: string;
    x: number;
    y: number;
    dir?: Dir;
    flow?: boolean;
}) {
    const head = dir === "up"
        ? `${x},${y} ${x - 3.5},${y + 7} ${x + 3.5},${y + 7}`
        : dir === "left"
            ? `${x},${y} ${x + 7},${y - 3.5} ${x + 7},${y + 3.5}`
            : `${x},${y} ${x - 7},${y - 3.5} ${x - 7},${y + 3.5}`;
    return (<>
      <path d={d} className={`${EDGE} ${flow ? FLOW : ""}`}/>
      <polygon points={head} className={HEAD}/>
    </>);
}
function Line({ d, flow = true }: {
    d: string;
    flow?: boolean;
}) {
    return <path d={d} className={`${EDGE} ${flow ? FLOW : ""}`}/>;
}
function Block({ x, y, h, fill, lines, }: {
    x: number;
    y: number;
    h: number;
    fill: string;
    lines: string[];
}) {
    const cx = x + 70;
    const first = y + h / 2 + 4.5 - ((lines.length - 1) * 15) / 2;
    return (<>
      <rect x={x} y={y} width={140} height={h} rx={5} className={`${BOX} ${fill}`}/>
      {lines.map((line, i) => (<text key={line} x={cx} y={first + i * 15} textAnchor="middle" className={TEXT}>
          {line}
        </text>))}
    </>);
}
function AddNorm({ x, y }: {
    x: number;
    y: number;
}) {
    return <Block x={x} y={y} h={24} fill="fill-subtle" lines={["Add & Norm"]}/>;
}
function EmbedStack({ cx, label, side }: {
    cx: number;
    label: string;
    side: "left" | "right";
}) {
    const wave = side === "left" ? cx - 46 : cx + 46;
    const textX = side === "left" ? cx - 66 : cx + 66;
    const anchor = side === "left" ? "end" : "start";
    return (<>
      <Arrow d={`M${cx} 674V658`} x={cx} y={652}/>
      <Block x={cx - 70} y={622} h={30} fill="fill-danger-subtle" lines={[label]}/>
      <Arrow d={`M${cx} 622V604`} x={cx} y={598}/>
      <circle cx={cx} cy={586} r={11} className="fill-bg stroke-muted-foreground [stroke-width:1.2]"/>
      <path d={`M${cx - 7} 586H${cx + 7}M${cx} 579V593`} className="fill-none stroke-muted-foreground [stroke-width:1.3]"/>
      <circle cx={wave} cy={586} r={13} className="fill-bg stroke-muted-foreground [stroke-width:1.2]"/>
      <path d={`M${wave - 10} 586q2.5 -8 5 0t5 0t5 0t5 0`} className="fill-none stroke-muted-foreground [stroke-width:1.3]"/>
      <path d={side === "left" ? `M${wave + 13} 586H${cx - 11}` : `M${wave - 13} 586H${cx + 11}`} className="fill-none stroke-muted-foreground [stroke-width:1.3]"/>
      <text x={textX} y={582} textAnchor={anchor} className={TEXT}>
        Positional
      </text>
      <text x={textX} y={596} textAnchor={anchor} className={TEXT}>
        Encoding
      </text>
    </>);
}
function Fork({ cx, top }: {
    cx: number;
    top: number;
}) {
    return (<>
      <Line d={`M${cx} 575V546`}/>
      {[cx - 30, cx, cx + 30].map((x) => (<Arrow key={x} d={x === cx ? `M${cx} 546V${top + 7}` : `M${cx} 546H${x}V${top + 7}`} x={x} y={top}/>))}
    </>);
}
function TransformerArchitecture() {
    return (<svg viewBox="0 0 600 704" role="img" aria-label="Transformer architecture: encoder on the left, decoder on the right" className="mx-auto block h-auto w-full max-w-[540px]">
      <FigureStep at="b c">
        <rect x={80} y={330} width={180} height={232} rx={10} className="fill-foreground/[0.03] stroke-muted-foreground [stroke-width:1.1]"/>
        <text x={72} y={452} textAnchor="end" className={TEXT}>
          N×
        </text>
      </FigureStep>
      <FigureStep at="d e f">
        <rect x={340} y={172} width={180} height={390} rx={10} className="fill-foreground/[0.03] stroke-muted-foreground [stroke-width:1.1]"/>
        <text x={528} y={372} className={TEXT}>
          N×
        </text>
      </FigureStep>

      <FigureStep at="a">
        <text x={170} y={690} textAnchor="middle" className={TEXT}>
          Inputs
        </text>
        <EmbedStack cx={170} label="Input Embedding" side="left"/>
      </FigureStep>

      <FigureStep at="b">
        <Fork cx={170} top={532}/>
        <Arrow d="M170 558H92V462H93" x={100} y={462} dir="right" flow={false}/>
        <Block x={100} y={490} h={42} fill="fill-warning-subtle" lines={["Multi-Head", "Attention"]}/>
        <Arrow d="M170 490V481" x={170} y={474}/>
        <AddNorm x={100} y={450}/>
      </FigureStep>

      <FigureStep at="c">
        <Arrow d="M170 450V432" x={170} y={425}/>
        <Arrow d="M170 438H92V357H93" x={100} y={357} dir="right" flow={false}/>
        <Block x={100} y={385} h={40} fill="fill-info-subtle" lines={["Feed", "Forward"]}/>
        <Arrow d="M170 385V376" x={170} y={369}/>
        <AddNorm x={100} y={345}/>
      </FigureStep>

      <FigureStep at="d">
        <text x={430} y={684} textAnchor="middle" className={TEXT}>
          Outputs
        </text>
        <text x={430} y={699} textAnchor="middle" className={SMALL}>
          (shifted right)
        </text>
        <EmbedStack cx={430} label="Output Embedding" side="right"/>
        <Fork cx={430} top={532}/>
        <Arrow d="M430 558H508V462H507" x={500} y={462} dir="left" flow={false}/>
        <Block x={360} y={490} h={42} fill="fill-warning-subtle" lines={["Masked Multi-Head", "Attention"]}/>
        <Arrow d="M430 490V481" x={430} y={474}/>
        <AddNorm x={360} y={450}/>
      </FigureStep>

      <FigureStep at="e">
        <Line d="M170 345V300H300V415H430"/>
        <Arrow d="M430 415V409" x={430} y={402}/>
        <Arrow d="M390 415V409" x={390} y={402}/>
        <Arrow d="M430 450V432H470V409" x={470} y={402}/>
        <Arrow d="M430 440H508V332H507" x={500} y={332} dir="left" flow={false}/>
        <Block x={360} y={360} h={42} fill="fill-warning-subtle" lines={["Multi-Head", "Attention"]}/>
        <Arrow d="M430 360V351" x={430} y={344}/>
        <AddNorm x={360} y={320}/>
        <text x={296} y={292} textAnchor="middle" className={SMALL}>
          K, V
        </text>
        <text x={476} y={428} className={SMALL}>
          Q
        </text>
      </FigureStep>

      <FigureStep at="f">
        <Arrow d="M430 320V297" x={430} y={290}/>
        <Arrow d="M430 308H508V222H507" x={500} y={222} dir="left" flow={false}/>
        <Block x={360} y={250} h={40} fill="fill-info-subtle" lines={["Feed", "Forward"]}/>
        <Arrow d="M430 250V241" x={430} y={234}/>
        <AddNorm x={360} y={210}/>
        <Arrow d="M430 210V160" x={430} y={153}/>
        <Block x={360} y={125} h={28} fill="fill-success-subtle" lines={["Linear"]}/>
        <Arrow d="M430 125V115" x={430} y={108}/>
        <Block x={360} y={80} h={28} fill="fill-warning-subtle" lines={["Softmax"]}/>
        <Arrow d="M430 80V67" x={430} y={60}/>
        <text x={430} y={34} textAnchor="middle" className={TEXT}>
          Output
        </text>
        <text x={430} y={50} textAnchor="middle" className={TEXT}>
          Probabilities
        </text>
      </FigureStep>
    </svg>);
}
const EN_LABELS = { figure: "Figure", separator: ": ", abstract: "Abstract", references: "References", equation: "Eq." };
function Body({ children }: {
    children: ReactNode;
}) {
    return (<div lang="en" className="mx-auto max-w-[680px] text-[15px] leading-relaxed [&_p]:m-0 [&_p]:text-justify [&_p]:hyphens-auto [&_p+p]:indent-6">
      {children}
    </div>);
}
function ModeSwitch() {
    const [mode, setMode] = usePaperMode();
    return (<div className="mb-4 flex justify-end font-sans print:hidden">
      <Segmented size="sm" value={mode} onValueChange={(v) => setMode(v as PaperMode)} items={[
            { value: "read", label: "Read" },
            { value: "print", label: "Print preview" },
        ]}/>
    </div>);
}
function ArchitectureSection({ id }: {
    id: string;
}) {
    return (<>
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
        <FigRef to={id} state="all"/>.
      </p>
      <ProcessFigure id={id} steps={ARCH_STEPS} caption="The Transformer – model architecture." overviewDescription="All stages shown. In print, stages (a)–(f) appear as sub-figures.">
        <TransformerArchitecture />
      </ProcessFigure>
    </>);
}
function ArchitectureDemo({ id = "transformer", defaultMode = "read" }: {
    id?: string;
    defaultMode?: PaperMode;
}) {
    return (<Paper defaultMode={defaultMode} labels={EN_LABELS} className="w-full">
      <ModeSwitch />
      <Body>
        <ArchitectureSection id={id}/>
      </Body>
    </Paper>);
}
const TOKENS = ["The", "animal", "didn\u2019t", "cross", "the", "street", "because", "it", "was", "too", "tired", "."];
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
function AttentionBars({ state }: {
    state: AttentionState;
}) {
    const w = softmax(state);
    const x = (i: number) => 30 + i * 50;
    return (<svg viewBox="0 0 600 150" role="img" aria-label="Softmax weights from the query “it” to every token" className="block h-auto w-full">
      <line x1={8} x2={592} y1={100.5} y2={100.5} className="stroke-border"/>
      {w.map((p, i) => {
            const h = Math.max(1, p * 84);
            return (<g key={TOKENS[i] + i}>
            <rect x={x(i) - 13} y={100 - h} width={26} height={h} className="fill-primary transition-all duration-300 motion-reduce:transition-none"/>
            {p >= 0.06 ? (<text x={x(i)} y={95 - h} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {Math.round(p * 100)}%
              </text>) : null}
            <text x={x(i)} y={122} textAnchor="middle" className={i === 7 ? "fill-warning text-[14px] font-bold" : "fill-foreground text-[14px]"}>
              {TOKENS[i]}
            </text>
          </g>);
        })}
    </svg>);
}
function ScaleToggle({ scaled, onToggle }: {
    scaled: boolean;
    onToggle: () => void;
}) {
    const term = usePaperTerm("dk");
    return (<Button size="xs" variant="outline" aria-pressed={scaled} onClick={onToggle} {...term.bind} className="data-[active]:border-primary data-[active]:text-primary">
      {scaled ? "Scaled \u00F7\u221Ad\u2096" : "Unscaled"}
    </Button>);
}
const ATTENTION_LATEX = String.raw `mathrm{Attention}(Q,K,V)=mathrm{softmax}left(\frac{QK^{T}}{\term{dk}{sqrt{d_k}}}\right)V`;
function AttentionSection({ id, equation = false }: {
    id: string;
    equation?: boolean;
}) {
    return (<>
      {equation ? (<>
          <p>
            We compute the dot products of the query with all keys, divide each by √d<sub>k</sub>, and apply a softmax
            to obtain the weights on the values:
          </p>
          <PaperEquation id={`${id}-eq`} terms={{
                dk: {
                    label: "\u221Ad\u2096: toggle scaling in Figure 2",
                    figure: id,
                    state: (s) => ({ ...(s as AttentionState), scaled: !(s as AttentionState).scaled }),
                },
            }}>
            {ATTENTION_LATEX}
          </PaperEquation>
        </>) : null}
      <p>

        For small d<sub>k</sub> scaling makes little difference (<FigRef to={id} state="raw4"/>, d<sub>k</sub> = 4).
        For large d<sub>k</sub> the dot products grow large in magnitude and push the softmax into regions with
        extremely small gradients: unscaled, nearly all weight collapses onto one key (
        <FigRef to={id} state="raw512"/>, unscaled). Dividing by √d<sub>k</sub> restores a usable distribution (
        <FigRef to={id} state="scaled512"/>, scaled).
      </p>
      <PaperFigure id={id} states={ATTENTION_STATES} caption="Scaled dot-product attention for the query “it”. Weights are illustrative, computed from hand-set similarity scores." describe={(s) => `d_k = ${s.dk}, ${s.scaled ? "scaled by 1/\u221Ad_k" : "unscaled"}; largest weight ${Math.max(...softmax(s)).toFixed(2)}.`} controls={(fig) => (<>
            <span>d<sub>k</sub></span>
            {[1, 4, 16, 64, 512].map((dk) => (<Button key={dk} size="xs" variant={fig.state.dk === dk ? "solid" : "ghost"} aria-pressed={fig.state.dk === dk} onClick={() => fig.setState({ ...fig.state, dk })} className="tabular-nums">
                {dk}
              </Button>))}
            <ScaleToggle scaled={fig.state.scaled} onToggle={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}/>
          </>)}>
        {(state) => <AttentionBars state={state}/>}
      </PaperFigure>
    </>);
}
function AttentionDemo() {
    return (<Paper labels={EN_LABELS} className="w-full">
      <Body>
        <AttentionSection id="attention"/>
      </Body>
    </Paper>);
}
const PE_DIMS = 128;
const PE_POSITIONS = 64;
function encoding(pos: number, dim: number) {
    const even = dim - (dim % 2);
    const angle = pos / 10000 ** (even / PE_DIMS);
    return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}
function wavelength(dim: number) {
    return 2 * Math.PI * 10000 ** ((dim - (dim % 2)) / PE_DIMS);
}
type Rgba = readonly [
    number,
    number,
    number,
    number
];
function diverging(v: number, positive: Rgba, negative: Rgba, zero: Rgba): [
    number,
    number,
    number
] {
    const end = v >= 0 ? positive : negative;
    const t = Math.min(1, Math.abs(v));
    return [0, 1, 2].map((j) => Math.round(zero[j] + (end[j] - zero[j]) * t)) as [
        number,
        number,
        number
    ];
}
function palette(color: (css: string) => Rgba) {
    return [color("var(--color-chart-1)"), color("var(--color-chart-3)"), color("var(--color-bg)")] as const;
}
const drawEncoding: FigureRasterProps["draw"] = (ctx, { width, height, color }) => {
    const [positive, negative, zero] = palette(color);
    const image = ctx.createImageData(width, height);
    for (let pos = 0; pos < height; pos++) {
        for (let dim = 0; dim < width; dim++) {
            const o = (pos * width + dim) * 4;
            image.data.set([...diverging(encoding(pos, dim), positive, negative, zero), 255], o);
        }
    }
    ctx.putImageData(image, 0, 0);
};
const drawScale: FigureRasterProps["draw"] = (ctx, { width, height, color }) => {
    const [positive, negative, zero] = palette(color);
    const image = ctx.createImageData(width, height);
    for (let x = 0; x < width; x++) {
        const rgb = diverging((x / (width - 1)) * 2 - 1, positive, negative, zero);
        for (let y = 0; y < height; y++)
            image.data.set([...rgb, 255], (y * width + x) * 4);
    }
    ctx.putImageData(image, 0, 0);
};
interface EncodingState {
    dim: number;
}
const ENCODING_STATES: Record<string, EncodingState> = {
    c4: { dim: 4 },
    c40: { dim: 40 },
    c100: { dim: 100 },
};
const HEAT = { x: 4, y: 4, width: 512, height: 176 };
const CELL = HEAT.width / PE_DIMS;
const CURVE = { zero: 282, amplitude: 42 };
function PositionalEncodingPlot({ state, interactive, onPick }: {
    state: EncodingState;
    interactive: boolean;
    onPick: (dim: number) => void;
}) {
    const { dim } = state;
    const curve = Array.from({ length: PE_POSITIONS }, (_, pos) => {
        const x = 8 + pos * 8;
        const y = CURVE.zero - encoding(pos, dim) * CURVE.amplitude;
        return `${pos ? "L" : "M"}${x} ${y.toFixed(2)}`;
    }).join("");
    const pick = (event: PointerEvent<SVGRectElement>) => {
        if (event.pointerType !== "mouse" && event.buttons === 0 && event.type === "pointermove")
            return;
        const r = event.currentTarget.getBoundingClientRect();
        const next = Math.floor(((event.clientX - r.left) / r.width) * PE_DIMS);
        onPick(Math.max(0, Math.min(PE_DIMS - 1, next)));
    };
    return (<svg viewBox="0 0 520 352" role="img" aria-label={`Heatmap of positional encodings, 64 positions by 128 dimensions; dimension ${dim} is selected and traced below`} className="block h-auto w-full">
      <FigureRaster {...HEAT} resolution={[PE_DIMS, PE_POSITIONS]} pixelated draw={drawEncoding}/>
      <rect {...HEAT} className="fill-none stroke-border"/>
      <rect x={HEAT.x + dim * CELL} y={HEAT.y} width={CELL} height={HEAT.height} className="fill-none stroke-foreground [stroke-width:1.5] transition-[x] duration-200 motion-reduce:transition-none"/>
      {interactive ? (<rect {...HEAT} aria-hidden onPointerDown={pick} onPointerMove={pick} className="cursor-crosshair touch-none fill-transparent"/>) : null}
      <g className="fill-muted-foreground font-sans text-[11px]">
        <text x={4} y={196}>dimension 0</text>
        <text x={260} y={196} textAnchor="middle">rows: position 0 → 63</text>
        <text x={516} y={196} textAnchor="end">dimension 127</text>
        <text x={20} y={222} textAnchor="end">−1</text>
        <text x={152} y={222}>+1</text>
        <text x={516} y={222} textAnchor="end">
          dimension {dim} across positions
        </text>
        <text x={4} y={346}>pos 0</text>
        <text x={516} y={346} textAnchor="end">pos 63</text>
      </g>
      <FigureRaster x={24} y={214} width={124} height={10} resolution={[128, 1]} draw={drawScale}/>
      <line x1={8} x2={512} y1={CURVE.zero} y2={CURVE.zero} className="stroke-border"/>
      <path d={curve} className="fill-none stroke-primary [stroke-width:2] [stroke-linejoin:round]"/>
    </svg>);
}
function describeEncoding({ dim }: EncodingState) {
    const lambda = wavelength(dim);
    const shown = lambda < 1000 ? lambda.toFixed(1) : Math.round(lambda).toLocaleString("en");
    const periods = lambda > PE_POSITIONS ? "less than one period over the 64 positions shown" : `about ${(PE_POSITIONS / lambda).toFixed(1)} periods over 64 positions`;
    return `Dimension ${dim} (${dim % 2 ? "cos" : "sin"}, i = ${(dim - (dim % 2)) / 2}): wavelength \u2248 ${shown} positions, ${periods}.`;
}
function EncodingSection({ id }: {
    id: string;
}) {
    return (<>
      <p>

        Each dimension of the positional encoding corresponds to a sinusoid, and the wavelengths form a geometric
        progression from 2π to 10000·2π (<FigRef to={id}/>). Low dimensions oscillate quickly along the sequence (
        <FigRef to={id} state="c4"/>, i = 2), while higher dimensions change slowly (
        <FigRef to={id} state="c40"/>, i = 20) and barely move within 64 positions (
        <FigRef to={id} state="c100"/>, i = 50).
      </p>
      <PaperFigure id={id} states={ENCODING_STATES} printSubfigures={["c4", "c40", "c100"]} subfigureLabel={(key, i) => `(${"abc"[i]}) dimension ${ENCODING_STATES[key].dim}`} caption={<>
            Sinusoidal positional encodings for 64 positions with <i>d</i>
            <sub>model</sub> = 128, blue positive and orange negative. The outlined column is the selected dimension; the
            curve traces it across positions.
          </>} describe={describeEncoding} controls={(fig) => (<>
            <span aria-hidden className="tabular-nums">Dimension {fig.state.dim}</span>
            <Slider aria-label="Dimension" min={0} max={PE_DIMS - 1} value={fig.state.dim} onValueChange={(v) => fig.setState({ dim: typeof v === "number" ? v : v[0] })} className="min-w-40 flex-1"/>
            <span className="w-full sm:w-auto">You can also hover over or tap the heatmap</span>
          </>)}>
        {(state, fig) => (<PositionalEncodingPlot state={state} interactive={fig.mode === "read"} onPick={(dim) => fig.setState({ dim })}/>)}
      </PaperFigure>
    </>);
}
function EncodingDemo() {
    return (<Paper labels={EN_LABELS} className="w-full">
      <ModeSwitch />
      <Body>
        <EncodingSection id="encoding"/>
      </Body>
      <ExportToolbar figure="encoding" keys={Object.keys(ENCODING_STATES)} label={(key) => `Dimension ${ENCODING_STATES[key].dim}`}/>
    </Paper>);
}
const AUTHORS = [
    { name: "Ashish Vaswani", affiliation: "Google Brain" },
    { name: "Noam Shazeer", affiliation: "Google Brain" },
    { name: "Niki Parmar", affiliation: "Google Research" },
    { name: "Jakob Uszkoreit", affiliation: "Google Research" },
    { name: "Llion Jones", affiliation: "Google Research" },
    { name: "Aidan N. Gomez", affiliation: "University of Toronto" },
    { name: "\u0141ukasz Kaiser", affiliation: "Google Brain" },
    { name: "Illia Polosukhin" },
];
const REFERENCES = [
    {
        id: "hochreiter1997",
        content: (<>
        Sepp Hochreiter and Jürgen Schmidhuber. Long short-term memory. <i>Neural Computation</i>, 9(8):1735–1780,
        1997.
      </>),
    },
    {
        id: "sutskever2014",
        content: (<>
        Ilya Sutskever, Oriol Vinyals, and Quoc V. Le. Sequence to sequence learning with neural networks. In{" "}
        <i>Advances in Neural Information Processing Systems</i>, 2014.
      </>),
    },
    {
        id: "bahdanau2014",
        content: (<>
        Dzmitry Bahdanau, Kyunghyun Cho, and Yoshua Bengio. Neural machine translation by jointly learning to align
        and translate. <i>CoRR</i>, abs/1409.0473, 2014.
      </>),
    },
    {
        id: "gehring2017",
        content: (<>
        Jonas Gehring, Michael Auli, David Grangier, Denis Yarats, and Yann N. Dauphin. Convolutional sequence to
        sequence learning. <i>arXiv preprint</i> arXiv:1705.03122, 2017.
      </>),
    },
];
function HeaderDemo() {
    return (<Paper labels={EN_LABELS} className="w-full">
      <Body>
        <PaperHeader title="Attention Is All You Need" authors={AUTHORS} meta="31st Conference on Neural Information Processing Systems (NIPS 2017)" abstract="The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."/>
        <p>
          Recurrent models have been the standard approach to sequence modeling and transduction problems such as
          machine translation <Cite to={["hochreiter1997", "sutskever2014"]}/>. Attention mechanisms let a model
          relate positions regardless of their distance <Cite to="bahdanau2014"/>, and most competitive models have
          an encoder–decoder structure <Cite to={["bahdanau2014", "gehring2017", "sutskever2014"]}/>.
        </p>
        <Bibliography entries={REFERENCES}/>
      </Body>
    </Paper>);
}
const PE_LATEX = String.raw `\begin{aligned}PE_{(pos,2i)}&=sinleft(pos/10000^{2i/d_{mathrm{model}}}\right)\\PE_{(pos,2i+1)}&=cosleft(pos/10000^{2i/d_{mathrm{model}}}\right)end{aligned}`;
function EquationDemo() {
    return (<Paper labels={EN_LABELS} className="w-full">
      <ModeSwitch />
      <Body>
        <AttentionSection id="attention-equation" equation/>
        <p>
          Since the model contains no recurrence, we add sinusoidal positional encodings to the input embeddings{" "}
          <EqRef to="pe-eq"/>. Unlike the scaling in <EqRef to="attention-equation-eq"/>, they carry no learned
          parameters.
        </p>
        <PaperEquation id="pe-eq">{PE_LATEX}</PaperEquation>
      </Body>
    </Paper>);
}
const EXPORT_KEYS = [...ARCH_STEPS.map((s) => s.key), "all"];
function ExportToolbar({ figure, keys = EXPORT_KEYS, label = (key) => (key === "all" ? "All" : `(${key})`), }: {
    figure: string;
    keys?: readonly string[];
    label?: (key: string) => string;
}) {
    const { exportFigureSvg } = usePaperExport();
    const [preview, setPreview] = useState<{
        key: string;
        url: string;
        size: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => () => {
        if (preview)
            URL.revokeObjectURL(preview.url);
    }, [preview]);
    const run = async (key: string) => {
        setError(null);
        try {
            const svg = await exportFigureSvg(figure, key, { background: "white" });
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${figure}-${key}.svg`;
            a.click();
            setPreview({ key, url, size: blob.size });
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };
    return (<div className="mt-2 font-sans text-sm text-muted-foreground print:hidden">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1">Export SVG</span>
        {keys.map((key) => (<Button key={key} size="xs" variant="outline" onClick={() => run(key)}>
            {label(key)}
          </Button>))}
      </div>
      {error ? <p className="mt-2 text-danger">{error}</p> : null}
      {preview ? (<figure className="mx-0 mt-3">
          <img src={preview.url} alt={`Exported (${preview.key})`} className="mx-auto block h-auto w-full max-w-[360px] rounded-[var(--radius)] border border-border"/>
          <figcaption className="mt-1 text-center text-xs">
            Exported {label(preview.key)} · {(preview.size / 1024).toFixed(1)} KB · loaded as &lt;img&gt;,
            no longer depends on the page CSS
          </figcaption>
        </figure>) : null}
    </div>);
}
function ExportDemo() {
    return (<Paper labels={EN_LABELS} className="w-full">
      <Body>
        <ProcessFigure id="transformer-export" steps={ARCH_STEPS} caption="The Transformer – model architecture." overviewDescription="All stages shown.">
          <TransformerArchitecture />
        </ProcessFigure>
      </Body>
      <ExportToolbar figure="transformer-export"/>
    </Paper>);
}
function PresenterDemo() {
    return (<Paper labels={EN_LABELS} className="w-full">
      <div className="mb-4 flex justify-end font-sans print:hidden">
        <PaperPresenter title="Attention Is All You Need" trigger={<Button size="sm">Present ▶</Button>}/>
      </div>
      <Body>
        <ArchitectureSection id="transformer-present"/>
        <AttentionSection id="attention-present"/>
        <EncodingSection id="encoding-present"/>
      </Body>
    </Paper>);
}
const archCode = `<Paper>
  <p>
    \u2026 a multi-head self-attention sub-layer
    <FigRef to={id} state="b">Figure 1(b)</FigRef> \u2026
  </p>
  <ProcessFigure
    id="transformer"
    steps={[
      { key: "a", label: "Input embedding", description: "(a) \u2026" },
      { key: "b", label: "Encoder self-attention", description: "(b) \u2026" },
      // \u2026
    ]}
    caption="The Transformer \u2013 model architecture."
  >
    <svg viewBox="0 0 600 704">
      <FigureStep at="a">{/* input embedding + positional encoding */}</FigureStep>
      <FigureStep at="b">
        <rect className="stroke-muted-foreground group-data-[phase=on]/step:stroke-primary" \u2026 />
      </FigureStep>
      <FigureStep at="b c">{/* encoder frame, part of two steps */}</FigureStep>
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
  caption="Scaled dot-product attention for the query \u201Cit\u201D."
  describe={(s) => \`d_k = \${s.dk}, \${s.scaled ? "scaled" : "unscaled"}\`}
  controls={(fig) => (
    <Button onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}>
      Toggle scaling
    </Button>
  )}
>
  {(state) => <AttentionBars state={state} />}
</PaperFigure>

<FigRef to="attention" state="raw512">Figure 2, unscaled</FigRef>`;
const presenterCode = `<Paper>
  <PaperPresenter
    title="Attention Is All You Need"
    trigger={<Button>Present \u25B6</Button>}
    // Default: the presets of every figure in document order (each step + all for process figures)
    // Reorder with slides={[{ figure: "attention", state: "raw512" }, \u2026]}
  />
  <ProcessFigure id="transformer" steps={steps} caption="\u2026">\u2026</ProcessFigure>
  <PaperFigure
    id="attention"
    states={presets}
    presentStates={["scaled64", "raw512", "scaled512"]}
    caption="\u2026"
  >
    {(state) => <AttentionBars state={state} />}
  </PaperFigure>
</Paper>`;
const equationCode = `// PaperEquation comes from @hulianui/ui/math (KaTeX stays out of the main entry)
<Paper>
  <p>\u2026 as shown in <EqRef to="attention-eq" /></p> {/* shows \u201CEq. (1)\u201D in the text; clicking scrolls to the equation and outlines it */}
  <PaperEquation
    id="attention-eq" // no number: numbered automatically like figures; number="A.1" overrides, number={null} leaves it unnumbered
    terms={{
      dk: {
        label: "\u221Ad\u2096: toggle scaling in Figure 2",
        figure: "attention",
        state: (s) => ({ ...s, scaled: !s.scaled }), // or a preset name such as "scaled512"
      },
    }}
  >
    {String.raw\`\\mathrm{softmax}\\left(\\frac{QK^T}{\\term{dk}{\\sqrt{d_k}}}\\right)V\`}
  </PaperEquation>

  <PaperFigure id="attention" states={presets} controls={(fig) => <ScaleToggle fig={fig} />} \u2026>
    {(state) => <AttentionBars state={state} />}
  </PaperFigure>
</Paper>

function ScaleToggle({ fig }) {
  const term = usePaperTerm("dk"); // hover / focus also lights up \u221Ad\u2096 in the formula
  return (
    <Button {...term.bind} onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}>
      Toggle scaling
    </Button>
  );
}`;
const headerCode = `<Paper labels={{ figure: "Figure", separator: ": ", abstract: "Abstract", references: "References" }}>
  <PaperHeader
    title="Attention Is All You Need"
    authors={[{ name: "Ashish Vaswani", affiliation: "Google Brain" }, \u2026]}
    meta="NIPS 2017"
    abstract="The dominant sequence transduction models \u2026"
  />
  <p>
    \u2026 such as machine translation <Cite to={["hochreiter1997", "sutskever2014"]} />.
  </p>
  <Bibliography
    entries={[
      { id: "hochreiter1997", content: <>Sepp Hochreiter and J\u00FCrgen Schmidhuber. Long short-term memory. \u2026</> },
      { id: "sutskever2014", content: <>Ilya Sutskever, Oriol Vinyals, and Quoc V. Le. \u2026</> },
    ]}
  />
</Paper>`;
const exportCode = `function ExportButton({ figure, state }) {
  const { exportFigureSvg } = usePaperExport(); // must be inside Paper
  return (
    <Button
      onClick={async () => {
        const svg = await exportFigureSvg(figure, state, { background: "white" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        a.download = \`\${figure}-\${state}.svg\`;
        a.click();
      }}
    >
      Export SVG
    </Button>
  );
}

<Paper>
  <ProcessFigure id="transformer" steps={steps} caption="\u2026">\u2026</ProcessFigure>
  <ExportButton figure="transformer" state="b" />
</Paper>`;
const rasterCode = `// The heatmap is drawn inside the figure's <svg>: it uses viewBox coordinates, and print sub-figures, the presenter and SVG export all keep working
const drawEncoding = (ctx, { width, height, color }) => {
  const positive = color("var(--color-chart-1)"); // resolved to RGBA in the theme where the raster sits
  const negative = color("var(--color-chart-3)");
  const zero = color("var(--color-bg)");
  const image = ctx.createImageData(width, height);
  // \u2026 interpolate each pixel between zero and positive / negative by PE(pos, dim)
  ctx.putImageData(image, 0, 0);
}; // module-level constant: an unchanged reference does not redraw

<PaperFigure
  id="encoding"
  states={{ c4: { dim: 4 }, c40: { dim: 40 }, c100: { dim: 100 } }}
  printSubfigures={["c4", "c40", "c100"]}
  caption="Sinusoidal positional encodings \u2026"
  controls={(fig) => (
    <Slider aria-label="Dimension" min={0} max={127} value={fig.state.dim}
      onValueChange={(v) => fig.setState({ dim: v })} />
  )}
>
  {({ dim }) => (
    <svg viewBox="0 0 520 352">
      <FigureRaster x={4} y={4} width={512} height={176}
        resolution={[128, 64]} pixelated draw={drawEncoding} />
      <rect x={4 + dim * 4} y={4} width={4} height={176} className="fill-none stroke-foreground" />
      <path d={curveOf(dim)} className="fill-none stroke-primary" />
    </svg>
  )}
</PaperFigure>`;
const printCode = `<Paper mode="print">
  <ProcessFigure
    id="transformer"
    steps={steps}
    caption="\u2026"
    // Default: the main figure draws "all", with one sub-figure per step
    // Change it with printState="e" printSubfigures={["b", "e"]}
  >
    \u2026
  </ProcessFigure>
</Paper>`;
export const paperShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Process figure driven by in-text references",
            description: "The material is the architecture figure of \u201CAttention Is All You Need\u201D. Click a reference such as Figure 1(b) in the text and the figure switches to that step, scrolls into view when needed, and is outlined briefly. The current step is highlighted, earlier steps are half transparent, and later steps are faint but not hidden, so the reader always sees the whole figure. Below the figure you can pick a step, go previous / next, or play. Switch to Print preview at the top right to see the submission form.",
            code: archCode,
            render: () => <ArchitectureDemo />,
        },
        {
            title: "Parameter figure: presets plus direct values",
            description: "A state can be a set of parameters, not only a step. In-text references only use named presets, while controls set values directly with setState. This shows scaled dot-product attention: without dividing by \u221Ad\u2096, the larger d\u2096 is, the more the softmax concentrates on one token. The weights are illustrative, hand-set data.",
            code: attentionCode,
            render: () => <AttentionDemo />,
        },
        {
            title: "Raster figure: heatmap",
            description: "Per-pixel figures such as heatmaps and attention matrices use FigureRaster: it paints an offscreen canvas and embeds it as PNG in the figure's <svg>. So it shares coordinates with the vector parts, each print sub-figure paints its own copy, the presenter scales it with the stage, and SVG export carries it along as is (a mixed SVG). Colors are resolved from token values, it redraws when switching between light and dark, and exports are always light. This is the sinusoidal positional encoding from equation (2) of the paper: drag the slider or move over the heatmap to pick a dimension, and the curve below traces its value across positions.",
            code: rasterCode,
            render: () => <EncodingDemo />,
        },
        {
            title: "Presentation mode",
            description: "Click Present \u25B6 for a full-screen presentation: the presets of every figure, in document order, become one set of slides. Use \u2190/\u2192, Space or PageUp/PageDown to move, and Esc to leave; focus returns to the button. The presenter redraws each figure with the same state-to-picture function instead of moving the figure out of the text, so the text stays on the step the reader left it at. Figure controls still work while presenting: a step button jumps to that slide, and parameter changes only affect the current slide.",
            code: presenterCode,
            render: () => <PresenterDemo />,
        },
        {
            title: "Linking formulas to figures",
            description: "Formula (1) marks \u221Ad\u2096 with \\term{dk}{\u2026}: click it to toggle scaling in Figure 2, and hovering or focusing it lights up the scaling switch below the figure. Hovering the switch lights up \u221Ad\u2096 in the formula in turn. The formula is rendered with KaTeX and imported from @hulianui/ui/math, so it stays out of the main entry. A real button sits on the term, so it is reachable with Tab and screen readers announce what it does. Equation numbers use a CSS counter just like figure numbers, so they appear in server rendering and print; EqRef in the text shows the localized form of \u201CEquation (N)\u201D in Chinese papers and \u201CEq. (N)\u201D in English ones, and clicking it scrolls to the equation and outlines it.",
            code: equationCode,
            render: () => <EquationDemo />,
        },
        {
            title: "Per-state SVG export",
            description: "For submission, insert the vector figure of each state into Word, or convert it to PDF for LaTeX. Export draws the figure off screen with the same state-to-picture function, reads each element's computed style into SVG attributes and turns colors into hex, so the file no longer depends on the page CSS. It uses the light theme by default, leaves animations out, and does not touch the figure in the text. The preview below is the exported file loaded as an <img>.",
            code: exportCode,
            render: () => <ExportDemo />,
        },
        {
            title: "Title block and references",
            description: "PaperHeader lays out the title, authors, a line of details and the abstract, with the title between a thick rule above and a thin rule below. Bibliography numbers its entries in order, and Cite in the text takes numbers by id: several citations are sorted and deduplicated, and three or more in a row collapse to 1\u20133. Clicking a number scrolls to that entry and outlines it. The Abstract and References headings follow the paper language set on Paper.",
            code: headerCode,
            render: () => <HeaderDemo />,
        },
        {
            title: "Print form",
            description: "The PDF form for submission: every figure freezes in its print state, controls are not rendered, references become plain text, and each step of a process figure expands into (a)(b)(c)\u2026 sub-figures. When the browser actually prints, Paper switches to this form before printing and back afterwards.",
            code: printCode,
            render: () => <ArchitectureDemo id="transformer-print" defaultMode="print"/>,
        },
    ],
    controls: [
        { prop: "mode", type: "select", options: ["read", "print"], defaultValue: "read", label: "Mode" },
    ],
    states: [
        { name: "Read", render: () => <ArchitectureDemo /> },
        { name: "Print", render: () => <ArchitectureDemo id="transformer-print" defaultMode="print"/> },
        { name: "Parameter figure", render: () => <AttentionDemo /> },
        { name: "Raster figure", render: () => <EncodingDemo /> },
        { name: "Present", render: () => <PresenterDemo /> },
    ],
    renderWithProps: (p) => (<ArchitectureDemo key={String(p.mode)} id="transformer-playground" defaultMode={p.mode as PaperMode}/>),
    toCode: (p) => `<Paper${p.mode === "print" ? " mode=\"print\"" : ""}>
  <ProcessFigure id="transformer" steps={steps} caption="\u2026">
    <TransformerArchitecture />
  </ProcessFigure>
</Paper>`,
};
