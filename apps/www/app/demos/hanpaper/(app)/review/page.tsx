"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Crosshair, FileText, MessageSquareText, RotateCcw, Send } from "lucide-react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  DrawerClose,
  DrawerContent,
  Empty,
  Field,
  Heading,
  Paper,
  RelativeTime,
  Result,
  Segmented,
  Select,
  Skeleton,
  Stat,
  Tag,
  Text,
  Textarea,
  toast,
  usePaperNavigate,
} from "@hulianui/ui";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";
import { useMockData, usePending } from "../../../lib/async";
import { reviews as seedReviews } from "../../_data/reviews";
import type { ReviewComment, ReviewSeverity, ReviewStatus } from "../../_data/types";
import { GIT_FIGURES } from "../../_components/git-figures";
import { GitPaperBody, GitPaperHeader, ManuscriptBody } from "../../_components/git-paper";
import { ROOT } from "../../_components/nav-config";

const FIGURE_META = new Map(GIT_FIGURES.map((f, i) => [f.id, { number: i + 1, keys: f.keys }]));

const SECTION_LABEL: Record<string, string> = {
  "sec-intro": copy("sectionIntro"),
  "sec-related": copy("sectionRelated"),
  "sec-trees": copy("sectionTrees"),
  "sec-index": copy("sectionIndex"),
  "sec-objects": copy("sectionObjects"),
  "sec-integrity": copy("sectionIntegrity"),
  "sec-branch": copy("sectionBranch"),
  "sec-rebase": copy("sectionRebase"),
  "sec-pack": copy("sectionPack"),
  "sec-conclusion": copy("sectionConclusion"),
  "sec-ack": copy("sectionAck"),
};

const SEVERITY_LABEL: Record<ReviewSeverity, string> = {
  major: copy("severityMajor"),
  minor: copy("severityMinor"),
  typo: copy("severityTypo"),
};
const SEVERITY_TONE: Record<ReviewSeverity, "danger" | "warning" | "neutral"> = {
  major: "danger",
  minor: "warning",
  typo: "neutral",
};
const SEVERITY_ITEMS = [
  { value: "all", label: copy("severityAll") },
  ...(Object.keys(SEVERITY_LABEL) as ReviewSeverity[]).map((s) => ({ value: s, label: SEVERITY_LABEL[s] })),
];

type Filter = "all" | ReviewStatus;
type Patch = Partial<Pick<ReviewComment, "status" | "reply">>;

function anchorText(anchor: ReviewComment["anchor"]) {
  if (anchor.kind === "section") return SECTION_LABEL[anchor.id] ?? copy("missingAnchor");
  const meta = FIGURE_META.get(anchor.id);
  if (!meta) return copy("missingAnchor");
  const index = anchor.state ? meta.keys.findIndex((k) => k.key === anchor.state) : -1;
  return copy("figureAnchor", meta.number, index >= 0 ? `(${String.fromCharCode(97 + index)})` : "");
}

function ReviewSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Skeleton shape="rect" className="h-[720px] w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton shape="rect" className="h-28 w-full" />
        <Skeleton shape="rect" className="h-40 w-full" />
        <Skeleton shape="rect" className="h-40 w-full" />
      </div>
    </div>
  );
}

