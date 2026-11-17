"use client";
import { copy } from "./paper-workspace.content";

import { useRef } from "react";
import Link from "next/link";
import { MessageSquareText, Presentation, Printer, Workflow } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Descriptions,
  DescriptionsItem,
  Heading,
  Paper,
  PaperOutline,
  PaperPresenter,
  Progress,
  RelativeTime,
  Result,
  Segmented,
  Skeleton,
  Tag,
  Text,
  usePaperMode,
  type PaperMode,
} from "@hulianui/ui";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";
import { useMockData } from "../../lib/async";
import { findPaper } from "../_data/papers";
import { reviews } from "../_data/reviews";
import type { PaperSummary } from "../_data/types";
import { GitPaperBody, GitPaperHeader, ManuscriptBody } from "./git-paper";
import { StageTag } from "./stage";
import { ROOT } from "./nav-config";
import { FigureExportButton } from "./figure-export";
import { Tip } from "./tip";

/** Nearest scrolling ancestor: AdminLayout scrolls its content area, not the window. */
export function scrollParentOf(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

function ModeSwitch() {
  const [mode, setMode] = usePaperMode();
  return (
    <Segmented
      size="sm"
      aria-label={copy("paperMode")}
      value={mode}
      onValueChange={(v) => setMode(v as PaperMode)}
      items={[
        { value: "read", label: copy("read") },
        { value: "print", label: copy("printPreview") },
      ]}
    />
  );
}

function Toolbar({ paper }: { paper: PaperSummary }) {
  const [mode] = usePaperMode();
  return (
    <div className="flex flex-col gap-3 font-sans">
      <div className="flex flex-wrap items-center gap-2">
        <StageTag stage={paper.stage} />
        <Text size="sm" tone="muted" className="inline-flex items-center gap-1">
          {copy("savedAgo")} · <RelativeTime value={Date.now() - paper.updatedMinutesAgo * 60_000} locale={DOCS_LOCALE === "en" ? "en" : "zh"} />
        </Text>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <ModeSwitch />
          <PaperPresenter
            title={paper.title}
            trigger={
              <Button size="sm" variant="outline">
                <Presentation className="size-4" />
                {copy("present")}
              </Button>
            }
          />
          <FigureExportButton />
          <Tip label={copy("printPdf")}>
            <Button size="sm" variant="ghost" aria-label={copy("printPdf")} onClick={() => window.print()} className="size-8 px-0">
              <Printer className="size-4" />
            </Button>
          </Tip>
        </div>
      </div>
      {mode === "print" ? <Alert tone="info" title={copy("printHint")} /> : null}
    </div>
  );
}

function DetailsPanel({ paper }: { paper: PaperSummary }) {
  const open = reviews.filter((r) => r.status === "open").length;
  return (
    <div className="flex flex-col gap-4 font-sans">
      <Card size="sm">
        <CardHeader title={copy("details")} />
        <CardBody className="flex flex-col gap-3">
          <Descriptions column={1} size="sm" layout="vertical">
            <DescriptionsItem label={copy("venue")}>{paper.venue}</DescriptionsItem>
            <DescriptionsItem label={copy("deadline")}>
              {paper.deadlineDays === null ? copy("noDeadline") : copy("deadlineIn", paper.deadlineDays)}
            </DescriptionsItem>
          </Descriptions>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [copy("words"), paper.words.toLocaleString()],
              [copy("figures"), paper.figures],
              [copy("references"), paper.references],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[var(--radius)] bg-subtle px-2 py-2">
                <div className="text-base font-semibold tabular-nums text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <Text size="xs" tone="muted">
              {copy("progress")}
            </Text>
            <Progress value={paper.progress} showValue />
          </div>
        </CardBody>
      </Card>
      {open > 0 ? (
        <Alert
          tone="warning"
          title={copy("openComments", open)}
          action={
            <Button size="xs" variant="outline" render={<Link href={`${ROOT}/review`} />}>
              <MessageSquareText className="size-3.5" />
              {copy("goReview")}
            </Button>
          }
        />
      ) : null}
      <Button size="sm" variant="ghost" className="justify-start" render={<Link href={`${ROOT}/figures`} />}>
        <Workflow className="size-4" />
        {copy("figureStudio")}
      </Button>
    </div>
  );
}

/** The outline column; PaperOutline renders nothing in print mode, so the heading goes with it. */
function OutlineAside({ getContainer }: { getContainer: () => HTMLElement | null }) {
  const [mode] = usePaperMode();
  return (
    <aside className="hidden lg:block">
      {mode === "read" ? (
        <div className="sticky top-4">
          <Text size="xs" tone="muted" weight="medium" className="mb-2 font-sans uppercase tracking-wide">
            {copy("outline")}
          </Text>
          <PaperOutline offsetTop={16} getContainer={getContainer} />
        </div>
      ) : null}
    </aside>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
      <div className="hidden flex-col gap-2 lg:flex">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="w-4/5" />
        ))}
      </div>
      <Card>
        <CardBody className="flex flex-col gap-4 px-6 py-10 sm:px-12">
          <Skeleton className="mx-auto h-7 w-3/4" />
          <Skeleton className="mx-auto w-1/2" />
          <Skeleton shape="rect" className="mt-6 h-24 w-full" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="w-full" />
          ))}
          <Skeleton shape="rect" className="h-64 w-full" />
        </CardBody>
      </Card>
      <Skeleton shape="rect" className="hidden h-72 w-full lg:block" />
    </div>
  );
}

export function PaperWorkspace({ id }: { id: string }) {
  const summary = findPaper(id);
  const { data: paper, loading } = useMockData(summary ?? null);
  const rootRef = useRef<HTMLDivElement>(null);

  if (loading) return <WorkspaceSkeleton />;

  if (!paper || !paper.hasManuscript) {
    return (
      <Result status="info" title={copy("noManuscriptTitle")} subTitle={paper ? `${paper.title} · ${copy("noManuscriptBody")}` : copy("noManuscriptBody")}>
        <div className="flex justify-center gap-2">
          <Button variant="outline" render={<Link href={ROOT} />}>
            {copy("backToWorkbench")}
          </Button>
          <Button render={<Link href={`${ROOT}/papers/git`} />}>{copy("openGitPaper")}</Button>
        </div>
      </Result>
    );
  }

  return (
    <Paper as="div" ref={rootRef} className="flex flex-col gap-4">
      <Heading level={1} size="xl" className="sr-only">
        {paper.title}
      </Heading>
      <Toolbar paper={paper} />
      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
        <OutlineAside getContainer={() => scrollParentOf(rootRef.current)} />
        <Card variant="elevated" className="min-w-0">
          <CardBody className="px-5 py-10 sm:px-12 sm:py-14">
            <article lang={DOCS_LOCALE === "en" ? "en" : "zh-CN"}>
              <ManuscriptBody>
                <GitPaperHeader />
                <GitPaperBody />
              </ManuscriptBody>
            </article>
          </CardBody>
        </Card>
        <aside className="min-w-0">
          <div className="sticky top-4">
            <DetailsPanel paper={paper} />
          </div>
        </aside>
      </div>
    </Paper>
  );
}
