import { Dice5, Trash2, Sliders } from "lucide-react";
import type { FlowEdge, FlowNode } from "@hulian/ui";
import {
  Button,
  Field,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Slider,
  Steps,
  Switch,
  Tag,
  Text,
  Textarea,
  Toggle,
  ToggleGroup,
  Upload,
  Video,
  cn,
} from "@hulian/ui";
import { meshGradient, randomSeed, seedLabel } from "../../_lib/artwork";
import { MODELS, MOTION_LEVELS, RATIOS, SAMPLERS, STYLE_PRESETS } from "../../_data/models";
import { NODE_KIND_MAP } from "../../_data/node-kinds";
import { topoOrder } from "../../_lib/use-flow-run";
import type { FlowNodeData } from "../../_data/types";

type Patch = Partial<FlowNodeData>;

function SeedField({ seed, onChange }: { seed: number; onChange: (s: number) => void }) {
  return (
    <Field label="随机种子">
      <div className="flex items-center gap-2">
        <Input value={seedLabel(seed)} readOnly className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => onChange(randomSeed())} aria-label="随机种子" className="size-8 shrink-0 px-0">
          <Dice5 className="size-4" />
        </Button>
      </div>
    </Field>
  );
}

/** 各类型节点的参数编辑器（与画布节点同一份 data 双向同步）。 */
function NodeEditor({ data, onUpdate }: { data: FlowNodeData; onUpdate: (p: Patch) => void }) {
  switch (data.kind) {
    case "prompt":
      return (
        <>
          <Field label="正向提示词">
            <Textarea
              value={data.positive}
              rows={4}
              autoResize
              placeholder="描述你想要的画面…"
              onChange={(e) => onUpdate({ positive: e.target.value })}
            />
          </Field>
          <Field label="负向提示词" description="不希望出现的元素">
            <Textarea
              value={data.negative}
              rows={2}
              autoResize
              placeholder="低分辨率, 水印…"
              onChange={(e) => onUpdate({ negative: e.target.value })}
            />
          </Field>
          <Field label="风格预设">
            <ToggleGroup multiple value={data.styles} onValueChange={(v) => onUpdate({ styles: v })} className="flex flex-wrap gap-1.5">
              {STYLE_PRESETS.map((s) => (
                <Toggle key={s} value={s} variant="pill" size="sm">
                  {s}
                </Toggle>
              ))}
            </ToggleGroup>
          </Field>
        </>
      );
    case "image-input":
      return (
        <>
          <div className="overflow-hidden rounded-[var(--radius)] border border-border">
            <div className="aspect-square w-full" style={{ background: meshGradient(data.seed) }} />
          </div>
          <Field label="参考图">
            <Upload
              variant="dropzone"
              accept="image/*"
              onSelect={(files) => files[0] && onUpdate({ fileName: files[0].name, seed: randomSeed() })}
            />
          </Field>
          <Text size="xs" tone="muted">
            当前：{data.fileName}
          </Text>
        </>
      );
    case "model":
      return (
        <>
          <Field label="模型">
            <Select items={MODELS.map((m) => ({ value: m.id, label: m.name }))} value={data.model} onValueChange={(v) => onUpdate({ model: v as string })}>
              <SelectTrigger />
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} · {m.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="采样器">
            <Select items={SAMPLERS.map((s) => ({ value: s, label: s }))} value={data.sampler} onValueChange={(v) => onUpdate({ sampler: v as string })}>
              <SelectTrigger />
              <SelectContent>
                {SAMPLERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={`采样步数 · ${data.steps}`}>
            <Slider value={data.steps} min={10} max={50} step={1} onValueChange={(v) => onUpdate({ steps: v as number })} />
          </Field>
          <Field label={`提示词引导 CFG · ${data.cfg}`}>
            <Slider value={data.cfg} min={1} max={15} step={0.5} onValueChange={(v) => onUpdate({ cfg: v as number })} />
          </Field>
          <Field label="尺寸比例">
            <Segmented
              size="sm"
              items={RATIOS.map((r) => ({ value: r.value, label: r.value }))}
              value={data.ratio}
              onValueChange={(v) => onUpdate({ ratio: v })}
            />
          </Field>
          <SeedField seed={data.seed} onChange={(s) => onUpdate({ seed: s })} />
        </>
      );
    case "upscale":
      return (
        <>
          <Field label="放大倍数">
            <Segmented
              items={[
                { value: "2", label: "×2" },
                { value: "4", label: "×4" },
              ]}
              value={String(data.factor)}
              onValueChange={(v) => onUpdate({ factor: Number(v) as 2 | 4 })}
            />
          </Field>
          <label className="flex items-center justify-between rounded-[var(--radius)] border border-border px-3 py-2">
            <span className="text-sm">面部修复</span>
            <Switch checked={data.faceRestore} onCheckedChange={(c) => onUpdate({ faceRestore: c })} />
          </label>
        </>
      );
    case "i2v":
      return (
        <>
          <Field label={`视频时长 · ${data.duration}s`}>
            <Slider value={data.duration} min={2} max={10} step={1} onValueChange={(v) => onUpdate({ duration: v as number })} />
          </Field>
          <Field label="帧率">
            <Segmented
              items={[
                { value: "24", label: "24fps" },
                { value: "30", label: "30fps" },
                { value: "60", label: "60fps" },
              ]}
              value={String(data.fps)}
              onValueChange={(v) => onUpdate({ fps: Number(v) })}
            />
          </Field>
          <Field label="运动幅度">
            <Select items={MOTION_LEVELS} value={data.motion} onValueChange={(v) => onUpdate({ motion: v as string })}>
              <SelectTrigger />
              <SelectContent>
                {MOTION_LEVELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      );
    case "output":
      return (
        <>
          <Field label="输出类型">
            <Segmented
              items={[
                { value: "image", label: "图片" },
                { value: "video", label: "视频" },
              ]}
              value={data.format}
              onValueChange={(v) => onUpdate({ format: v as "image" | "video" })}
            />
          </Field>
          {data.result?.type === "image" && data.result.seed != null && (
            <div className="overflow-hidden rounded-[var(--radius)] border border-border">
              <div className="aspect-square w-full" style={{ background: meshGradient(data.result.seed) }} />
            </div>
          )}
          {data.result?.type === "video" && (
            <Video src={data.result.videoUrl ?? ""} poster={data.result.poster} className="overflow-hidden rounded-[var(--radius)]" />
          )}
          {!data.result && (
            <Text size="xs" tone="muted">
              运行后在此预览最终产物。
            </Text>
          )}
        </>
      );
  }
}

interface InspectorProps {
  node: FlowNode<FlowNodeData> | null;
  nodes: FlowNode<FlowNodeData>[];
  edges: FlowEdge[];
  onUpdate: (id: string, patch: Patch) => void;
  onDelete: (id: string) => void;
}

export function Inspector({ node, nodes, edges, onUpdate, onDelete }: InspectorProps) {
  if (!node) {
    // 概览：流程顺序 + 统计
    const order = topoOrder(nodes, edges);
    const genCount = nodes.filter((n) => n.data.kind === "model" || n.data.kind === "i2v" || n.data.kind === "upscale").length;
    const estimate = Math.max(1, genCount) * 4;
    const steps = order
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is FlowNode<FlowNodeData> => !!n)
      .map((n) => ({ title: n.data.title, description: NODE_KIND_MAP[n.data.kind].group }));

    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Sliders className="size-4 text-muted" />
          <Text weight="semibold" size="sm">
            工作流概览
          </Text>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "节点", value: nodes.length },
              { label: "连线", value: edges.length },
              { label: "预计", value: `${estimate}s` },
            ].map((s) => (
              <div key={s.label} className="rounded-[var(--radius)] border border-border bg-bg p-2.5 text-center">
                <div className="text-lg font-semibold tabular-nums">{s.value}</div>
                <div className="text-[11px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div>
            <Text size="xs" tone="muted" className="mb-2">
              执行顺序（拓扑序）
            </Text>
            {steps.length > 0 ? (
              <Steps direction="vertical" items={steps} current={-1} />
            ) : (
              <Text size="sm" tone="muted">
                画布还是空的，从左侧节点库添加节点开始。
              </Text>
            )}
          </div>

          <div className="rounded-[var(--radius)] border border-primary/15 bg-primary/[0.06] p-3">
            <Text size="xs" tone="muted" className="leading-relaxed">
              提示：选中节点可编辑参数；从节点右侧的圆点拖到下一个节点左侧圆点即可连线；滚轮平移、Ctrl/⌘ + 滚轮缩放。
            </Text>
          </div>
        </div>
      </aside>
    );
  }

  const meta = NODE_KIND_MAP[node.data.kind];
  const Icon = meta.icon;
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="size-4 text-muted" />
        <Text weight="semibold" size="sm" className="flex-1">
          {meta.label} · 参数
        </Text>
        <Tag size="sm" tone="neutral" variant="outline">
          {meta.group}
        </Tag>
      </header>
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
        <Field label="节点名称">
          <Input value={node.data.title} onChange={(e) => onUpdate(node.id, { title: e.target.value })} />
        </Field>
        <div className={cn("space-y-3.5")}>
          <NodeEditor data={node.data} onUpdate={(p) => onUpdate(node.id, p)} />
        </div>
      </div>
      <footer className="border-t border-border p-3">
        <Button variant="outline" tone="danger" size="sm" className="w-full" onClick={() => onDelete(node.id)}>
          <Trash2 className="size-4" />
          删除节点
        </Button>
      </footer>
    </aside>
  );
}
