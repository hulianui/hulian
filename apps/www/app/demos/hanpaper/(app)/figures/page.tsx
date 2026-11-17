"use client";
import { copy } from "./page.content";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Crosshair, FileText, Layers, ListChecks, ScanEye, Workflow } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  Heading,
  Paper,
  PaperPresenter,
  Result,
  Segmented,
  Skeleton,
  Stat,
  Tag,
  Text,
  cn,
  toast,
  usePaperMode,
  usePaperNavigate,
  type PaperMode,
} from "@hulianui/ui";
import { useMockData } from "../../../lib/async";
import { FigureExportButton } from "../../_components/figure-export";
import {
  BranchMergeProcess,
  ObjectModelProcess,
  PackFigure,
  RebaseProcess,
  ThreeTreesProcess,
} from "../../_components/git-figures";
import { GIT_FIGURES } from "../../_components/git-figures";
import { ROOT } from "../../_components/nav-config";

const FIGURE_RENDER: Record<string, () => ReactNode> = {
  "fig-trees": () => <ThreeTreesProcess />,
  "fig-objects": () => <ObjectModelProcess />,
  "fig-branch": () => <BranchMergeProcess />,
  "fig-rebase": () => <RebaseProcess />,
  "fig-pack": () => <PackFigure />,
};

const FIGURE_SECTION: Record<string, string> = {
  "fig-trees": copy("sectionTrees"),
  "fig-objects": copy("sectionObjects"),
  "fig-branch": copy("sectionBranch"),
  "fig-rebase": copy("sectionRebase"),
  "fig-pack": copy("sectionPack"),
};

function ModeSwitch() {
  const [mode, setMode] = usePaperMode();
  return (
    <Segmented
      size="sm"
      aria-label={copy("paperMode")}
      value={mode}
      onValueChange={(v) => setMode(v as PaperMode)}
      items={[
        { value: "read", label: copy("readMode") },
        { value: "print", label: copy("printMode") },
      ]}
    />
  );
}

function StudioSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} shape="rect" className="h-20 w-full" />
        ))}
      </div>
      <Skeleton shape="rect" className="h-[480px] w-full" />
      <Skeleton shape="rect" className="h-96 w-full" />
    </div>
  );
}

function StatRow({ checked }: { checked: number }) {
  const steps = GIT_FIGURES.reduce((n, f) => n + f.keys.length, 0);
  const exports = GIT_FIGURES.reduce((n, f) => n + f.keys.length + (f.id === "fig-pack" ? 0 : 1), 0);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label={copy("statsFigures")} value={GIT_FIGURES.length} icon={<Workflow className="size-4" />} tone="brand" />
      <Stat label={copy("statsSteps")} value={steps} icon={<ListChecks className="size-4" />} tone="info" />
      <Stat label={copy("statsExports")} value={exports} icon={<Layers className="size-4" />} tone="success" />
      <Stat label={copy("statsChecked")} value={`${checked} / ${GIT_FIGURES.length}`} icon={<Check className="size-4" />} tone="warning" />
    </div>
  );
}