function ReviewWorkspace() {
  const navigate = usePaperNavigate();
  const { data, loading, error, reload } = useMockData(seedReviews);
  const [changes, setChanges] = useState<Record<string, Patch>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [severity, setSeverity] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [replyFor, setReplyFor] = useState<ReviewComment | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [pending, run] = usePending();

  const comments = useMemo(
    () => (data ?? []).map((comment) => ({ ...comment, ...(changes[comment.id] ?? {}) })),
    [data, changes],
  );
  const open = comments.filter((c) => c.status === "open").length;
  const resolved = comments.length - open;
  const major = comments.filter((c) => c.severity === "major").length;

  const filtered = useMemo(
    () =>
      comments.filter((c) => {
        if (filter !== "all" && c.status !== filter) return false;
        if (severity !== "all" && c.severity !== severity) return false;
        return true;
      }),
    [comments, filter, severity],
  );

  const jump = (comment: ReviewComment) => {
    if (comment.anchor.kind === "figure") navigate.figure(comment.anchor.id, comment.anchor.state);
    else navigate.section(comment.anchor.id);
  };

  const toggle = (comment: ReviewComment) => {
    const next: ReviewStatus = comment.status === "open" ? "resolved" : "open";
    setBusy(comment.id);
    void run(() => {
      setChanges((prev) => ({ ...prev, [comment.id]: { ...prev[comment.id], status: next } }));
      toast({
        tone: next === "resolved" ? "success" : "info",
        title: copy(next === "resolved" ? "resolvedToast" : "reopenedToast", anchorText(comment.anchor)),
      });
    }).finally(() => setBusy(null));
  };

  const openReply = (comment: ReviewComment) => {
    setReplyFor(comment);
    setReplyDraft(comment.reply ?? "");
    setReplyError(null);
  };

  const submitReply = () => {
    if (!replyFor) return;
    if (!replyDraft.trim()) {
      setReplyError(copy("replyRequired"));
      return;
    }
    const target = replyFor;
    setBusy(target.id);
    void run(() => {
      setChanges((prev) => ({ ...prev, [target.id]: { ...prev[target.id], reply: replyDraft.trim() } }));
      toast({ tone: "success", title: copy("replySaved", anchorText(target.anchor)) });
      setReplyFor(null);
      setReplyDraft("");
      setReplyError(null);
    }).finally(() => setBusy(null));
  };

  if (loading) return <ReviewSkeleton />;
  if (error) {
    return (
      <Result status="error" title={copy("loadFailedTitle")} subTitle={error}>
        <Button size="sm" onClick={() => void reload()}>
          {copy("retry")}
        </Button>
      </Result>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3 font-sans">
        <div className="flex max-w-3xl flex-col gap-1">
          <Heading level={1} size="xl">
            {copy("pageTitle")}
          </Heading>
          <Text size="sm" tone="muted">
            {copy("pageDescription")}
          </Text>
        </div>
        <Button variant="outline" size="sm" render={<Link href={`${ROOT}/papers/git`} />}>
          <FileText className="size-4" />
          {copy("openManuscript")}
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-3 font-sans">
        <Stat label={copy("openComments")} value={open} icon={<MessageSquareText className="size-4" />} tone="warning" />
        <Stat label={copy("resolvedComments")} value={resolved} icon={<Check className="size-4" />} tone="success" />
        <Stat label={copy("majorComments")} value={major} icon={<Crosshair className="size-4" />} tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card variant="elevated" className="min-w-0">
          <CardHeader title={copy("paperPreview")} />
          <CardBody className="px-5 py-10 sm:px-12 sm:py-14">
            <article lang={DOCS_LOCALE === "en" ? "en" : "zh-CN"}>
              <ManuscriptBody>
                <GitPaperHeader />
                <GitPaperBody />
              </ManuscriptBody>
            </article>
          </CardBody>
        </Card>

        <aside className="flex min-w-0 flex-col gap-3 font-sans">
          <Alert tone="info" title={copy("jumpHint")} />
          <Card size="sm">
            <CardHeader title={copy("reviewThread")} />
            <CardBody className="flex flex-col gap-3">
              <Segmented
                size="sm"
                aria-label={copy("filterLabel")}
                value={filter}
                onValueChange={(v) => setFilter(v as Filter)}
                items={[
                  { value: "all", label: copy("filterAll", comments.length) },
                  { value: "open", label: copy("filterOpen", open) },
                  { value: "resolved", label: copy("filterResolved", resolved) },
                ]}
              />
              <Select items={SEVERITY_ITEMS} value={severity} onValueChange={(v) => setSeverity(v as string)} aria-label={copy("severityLabel")} />
            </CardBody>
          </Card>

          {filtered.length === 0 ? (
            <Empty title={copy("emptyTitle")} description={copy("emptyBody")}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFilter("all");
                  setSeverity("all");
                }}
              >
                {copy("clearFilters")}
              </Button>
            </Empty>
          ) : (
            <ul className="flex max-h-[calc(100vh-18rem)] flex-col gap-3 overflow-y-auto pe-1">
              {filtered.map((comment) => {
                const isOpen = comment.status === "open";
                return (
                  <li key={comment.id}>
                    <Card size="sm" className={isOpen ? "border-warning/30" : undefined}>
                      <CardBody className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm" fallback={comment.reviewer.slice(0, 1)} />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">{comment.reviewer}</span>
                            <Text size="xs" tone="muted" truncate>
                              {comment.role}
                            </Text>
                          </div>
                          <Tag size="sm" tone={SEVERITY_TONE[comment.severity]}>
                            {SEVERITY_LABEL[comment.severity]}
                          </Tag>
                          <Tag size="sm" variant="outline" tone={isOpen ? "warning" : "success"}>
                            {copy(isOpen ? "statusOpen" : "statusResolved")}
                          </Tag>
                        </div>

                        <Text size="sm" className="whitespace-pre-wrap">
                          {comment.body}
                        </Text>

                        {comment.reply ? (
                          <div className="rounded-[var(--radius)] border-s-2 border-success/50 bg-success-subtle/40 px-3 py-2">
                            <Text size="xs" tone="muted" weight="medium">
                              {copy("reply")}
                            </Text>
                            <Text size="sm">{comment.reply}</Text>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button size="xs" variant="outline" onClick={() => jump(comment)} title={copy("locate")}>
                            <Crosshair className="size-3.5" />
                            {anchorText(comment.anchor)}
                          </Button>
                          <Button size="xs" variant="ghost" onClick={() => openReply(comment)}>
                            <Send className="size-3.5" />
                            {copy("reply")}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            tone={isOpen ? "success" : "neutral"}
                            loading={pending && busy === comment.id}
                            disabled={pending && busy === comment.id}
                            onClick={() => toggle(comment)}
                            className="ms-auto"
                          >
                            {isOpen ? <Check className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                            {copy(isOpen ? "resolve" : "reopen")}
                          </Button>
                        </div>
                        <Text size="xs" tone="muted">
                          <RelativeTime
                            value={Date.now() - comment.createdHoursAgo * 3_600_000}
                            locale={DEMO_RELATIVE_TIME_LOCALE}
                          />
                        </Text>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      <Drawer
        open={replyFor !== null}
        onOpenChange={(next) => {
          if (!next) {
            setReplyFor(null);
            setReplyDraft("");
            setReplyError(null);
          }
        }}
      >
        <DrawerContent
          title={copy("replyTitle", replyFor?.reviewer ?? "")}
          description={copy("replyDescription")}
          footer={
            <>
              <DrawerClose render={<Button variant="outline">{copy("cancel")}</Button>} />
              <Button loading={pending} disabled={pending} onClick={submitReply}>
                {copy("sendReply")}
              </Button>
            </>
          }
        >
          <Field label={copy("replyLabel")} error={replyError ?? undefined}>
            <Textarea
              rows={7}
              value={replyDraft}
              onChange={(e) => {
                setReplyDraft(e.target.value);
                if (replyError) setReplyError(null);
              }}
              placeholder={copy("replyPlaceholder")}
            />
          </Field>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Paper as="div">
      <ReviewWorkspace />
    </Paper>
  );
}
