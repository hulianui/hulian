"use client";
import { copy } from "./page.content";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button, Card, CardBody, CardSkeleton, Heading, Tag, Text, cn, toast } from "@hulianui/ui";
import { ACCENT, NODE_KIND_MAP } from "../../_data/node-kinds";
import { TEMPLATE_CATEGORY_LABELS, TEMPLATES } from "../../_data/templates";
import { topoOrder } from "../../_lib/use-flow-run";
import { useMockData } from "../../../lib/async";
import type { WorkflowTemplate } from "../../_data/types";

const CATEGORY_TONE: Record<
  WorkflowTemplate["category"],
  "brand" | "success" | "warning" | "danger"
> = {
  文生图: "brand",
  图生图: "success",
  文生视频: "warning",
  图生视频: "danger",
};

/** 模板链路条：按拓扑序把节点画成 accent 小芯片 + 箭头连接，一眼看清流水线。 */
function PipelineStrip({ template }: { template: WorkflowTemplate }) {
  const order = topoOrder(template.nodes, template.edges);
  const seen = new Set<string>();
  const chips = order
    .map((id) => template.nodes.find((n) => n.id === id))
    .filter((n): n is (typeof template.nodes)[number] => !!n)
    .map((n) => NODE_KIND_MAP[n.data.kind])
    .filter((m) => {
      if (seen.has(m.kind)) return false;
      seen.add(m.kind);
      return true;
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius)] bg-subtle/60 p-2.5">
      {chips.map((m, i) => {
        const accent = ACCENT[m.accent];
        const Icon = m.icon;
        return (
          <span key={m.kind} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
                accent.chip,
              )}
            >
              <Icon className="size-3" />
              {m.label}
            </span>
            {i < chips.length - 1 && <ChevronRight className="size-3.5 text-muted" />}
          </span>
        );
      })}
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { data: templates, loading } = useMockData(TEMPLATES, { delay: 500 });

  const handleUseTemplate = (t: WorkflowTemplate) => {
    toast({ title: copy("loading", t.name), tone: "info" });
    router.push(`/demos/ai-workflow?template=${t.id}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-7">
          <Heading level={1} size="2xl">
            {copy("templateLibrary")}
          </Heading>
          <Text tone="muted" className="mt-1.5">
            {copy("startWithAPresetWorkflowAndFineTuneAndRun")}
          </Text>
        </header>

        {loading ? (
          <CardSkeleton count={6} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(templates ?? []).map((t) => (
              <Card key={t.id} variant="elevated" className="flex h-full flex-col">
                <CardBody className="flex h-full flex-col gap-3.5 p-5">
                  <div className="flex items-center gap-2">
                    <Tag tone={CATEGORY_TONE[t.category]} size="sm">
                      {TEMPLATE_CATEGORY_LABELS[t.category]}
                    </Tag>
                    <Text size="xs" tone="muted">
                      {t.nodes.length} {copy("node")}
                    </Text>
                  </div>

                  <div>
                    <Heading level={2} size="lg">
                      {t.name}
                    </Heading>
                    <Text size="sm" tone="muted" className="mt-1">
                      {t.desc}
                    </Text>
                  </div>

                  <PipelineStrip template={t} />

                  <div className="flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <Tag key={tag} size="sm" tone="neutral" variant="outline">
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  <div className="mt-auto pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleUseTemplate(t)}
                    >
                      {copy("useMacro")}
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
