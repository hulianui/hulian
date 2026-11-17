"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

import { useMemo, useState } from "react";
import { BookCheck, BookMarked, BookX, Copy, FileCode2, Fingerprint, Import, Trash2 } from "lucide-react";
import {
  Button,
  CodeBlock,
  Drawer,
  DrawerClose,
  DrawerContent,
  Empty,
  Field,
  Heading,
  ProTable,
  RelativeTime,
  Result,
  RowActions,
  Skeleton,
  Stat,
  Tag,
  Text,
  Textarea,
  toast,
} from "@hulianui/ui";
import type { ColumnDef } from "@hulianui/ui";
import { Tip } from "../../_components/tip";
import { formatReference, references as seed, toBibtex } from "../../_data/references";
import type { Reference, ReferenceKind, ReferenceTopic } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const KIND_LABEL: Record<ReferenceKind, string> = {
  article: copy("kindArticle"),
  inproceedings: copy("kindInproceedings"),
  book: copy("kindBook"),
  techreport: copy("kindTechreport"),
  thesis: copy("kindThesis"),
  online: copy("kindOnline"),
  commit: copy("kindCommit"),
};

const TOPIC_LABEL: Record<ReferenceTopic, string> = {
  history: copy("topicHistory"),
  hashing: copy("topicHashing"),
  diff: copy("topicDiff"),
  storage: copy("topicStorage"),
  workflow: copy("topicWorkflow"),
};

const KIND_OPTIONS = [
  { value: "all", label: copy("allKinds") },
  ...(Object.keys(KIND_LABEL) as ReferenceKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] })),
];
const TOPIC_OPTIONS = [
  { value: "all", label: copy("allTopics") },
  ...(Object.keys(TOPIC_LABEL) as ReferenceTopic[]).map((t) => ({ value: t, label: TOPIC_LABEL[t] })),
];

type Filter = { kw: string; kind: string; topic: string };
const EMPTY_FILTER: Filter = { kw: "", kind: "all", topic: "all" };

/** BibTeX entry types the importer understands, mapped to the library's kinds. */
const BIBTEX_KIND: Record<string, ReferenceKind> = {
  article: "article",
  inproceedings: "inproceedings",
  conference: "inproceedings",
  book: "book",
  techreport: "techreport",
  phdthesis: "thesis",
  mastersthesis: "thesis",
  misc: "online",
  online: "online",
};

const SAMPLE_BIBTEX = `@article{lamport1978,
  title = {Time, Clocks, and the Ordering of Events in a Distributed System},
  author = {Leslie Lamport},
  journal = {Communications of the ACM, 21(7):558-565},
  year = {1978},
  doi = {10.1145/359545.359563}
}`;

type ParseResult = { ok: true; entries: Reference[] } | { ok: false; reason: string };

/**
 * A deliberately small BibTeX reader: `@type{key, field = {value} | "value" | 1978, ...}`.
 * One level of nested braces is allowed inside values (e.g. `{The {Git} Book}`).
 */
