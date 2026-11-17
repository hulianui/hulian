"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Crosshair, FileText, PenLine, Plus, Search } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Drawer,
  DrawerContent,
  Empty,
  Field,
  Heading,
  Input,
  Paper,
  Popconfirm,
  Progress,
  RelativeTime,
  Segmented,
  Select,
  Skeleton,
  Statistic,
  Tag,
  Text,
  Timeline,
  toast,
  usePaperNavigate,
} from "@hulianui/ui";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";
import { useMockData, usePending } from "../../lib/async";
import { AUTHORS, papers as seedPapers } from "../_data/papers";
import { reviews } from "../_data/reviews";
import type { PaperSummary } from "../_data/types";
import { ROOT } from "../_components/nav-config";
import { PipelineFigure } from "../_components/pipeline-figure";
import { StageTag } from "../_components/stage";

type StatusFilter = "all" | "active" | "published";

const TIME_LOCALE = DOCS_LOCALE === "en" ? "en" : "zh";
const minutesAgo = (m: number) => Date.now() - m * 60_000;

const VENUES = [...new Set(seedPapers.map((p) => p.venue))];

function KpiRow({ papers }: { papers: PaperSummary[] }) {
  const active = papers.filter((p) => p.stage !== "published");
  const items = [
    { title: copy("inProgress"), value: active.length },
    { title: copy("wordsThisMonth"), value: 12480 },
    { title: copy("openReviews"), value: reviews.filter((r) => r.status === "open").length },
    { title: copy("figuresBuilt"), value: 5 },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} size="sm">
          <CardBody>
            <Statistic title={item.title} value={item.value} animate />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function PaperCard({ paper, onArchive }: { paper: PaperSummary; onArchive: (p: PaperSummary) => void }) {
  const navigate = usePaperNavigate();
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <StageTag stage={paper.stage} />
          {paper.deadlineDays !== null && paper.stage !== "published" ? (
            <Tag size="sm" variant="outline" tone={paper.deadlineDays <= 7 ? "danger" : "neutral"}>
              {copy("dueIn", paper.deadlineDays)}
            </Tag>
          ) : (
            <Tag size="sm" variant="outline" tone="neutral">
              {copy("noDeadline")}
            </Tag>
          )}
        </div>
        <div className="flex-1">
          <Heading level={3} size="base" className="line-clamp-2 leading-snug">
            {paper.title}
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            {paper.venue}
          </Text>
        </div>
        <Progress value={paper.progress} showValue tone={paper.stage === "published" ? "success" : "primary"} />
        <div className="flex items-center justify-between gap-2">
          <div className="flex -space-x-2">
            {paper.authors.map((a) => (
              <Avatar key={a} size="sm" fallback={a.slice(0, 1)} className="ring-2 ring-surface" />
            ))}
          </div>
          <Text size="xs" tone="muted">
            {copy("updated")} <RelativeTime value={minutesAgo(paper.updatedMinutesAgo)} locale={TIME_LOCALE} />
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          {paper.hasManuscript ? (
            <Button size="xs" render={<Link href={`${ROOT}/papers/${paper.id}`} />}>
              <PenLine className="size-3.5" />
              {copy("openManuscript")}
            </Button>
          ) : null}
          {/* The hook drives the pipeline figure from a real button: nesting a FigRef would render an <a> and inherit link styling. */}
          <Button size="xs" variant="outline" onClick={() => navigate.figure("fig-pipeline", paper.stage)}>
            <Crosshair className="size-3.5" />
            {copy("locateStage")}
          </Button>
          <Popconfirm title={copy("archiveConfirm")} okText={copy("archive")} danger onConfirm={() => onArchive(paper)}>
            <Button size="xs" variant="ghost" className="ms-auto">
              <Archive className="size-3.5" />
              {copy("archive")}
            </Button>
          </Popconfirm>
        </div>
      </CardBody>
    </Card>
  );
}

