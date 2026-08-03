"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../_components/demo-locale";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, GitBranch, ExternalLink, Globe, Boxes } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Field,
  Input,
  Empty,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  Tag,
  ModalForm,
  useForm,
  toast,
  GitCommit,
  DeployStatus,
  RelativeTime,
} from "@hulianui/ui";
import { projects as seed, deployById } from "../_data/store";
import type { Project, Framework } from "../_data/types";
import { agoDate } from "../_lib/format";
import { useMockData } from "../../lib/async";
import { ROOT } from "../_components/nav-config";

const FRAMEWORKS: Framework[] = ["Next.js", "Vite", "Astro", "Nuxt", "Remix", "静态站点"];
const frameworkLabel = (framework: Framework) => framework === "静态站点" ? copy("staticSite") : framework;

type ProjectForm = {
  name: string;
  repo: string;
  framework: Framework;
  branch: string;
  autoDeploy: boolean;
};

const EMPTY_FORM: ProjectForm = { name: "", repo: "", framework: "Next.js", branch: "main", autoDeploy: true };

function ProjectCard({ p }: { p: Project }) {
  const router = useRouter();
  const cur = deployById(p.currentDeployId);
  const href = `${ROOT}/projects/${p.id}`;

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <CardBody className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-surface-hover text-muted">
              <Boxes className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{p.name}</div>
              <Tag size="sm" tone="neutral">
                {frameworkLabel(p.framework)}
              </Tag>
            </div>
          </div>
          {cur && <DeployStatus status={cur.status} variant="dot" size="sm" />}
        </div>

        <a
          href={`https://${p.prodUrl}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex w-fit max-w-full items-center gap-1.5 truncate text-sm text-muted transition-colors hover:text-primary"
        >
          <Globe className="size-3.5 shrink-0" />
          <span className="truncate">{p.prodUrl}</span>
          <ExternalLink className="size-3 shrink-0 opacity-60" />
        </a>

        {/* 当前生产部署 —— dogfood GitCommit + DeployStatus */}
        <div className="rounded-[var(--radius)] border border-border bg-surface/60 p-3">
          {cur ? (
            <div className="flex flex-col gap-2">
              <GitCommit layout="stacked" sha={cur.sha} branch={cur.branch} message={cur.message} size="sm" />
              <div className="flex items-center justify-between">
                <DeployStatus status={cur.status} size="sm" />
                <RelativeTime value={agoDate(cur.agoMin)} locale={DEMO_RELATIVE_TIME_LOCALE} className="text-xs text-muted" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted">{copy("noDeploymentYet")}</div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-hairline pt-2.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="size-3.5" />
            {p.repo}
          </span>
          <span>{p.domainCount > 0 ? copy("valueDomains", p.domainCount) : copy("defaultDomainName")}</span>
        </div>
      </CardBody>
    </Card>
  );
}

export default function ProjectsOverviewPage() {
  const { data, loading } = useMockData<Project[]>(seed);
  const [items, setItems] = useState<Project[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const form = useForm<ProjectForm>({ initialValues: EMPTY_FORM });

  // data 到位后落本地可变副本（支持新建）。
  const list = items ?? data ?? [];
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return list;
    return list.filter((p) => p.name.toLowerCase().includes(kw) || p.repo.toLowerCase().includes(kw));
  }, [list, q]);

  const reg = {
    name: form.register("name", { rules: [{ required: true, message: copy("pleaseEnterProjectName") }] }),
    repo: form.register("repo", { rules: [{ required: true, message: copy("pleaseEnterTheRepositoryOrgRepo") }] }),
    framework: form.register("framework"),
    branch: form.register("branch", { rules: [{ required: true, message: copy("pleaseEnterTheProductionBranch") }] }),
    autoDeploy: form.register("autoDeploy"),
  };

  const handleFinish = (v: ProjectForm) => {
    const slug = v.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-project";
    const np: Project = {
      id: `p${Date.now()}`,
      name: v.name.trim(),
      slug,
      framework: v.framework,
      repo: v.repo.trim(),
      productionBranch: v.branch.trim(),
      prodUrl: `${slug}.hanship.dev`,
      domainCount: 0,
      autoDeploy: v.autoDeploy,
      currentDeployId: "",
      createdAgoDays: 0,
    };
    setItems([np, ...list]);
    toast({ tone: "success", title: copy("projectCreated"), description: copy("valueIsConnectedToValueAndWill", np.name, np.repo, np.productionBranch) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{copy("project")}</h1>
          <p className="text-sm text-muted">{list.length}{copy("projectsGitConnectedAutomaticDeploymentToGlobal")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={copy("searchItemsWarehouses")}
              className="w-48 pl-8 sm:w-60"
              aria-label={copy("searchItems")}
            />
          </div>
          <Button
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            <Plus className="size-4" />{copy("newProject")}</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardBody className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-9 rounded-[var(--radius)]" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-20 w-full rounded-[var(--radius)]" />
                <Skeleton className="h-4 w-full" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <Empty
              title={q ? copy("noItemsMatchingValue", q) : copy("noProjectsYet")}
              description={q ? copy("changeTheKeywordOrCreateANew") : copy("connectToAGitRepositoryToStart")}
            >
              {q ? (
                <Button variant="outline" onClick={() => setQ("")}>{copy("clearSearch")}</Button>
              ) : (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="size-4" />{copy("newProject2")}</Button>
              )}
            </Empty>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <ModalForm
        title={copy("newProject3")}
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => handleFinish(v as ProjectForm)}
        submitText={copy("createAndDeploy")}
        className="w-[520px]"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Field label={copy("projectName")} className="col-span-2" error={reg.name.error}>
            <Input value={reg.name.value as string} onChange={reg.name.onChange} onBlur={reg.name.onBlur} placeholder={copy("suchAsHanshipDocs")} />
          </Field>
          <Field label={copy("gitRepository")} className="col-span-2" error={reg.repo.error}>
            <Input value={reg.repo.value as string} onChange={reg.repo.onChange} onBlur={reg.repo.onBlur} placeholder={copy("orgRepoSuchAsHulianuiHulian")} />
          </Field>
          <Field label={copy("framePresets")}>
            <Select
              items={FRAMEWORKS.map((f) => ({ value: f, label: frameworkLabel(f) }))}
              value={reg.framework.value as string}
              onValueChange={(v) => reg.framework.onChange(v as string)}
            >
              <SelectTrigger />
              <SelectContent>
                {FRAMEWORKS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={copy("productionBranch")} error={reg.branch.error}>
            <Input value={reg.branch.value as string} onChange={reg.branch.onChange} onBlur={reg.branch.onBlur} placeholder="main" />
          </Field>
          <Field label={copy("automaticDeployment")} className="col-span-2" description={copy("automaticallyTriggerDeploymentWhenPushingToProduction")}>
            <Switch
              checked={reg.autoDeploy.value as boolean}
              onCheckedChange={(c) => reg.autoDeploy.onChange(c)}
              aria-label={copy("automaticDeployment2")}
            />
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
