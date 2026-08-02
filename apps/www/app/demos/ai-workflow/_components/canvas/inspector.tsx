import { copy } from "./inspector.content";
import { Dice5, Trash2, Sliders } from "lucide-react";
import type { FlowEdge, FlowNode } from "@hulianui/ui";
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
} from "@hulianui/ui";
import { meshGradient, randomSeed, seedLabel } from "../../_lib/artwork";
import { MODELS, MOTION_LEVELS, RATIOS, SAMPLERS, STYLE_PRESETS } from "../../_data/models";
import { NODE_KIND_MAP } from "../../_data/node-kinds";
import { topoOrder } from "../../_lib/use-flow-run";
import type { FlowNodeData } from "../../_data/types";

type Patch = Partial<FlowNodeData>;

function SeedField({ seed, onChange }: { seed: number; onChange: (s: number) => void }) {
  return (
    <Field label={copy("randomSeeds")}>
      <div className="flex items-center gap-2">
        <Input value={seedLabel(seed)} readOnly className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(randomSeed())}
          aria-label={copy("randomSeeds")}
          className="size-8 shrink-0 px-0"
        >
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
          <Field label={copy("forwardPrompt")}>
            <Textarea
              value={data.positive}
              rows={4}
              autoResize
              placeholder={copy("describeThePictureYouWant")}
              onChange={(e) => onUpdate({ positive: e.target.value })}
            />
          </Field>
          <Field label={copy("negativePrompt")} description={copy("unwantedElements")}>
            <Textarea
              value={data.negative}
              rows={2}
              autoResize
              placeholder={copy("lowResolutionWatermark")}
              onChange={(e) => onUpdate({ negative: e.target.value })}
            />
          </Field>
          <Field label={copy("stylePresets")}>
            <ToggleGroup
              multiple
              value={data.styles}
              onValueChange={(v) => onUpdate({ styles: v })}
              className="flex flex-wrap gap-1.5"
            >
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
          <Field label={copy("referenceDiagram")}>
            <Upload
              variant="dropzone"
              accept="image/*"
              onSelect={(files) =>
                files[0] && onUpdate({ fileName: files[0].name, seed: randomSeed() })
              }
            />
          </Field>
          <Text size="xs" tone="muted">
            {copy("current")}
            {data.fileName}
          </Text>
        </>
      );
    case "model":
      return (
        <>
          <Field label={copy("model")}>
            <Select
              items={MODELS.map((m) => ({ value: m.id, label: m.name }))}
              value={data.model}
              onValueChange={(v) => onUpdate({ model: v as string })}
            >
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
          <Field label={copy("sampler")}>
            <Select
              items={SAMPLERS.map((s) => ({ value: s, label: s }))}
              value={data.sampler}
              onValueChange={(v) => onUpdate({ sampler: v as string })}
            >
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
          <Field label={copy("samplingStepsLabel", data.steps)}>
            <Slider
              value={data.steps}
              min={10}
              max={50}
              step={1}
              onValueChange={(v) => onUpdate({ steps: v as number })}
            />
          </Field>
          <Field label={copy("cfg", data.cfg)}>
            <Slider
              value={data.cfg}
              min={1}
              max={15}
              step={0.5}
              onValueChange={(v) => onUpdate({ cfg: v as number })}
            />
          </Field>
          <Field label={copy("dimensionRatio")}>
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
          <Field label={copy("magnification")}>
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
            <span className="text-sm">{copy("facialRepair")}</span>
            <Switch
              checked={data.faceRestore}
              onCheckedChange={(c) => onUpdate({ faceRestore: c })}
            />
          </label>
        </>
      );
    case "i2v":
      return (
        <>
          <Field label={copy("videoDurationLabel", data.duration)}>
            <Slider
              value={data.duration}
              min={2}
              max={10}
              step={1}
              onValueChange={(v) => onUpdate({ duration: v as number })}
            />
          </Field>
          <Field label={copy("frameRate")}>
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
          <Field label={copy("movementAmplitude")}>
            <Select
              items={MOTION_LEVELS}
              value={data.motion}
              onValueChange={(v) => onUpdate({ motion: v as string })}
            >
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
          <Field label={copy("outputType")}>
            <Segmented
              items={[
                { value: "image", label: copy("image") },
                { value: "video", label: copy("video") },
              ]}
              value={data.format}
              onValueChange={(v) => onUpdate({ format: v as "image" | "video" })}
            />
          </Field>
          {data.result?.type === "image" && data.result.seed != null && (
            <div className="overflow-hidden rounded-[var(--radius)] border border-border">
              <div
                className="aspect-square w-full"
                style={{ background: meshGradient(data.result.seed) }}
              />
            </div>
          )}
          {data.result?.type === "video" && (
            <Video
              src={data.result.videoUrl ?? ""}
              poster={data.result.poster}
              className="overflow-hidden rounded-[var(--radius)]"
            />
          )}
          {!data.result && (
            <Text size="xs" tone="muted">
              {copy("runToPreviewTheFinalProductHere")}
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
    const genCount = nodes.filter(
      (n) => n.data.kind === "model" || n.data.kind === "i2v" || n.data.kind === "upscale",
    ).length;
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
            {copy("workflowOverview")}
          </Text>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: copy("node"), value: nodes.length },
              { label: copy("connect"), value: edges.length },
              { label: copy("expected"), value: `${estimate}s` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[var(--radius)] border border-border bg-bg p-2.5 text-center"
              >
                <div className="text-lg font-semibold tabular-nums">{s.value}</div>
                <div className="text-[11px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div>
            <Text size="xs" tone="muted" className="mb-2">
              {copy("executionOrderTopologicalOrder")}
            </Text>
            {steps.length > 0 ? (
              <Steps direction="vertical" items={steps} current={-1} />
            ) : (
              <Text size="sm" tone="muted">
                {copy("theCanvasIsStillEmptyStartingWithTheNodeLibrary")}
              </Text>
            )}
          </div>

          <div className="rounded-[var(--radius)] border border-primary/15 bg-primary/[0.06] p-3">
            <Text size="xs" tone="muted" className="leading-relaxed">
              {copy("tipSelectTheNodeToEditTheParametersDragFrom")}
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
          {meta.label} {copy("parameters")}
        </Text>
        <Tag size="sm" tone="neutral" variant="outline">
          {meta.group}
        </Tag>
      </header>
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
        <Field label={copy("nodeName")}>
          <Input
            value={node.data.title}
            onChange={(e) => onUpdate(node.id, { title: e.target.value })}
          />
        </Field>
        <div className={cn("space-y-3.5")}>
          <NodeEditor data={node.data} onUpdate={(p) => onUpdate(node.id, p)} />
        </div>
      </div>
      <footer className="border-t border-border p-3">
        <Button
          variant="outline"
          tone="danger"
          size="sm"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="size-4" />
          {copy("deleteNode")}
        </Button>
      </footer>
    </aside>
  );
}