function FigureStudio() {
  const navigate = usePaperNavigate();
  const { loading, error, reload } = useMockData(GIT_FIGURES);
  const [selected, setSelected] = useState(GIT_FIGURES[0]?.id ?? "");
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set());
  const [mode] = usePaperMode();

  const figure = useMemo(() => GIT_FIGURES.find((f) => f.id === selected) ?? GIT_FIGURES[0], [selected]);
  const steps = figure?.keys ?? [];

  const toggleChecked = (id: string, title: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ tone: "info", title: copy("unmarkedToast", title) });
      } else {
        next.add(id);
        toast({ tone: "success", title: copy("markedToast", title) });
      }
      return next;
    });
  };

  if (loading) return <StudioSkeleton />;
  if (error) {
    return (
      <Result status="error" title={copy("loadFailedTitle")} subTitle={error}>
        <Button size="sm" onClick={() => void reload()}>
          {copy("retry")}
        </Button>
      </Result>
    );
  }
  if (!figure) {
    return <Empty title={copy("emptyTitle")} description={copy("emptyBody")} />;
  }

  const isChecked = checked.has(figure.id);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-3xl flex-col gap-1">
          <Heading level={1} size="xl">
            {copy("pageTitle")}
          </Heading>
          <Text size="sm" tone="muted">
            {copy("pageDescription")}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModeSwitch />
          <PaperPresenter
            title={copy("pageTitle")}
            trigger={
              <Button size="sm" variant="outline">
                <ScanEye className="size-4" />
                {copy("present")}
              </Button>
            }
          />
          <FigureExportButton />
        </div>
      </header>

      <StatRow checked={checked.size} />

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="flex min-w-0 flex-col gap-2" aria-label={copy("figureList")}>
          <Text size="xs" tone="muted" weight="medium" className="uppercase tracking-wide">
            {copy("figureList")}
          </Text>
          {GIT_FIGURES.map((f, i) => {
            const active = f.id === figure.id;
            return (
              <Button
                key={f.id}
                variant={active ? "soft" : "ghost"}
                aria-pressed={active}
                onClick={() => setSelected(f.id)}
                className={cn("h-auto w-full flex-col items-start gap-1 whitespace-normal px-3 py-2 text-start", active && "ring-1 ring-primary/30")}
              >
                <span className="flex w-full items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-subtle font-mono text-[10px] tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.caption}</span>
                  {checked.has(f.id) ? (
                    <Check className="size-3.5 shrink-0 text-success" aria-label={copy("checked")} />
                  ) : null}
                </span>
                <span className="ps-7 text-xs text-muted-foreground">{copy("stepCount", f.keys.length)}</span>
              </Button>
            );
          })}
          <Text size="xs" tone="muted">
            {copy("figureListHint")}
          </Text>
        </aside>

        <Card variant="elevated" className="min-w-0">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{copy("preview")}</span>
              <Text size="xs" tone="muted">
                {figure.caption}
              </Text>
            </div>
            <Tag size="sm" variant="outline" tone="neutral">
              {copy("stepCount", steps.length)}
            </Tag>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="rounded-[var(--radius)] border border-border bg-bg px-3 py-2" aria-label={copy("figureAria")}>
              {GIT_FIGURES.map((f) => {
                const render = FIGURE_RENDER[f.id];
                return (
                  <div key={f.id} className={f.id === figure.id ? "" : "hidden"}>
                    {render?.()}
                  </div>
                );
              })}
            </div>
            {mode === "print" ? <Alert tone="info" title={copy("printHint")} /> : null}
            <Alert tone="info" title={copy("exportHintTitle")}>{copy("exportHintBody")}</Alert>
          </CardBody>
        </Card>

        <aside className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{copy("steps")}</span>
              <Tag size="sm" variant="outline">
                {steps.length}
              </Tag>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <Text size="xs" tone="muted">
                {copy("stepsHint")}
              </Text>
              <ol className="flex flex-col gap-0.5">
                {steps.map((step, index) => (
                  <li key={step.key}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-full justify-start gap-2 whitespace-normal py-2 text-start"
                      onClick={() => navigate.figure(figure.id, step.key)}
                      title={copy("jumpToStep")}
                    >
                      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-xs leading-snug">{step.label}</span>
                      <Crosshair className="size-3.5 shrink-0 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={figure.caption} className="flex flex-col gap-0.5" />
            <CardBody className="flex flex-col gap-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                <Text as="span" size="xs" tone="muted">
                  {copy("chapterLabel")}
                </Text>
                <span>{FIGURE_SECTION[figure.id]}</span>
                <Text as="span" size="xs" tone="muted">
                  {copy("idLabel")}
                </Text>
                <span className="font-mono">{figure.id}</span>
                <Text as="span" size="xs" tone="muted">
                  {copy("captionLabel")}
                </Text>
                <span className="leading-snug">{figure.caption}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="xs"
                  variant={isChecked ? "soft" : "outline"}
                  tone={isChecked ? "success" : "brand"}
                  onClick={() => toggleChecked(figure.id, figure.caption)}
                >
                  <Check className="size-3.5" />
                  {isChecked ? copy("uncheck") : copy("markChecked")}
                </Button>
                <Button size="xs" variant="ghost" render={<Link href={`${ROOT}/papers/git`} />}>
                  <FileText className="size-3.5" />
                  {copy("openInManuscript")}
                </Button>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default function FiguresPage() {
  return (
    <Paper as="div" className="font-sans [--paper-font:var(--font-sans)]">
      <FigureStudio />
    </Paper>
  );
}