function NewPaperDrawer({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (p: PaperSummary) => void }) {
  const [title, setTitle] = useState("");
  const [short, setShort] = useState("");
  const [venue, setVenue] = useState<string | null>(VENUES[0] ?? null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [pending, run] = usePending();
  const titleError = touched && !title.trim() ? copy("titleRequired") : undefined;
  const shortError = touched && !short.trim() ? copy("shortRequired") : undefined;

  const submit = () => {
    setTouched(true);
    if (!title.trim() || !short.trim()) return;
    void run(() => {
      const days = deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)) : null;
      onCreate({
        id: `p-${Date.now()}`,
        title: title.trim(),
        short: short.trim(),
        venue: venue ?? "",
        stage: "topic",
        progress: 2,
        deadlineDays: days,
        words: 0,
        figures: 0,
        references: 0,
        authors: [AUTHORS.lin],
        updatedMinutesAgo: 0,
        hasManuscript: false,
      });
      toast({ tone: "success", title: copy("created", title.trim()) });
      setTitle("");
      setShort("");
      setDeadline(null);
      setTouched(false);
      onOpenChange(false);
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        title={copy("drawerTitle")}
        description={copy("drawerDescription")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {copy("cancel")}
            </Button>
            <Button loading={pending} onClick={submit}>
              {copy("create")}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label={copy("fieldTitle")} required error={titleError}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={copy("fieldTitlePlaceholder")} />
          </Field>
          <Field label={copy("fieldShort")} description={copy("fieldShortHint")} required error={shortError}>
            <Input value={short} onChange={(e) => setShort(e.target.value)} maxLength={16} />
          </Field>
          <Field label={copy("fieldVenue")}>
            <Select items={VENUES.map((v) => ({ value: v, label: v }))} value={venue} onValueChange={(v) => setVenue(v as string | null)} />
          </Field>
          <Field label={copy("fieldDeadline")}>
            <DatePicker value={deadline} onValueChange={setDeadline} minDate={new Date().toISOString().slice(0, 10)} />
          </Field>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-72" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} shape="rect" className="h-24 w-full" />
        ))}
      </div>
      <Skeleton shape="rect" className="h-72 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} shape="rect" className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function WorkbenchPage() {
  const { data, loading } = useMockData(seedPapers);
  const [added, setAdded] = useState<PaperSummary[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [drawer, setDrawer] = useState(false);

  const all = useMemo(
    () => [...added, ...(data ?? [])].filter((p) => !archivedIds.includes(p.id)),
    [added, data, archivedIds],
  );
  const visible = all.filter((p) => {
    if (status === "active" && p.stage === "published") return false;
    if (status === "published" && p.stage !== "published") return false;
    const q = query.trim().toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q);
  });

  if (loading) return <DashboardSkeleton />;

  const active = all.filter((p) => p.stage !== "published");
  const nearest = Math.min(...active.map((p) => p.deadlineDays ?? Infinity));
  const archive = (p: PaperSummary) => {
    setArchivedIds((ids) => [...ids, p.id]);
    toast({ tone: "success", title: copy("archived", p.short) });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={1} size="2xl">
            {copy("greeting", AUTHORS.lin)}
          </Heading>
          <Text tone="muted" className="mt-1">
            {copy("subtitle", active.length, Number.isFinite(nearest) ? nearest : "-")}
          </Text>
        </div>
        <Button onClick={() => setDrawer(true)}>
          <Plus className="size-4" />
          {copy("newPaper")}
        </Button>
      </header>

      <KpiRow papers={all} />

      {/* The pipeline figure and the paper cards share one Paper, so a card can drive the figure through usePaperNavigate. */}
      <Paper as="div" className="flex flex-col gap-6 [--paper-font:var(--font-sans)]">
        <Card>
          <CardHeader title={copy("pipelineTitle")} description={copy("pipelineHint")} />
          <CardBody>
            <PipelineFigure papers={all} />
          </CardBody>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Heading level={2} size="lg" className="me-auto">
                {copy("papersTitle")}
              </Heading>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy("searchPapers")}
                prefix={<Search className="size-4 text-muted-foreground" />}
                className="w-56"
                aria-label={copy("searchPapers")}
              />
              <Segmented
                size="sm"
                aria-label={copy("filterLabel")}
                value={status}
                onValueChange={(v) => setStatus(v as StatusFilter)}
                items={[
                  { value: "all", label: copy("filterAll") },
                  { value: "active", label: copy("filterActive") },
                  { value: "published", label: copy("filterPublished") },
                ]}
              />
            </div>
            {visible.length === 0 ? (
              <Card>
                <CardBody>
                  <Empty title={copy("noMatchTitle")} description={copy("noMatchBody")}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery("");
                        setStatus("all");
                      }}
                    >
                      {copy("clearFilters")}
                    </Button>
                  </Empty>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {visible.map((p) => (
                  <PaperCard key={p.id} paper={p} onArchive={archive} />
                ))}
              </div>
            )}
          </section>

          <Card className="h-fit">
            <CardHeader title={copy("activityTitle")} />
            <CardBody>
              <Timeline
                items={[
                  { color: "primary", children: copy("activityExport", AUTHORS.zhou), label: <RelativeTime value={minutesAgo(18)} locale={TIME_LOCALE} /> },
                  { color: "warning", children: copy("activityReview", AUTHORS.he), label: <RelativeTime value={minutesAgo(60 * 6)} locale={TIME_LOCALE} /> },
                  { color: "success", children: copy("activityMerge", AUTHORS.lin), label: <RelativeTime value={minutesAgo(60 * 20)} locale={TIME_LOCALE} /> },
                  { children: copy("activityCite", AUTHORS.chen), label: <RelativeTime value={minutesAgo(60 * 30)} locale={TIME_LOCALE} /> },
                  {
                    color: "primary",
                    dot: <FileText className="size-3.5 text-primary" />,
                    children: copy("activitySubmit", seedPapers.find((p) => p.id === "sparse")?.short ?? ""),
                    label: <RelativeTime value={minutesAgo(60 * 48)} locale={TIME_LOCALE} />,
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </Paper>

      <NewPaperDrawer open={drawer} onOpenChange={setDrawer} onCreate={(p) => setAdded((list) => [p, ...list])} />
    </div>
  );
}