function parseBibtex(source: string, existing: ReadonlySet<string>): ParseResult {
  const text = source.trim();
  if (!text) return { ok: false, reason: copy("errorEmpty") };
  const chunks = text.split(/(?=@\w+\s*\{)/).map((c) => c.trim()).filter(Boolean);
  const entries: Reference[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const head = /^@(\w+)\s*\{\s*([^,\s{}]+)\s*,/.exec(chunk);
    if (!head) return { ok: false, reason: copy("errorNoEntry") };
    const type = head[1].toLowerCase();
    const key = head[2];
    const kind = BIBTEX_KIND[type];
    if (!kind) return { ok: false, reason: copy("errorUnsupportedType", type) };
    if (existing.has(key) || seen.has(key)) return { ok: false, reason: copy("errorDuplicate", key) };
    seen.add(key);

    const fields: Record<string, string> = {};
    const fieldRe = /(\w+)\s*=\s*(?:\{((?:[^{}]|\{[^{}]*\})*)\}|"([^"]*)"|(\d+))/g;
    for (const m of chunk.slice(head[0].length).matchAll(fieldRe)) {
      fields[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
    }
    for (const required of ["title", "author", "year"]) {
      if (!fields[required]) return { ok: false, reason: copy("errorMissingField", key, required) };
    }
    const year = Number(fields.year);
    if (!Number.isInteger(year) || year < 1000 || year > 2100) return { ok: false, reason: copy("errorBadYear", key) };

    entries.push({
      id: key,
      authors: fields.author.split(/\s+and\s+/i).join(", "),
      title: fields.title,
      venue: fields.journal ?? fields.booktitle ?? fields.publisher ?? fields.school ?? fields.howpublished ?? fields.institution ?? "",
      year,
      kind,
      doi: fields.doi,
      url: fields.url,
      topics: [],
      citedBy: [],
      addedDaysAgo: 0,
    });
  }
  if (!entries.length) return { ok: false, reason: copy("errorNoEntry") };
  return { ok: true, entries };
}

async function copyCiteKey(key: string) {
  try {
    await navigator.clipboard.writeText(key);
    toast({ tone: "success", title: copy("citeKeyCopied", key) });
  } catch {
    toast({ tone: "danger", title: copy("copyFailed"), description: copy("copyFailedHint") });
  }
}

export default function LibraryPage() {
  const { data, loading, error, reload } = useMockData<Reference[]>(seed, { failOnce: true });
  const [imported, setImported] = useState<Reference[]>([]);
  const [removed, setRemoved] = useState<ReadonlySet<string>>(() => new Set());
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());

  const [importOpen, setImportOpen] = useState(false);
  const [bibtex, setBibtex] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, runImport] = usePending();
  const [viewing, setViewing] = useState<Reference | null>(null);

  const all = useMemo(
    () => [...imported, ...(data ?? [])].filter((r) => !removed.has(r.id)),
    [imported, data, removed],
  );

  const filtered = useMemo(() => {
    const kw = filter.kw.trim().toLowerCase();
    return all.filter((r) => {
      if (filter.kind !== "all" && r.kind !== filter.kind) return false;
      if (filter.topic !== "all" && !r.topics.includes(filter.topic as ReferenceTopic)) return false;
      if (kw && !`${r.id} ${r.title} ${r.authors}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [all, filter]);

  const pageRows = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const filtering = filter.kw.trim() !== "" || filter.kind !== "all" || filter.topic !== "all";

  const stats = useMemo(() => {
    const cited = all.filter((r) => r.citedBy.length > 0).length;
    const withDoi = all.filter((r) => r.doi).length;
    return {
      total: all.length,
      cited,
      uncited: all.length - cited,
      withDoi,
      doiRate: all.length ? Math.round((withDoi / all.length) * 100) : 0,
    };
  }, [all]);

  const applyFilter = (vals: Record<string, unknown>) => {
    setFilter({
      kw: (vals.kw as string) ?? "",
      kind: (vals.kind as string) ?? "all",
      topic: (vals.topic as string) ?? "all",
    });
    setPage(1);
  };
  const clearFilter = () => {
    setFilter(EMPTY_FILTER);
    setPage(1);
  };

  const remove = (r: Reference) => {
    setRemoved((prev) => new Set(prev).add(r.id));
    setImported((prev) => prev.filter((x) => x.id !== r.id));
    toast({ tone: "success", title: copy("referenceDeleted"), description: r.id });
  };

  const submitImport = () =>
    void runImport(() => {
      const result = parseBibtex(bibtex, new Set(all.map((r) => r.id)));
      if (!result.ok) {
        setImportError(result.reason);
        toast({ tone: "danger", title: copy("importFailed"), description: result.reason });
        return;
      }
      setImported((prev) => [...result.entries, ...prev]);
      setImportError(null);
      setBibtex("");
      setImportOpen(false);
      clearFilter();
      toast({
        tone: "success",
        title: copy("importSucceeded", result.entries.length),
        description: result.entries.map((e) => e.id).join(", "),
      });
    });

  const columns = useMemo<ColumnDef<Reference, unknown>[]>(
    () => [
      {
        id: "key",
        header: copy("colCiteKey"),
        meta: { lockVisible: true },
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1">
            <span className="font-mono text-xs text-foreground">{row.original.id}</span>
            <Tip label={copy("copyCiteKey")}>
              <Button
                variant="ghost"
                size="sm"
                className="size-7 px-0 text-muted-foreground"
                aria-label={copy("copyCiteKey")}
                onClick={() => void copyCiteKey(row.original.id)}
              >
                <Copy className="size-3.5" />
              </Button>
            </Tip>
          </span>
        ),
      },
      {
        id: "title",
        header: copy("colTitle"),
        meta: { whitespace: "normal" },
        cell: ({ row }) => (
          <div className="flex min-w-[260px] max-w-[420px] flex-col gap-0.5">
            <span className="font-medium text-foreground">{row.original.title}</span>
            <Text size="xs" tone="muted" lineClamp={1}>
              {row.original.authors}
            </Text>
          </div>
        ),
      },
      {
        id: "kind",
        header: copy("colKind"),
        cell: ({ row }) => (
          <Tag size="sm" tone={row.original.kind === "commit" || row.original.kind === "online" ? "neutral" : "info"}>
            {KIND_LABEL[row.original.kind]}
          </Tag>
        ),
      },
      {
        id: "topics",
        header: copy("colTopics"),
        cell: ({ row }) =>
          row.original.topics.length ? (
            <span className="flex flex-wrap gap-1">
              {row.original.topics.map((t) => (
                <Tag key={t} size="sm" variant="outline">
                  {TOPIC_LABEL[t]}
                </Tag>
              ))}
            </span>
          ) : (
            <Text as="span" size="xs" tone="muted">
              {copy("noTopics")}
            </Text>
          ),
      },
      {
        id: "year",
        header: copy("colYear"),
        meta: { align: "right" },
        cell: ({ row }) => <span className="tabular-nums">{row.original.year}</span>,
      },
      {
        id: "citedBy",
        header: copy("colCitedBy"),
        cell: ({ row }) =>
          row.original.citedBy.length ? (
            <span className="tabular-nums">{copy("citedByCount", row.original.citedBy.length)}</span>
          ) : (
            <Tag size="sm" tone="warning" dot>
              {copy("uncitedTag")}
            </Tag>
          ),
      },
      {
        id: "added",
        header: copy("colAdded"),
        cell: ({ row }) => (
          <RelativeTime
            value={now - row.original.addedDaysAgo * DAY_MS}
            base={now}
            locale={DEMO_RELATIVE_TIME_LOCALE}
            className="text-xs text-muted-foreground"
          />
        ),
      },
      {
        id: "actions",
        header: copy("colActions"),
        meta: { sticky: "right", lockVisible: true },
        cell: ({ row }) => {
          const r = row.original;
          const cited = r.citedBy.length > 0;
          return (
            <RowActions
              variant="icon"
              actions={[
                {
                  key: "bibtex",
                  label: copy("viewBibtex"),
                  icon: <FileCode2 className="size-4" />,
                  onSelect: () => setViewing(r),
                },
                {
                  key: "delete",
                  label: copy("deleteReference"),
                  tone: "danger",
                  icon: <Trash2 className="size-4" />,
                  disabled: cited,
                  disabledReason: copy("deleteBlocked", r.citedBy.length),
                  confirm: {
                    title: copy("deleteConfirmTitle", r.id),
                    description: copy("deleteConfirmBody"),
                    confirmText: copy("deleteConfirmOk"),
                  },
                  onSelect: () => remove(r),
                },
              ]}
            />
          );
        },
      },
    ],
    [now],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Heading level={1} size="xl">
            {copy("pageTitle")}
          </Heading>
          <Text size="sm" tone="muted">
            {copy("pageDescription")}
          </Text>
        </div>
        <Button
          onClick={() => {
            setImportError(null);
            setImportOpen(true);
          }}
          disabled={!!error}
        >
          <Import className="size-4" />
          {copy("importBibtex")}
        </Button>
      </div>

      {error ? (
        <Result status="error" title={copy("loadFailedTitle")} subTitle={error}>
          <Button size="sm" onClick={() => void reload()}>
            {copy("retry")}
          </Button>
        </Result>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat
              label={copy("statTotal")}
              value={loading ? <Skeleton className="h-8 w-14" /> : String(stats.total)}
              icon={<BookMarked className="size-4" />}
              tone="brand"
            />
            <Stat
              label={copy("statCited")}
              value={loading ? <Skeleton className="h-8 w-14" /> : String(stats.cited)}
              icon={<BookCheck className="size-4" />}
              tone="success"
            />
            <Stat
              label={copy("statUncited")}
              value={loading ? <Skeleton className="h-8 w-14" /> : String(stats.uncited)}
              hint={copy("statUncitedHint")}
              icon={<BookX className="size-4" />}
              tone="warning"
            />
            <Stat
              label={copy("statDoi")}
              value={loading ? <Skeleton className="h-8 w-14" /> : `${stats.doiRate}%`}
              hint={loading ? undefined : copy("statDoiHint", stats.withDoi, stats.total)}
              icon={<Fingerprint className="size-4" />}
              tone="info"
            />
          </div>

          <ProTable<Reference>
            title={copy("tableTitle")}
            columns={columns}
            data={pageRows}
            getRowId={(r) => r.id}
            enableSorting={false}
            loading={loading}
            toolbar={{ reload: true, density: true, columnSetting: true, fullscreen: false }}
            onReload={() => void reload()}
            search={{
              fields: [
                { name: "kw", label: copy("filterKeyword"), placeholder: copy("filterKeywordPlaceholder") },
                { name: "kind", label: copy("filterKind"), type: "select", options: KIND_OPTIONS },
                { name: "topic", label: copy("filterTopic"), type: "select", options: TOPIC_OPTIONS },
              ],
              values: filter,
              onChange: applyFilter,
              onSearch: applyFilter,
              onReset: clearFilter,
            }}
            renderEmpty={() =>
              filtering ? (
                <Empty size="sm" title={copy("noMatchTitle")} description={copy("noMatchBody")}>
                  <Button size="sm" variant="outline" onClick={clearFilter}>
                    {copy("clearFilters")}
                  </Button>
                </Empty>
              ) : (
                <Empty size="sm" title={copy("libraryEmptyTitle")} description={copy("libraryEmptyBody")} />
              )
            }
            pagination={{ page, pageSize: PAGE_SIZE, total: filtered.length, onPageChange: setPage }}
          />
        </>
      )}

      <Drawer open={importOpen} onOpenChange={setImportOpen}>
        <DrawerContent
          size="lg"
          title={copy("importTitle")}
          description={copy("importDescription")}
          footer={
            <>
              <DrawerClose render={<Button variant="outline">{copy("cancel")}</Button>} />
              <Button loading={importing} disabled={importing} onClick={submitImport}>
                {copy("importSubmit")}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <Field label={copy("bibtexLabel")} description={copy("bibtexHint")} error={importError ?? undefined}>
              <Textarea
                rows={12}
                value={bibtex}
                onChange={(e) => {
                  setBibtex(e.target.value);
                  if (importError) setImportError(null);
                }}
                placeholder={SAMPLE_BIBTEX}
                className="font-mono text-xs"
              />
            </Field>
            <Button variant="link" size="sm" className="w-fit" onClick={() => setBibtex(SAMPLE_BIBTEX)}>
              {copy("fillSample")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DrawerContent
          size="lg"
          title={copy("bibtexDrawerTitle", viewing?.id ?? "")}
          description={viewing ? formatReference(viewing) : undefined}
          footer={<DrawerClose render={<Button variant="outline">{copy("close")}</Button>} />}
        >
          {viewing && <CodeBlock code={toBibtex(viewing)} lang="bibtex" highlight={false} defaultWrap />}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
