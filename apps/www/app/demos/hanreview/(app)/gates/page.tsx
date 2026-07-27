"use client";
import { useMemo, useState } from "react";
import { GitBranch, Plus, ShieldCheck, ShieldX } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Choicebox,
  ChoiceboxGroup,
  Field,
  Input,
  List,
  ListItem,
  ModalForm,
  NumberField,
  ScoreRing,
  Slider,
  Switch,
  Tag,
  toast,
  useForm,
} from "@hulianui/ui";
import type { FindingType } from "../../_data/types";
import { GATE_RULES } from "../../_data/rules";
import { REPOS } from "../../_data/repos";
import { REVIEWS } from "../../_data/reviews";
import { evalGate } from "../../_lib/gate";

// 规则集中文名 + 一句描述。
const RULESET_META: Record<FindingType, { name: string; desc: string }> = {
  bug: { name: "逻辑缺陷", desc: "空指针、边界、并发等运行时错误" },
  security: { name: "安全", desc: "注入、鉴权、密钥泄露等安全风险" },
  perf: { name: "性能", desc: "N+1 查询、无谓重渲染、阻塞调用" },
  style: { name: "风格", desc: "命名、格式、可读性约定" },
  complexity: { name: "复杂度", desc: "圈复杂度、深嵌套、超长函数" },
  test: { name: "测试覆盖", desc: "新增逻辑是否伴随测试" },
};

// 统计一条审查的 critical 批注数（散落在各文件的行内批注里）。
function countCritical(reviewId: string): number {
  const r = REVIEWS.find((x) => x.id === reviewId);
  if (!r) return 0;
  return r.files.reduce(
    (sum, f) => sum + f.annotations.filter((a) => a.severity === "critical").length,
    0,
  );
}

type NewGateForm = {
  repoId: string;
  branch: string;
  minScore: number | null;
  maxCritical: number | null;
  minCoverage: number | null;
  rulesets: string[];
};

const EMPTY_GATE: NewGateForm = {
  repoId: REPOS[0]?.id ?? "",
  branch: "main",
  minScore: 70,
  maxCritical: 0,
  minCoverage: 60,
  rulesets: ["bug", "security"],
};

// ─────────────────────────────────────────────────────────────
// 门禁规则卡：每仓库一张，rulesets 用 Switch 行本地可切。
// ─────────────────────────────────────────────────────────────
function GateRuleCard({ rule }: { rule: (typeof GATE_RULES)[number] }) {
  const repo = REPOS.find((r) => r.id === rule.repoId);
  const [rulesets, setRulesets] = useState(rule.rulesets);

  const toggle = (key: FindingType) =>
    setRulesets((prev) => prev.map((rs) => (rs.key === key ? { ...rs, enabled: !rs.enabled } : rs)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-muted" />
          <div>
            <div className="text-sm font-semibold text-foreground">{repo?.name ?? rule.repoId}</div>
            <div className="mt-0.5 text-xs text-muted">门禁分支 {rule.branch}</div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <ScoreRing value={rule.minScore} size={56} label="门禁线" />
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted">最低质量分</span>
              <Tag tone="brand" size="sm">
                {rule.minScore}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">严重问题上限</span>
              <Tag tone={rule.maxCritical === 0 ? "danger" : "warning"} size="sm">
                {rule.maxCritical}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">最低覆盖率</span>
              <Tag tone="success" size="sm">
                {rule.minCoverage}%
              </Tag>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-2 text-xs font-medium text-muted">必过规则集</div>
          <div className="flex flex-col gap-2.5">
            {rulesets.map((rs) => {
              const meta = RULESET_META[rs.key];
              return (
                <div key={rs.key} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-foreground">{meta.name}</div>
                    <div className="text-xs text-muted">{meta.desc}</div>
                  </div>
                  <Switch checked={rs.enabled} onCheckedChange={() => toggle(rs.key)} aria-label={meta.name} />
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// 门禁模拟器：三 Slider 调阈值，实时对 REVIEWS 逐条 evalGate。
// ─────────────────────────────────────────────────────────────
function GateSimulator() {
  const [minScore, setMinScore] = useState(70);
  const [maxCritical, setMaxCritical] = useState(0);
  const [minCoverage, setMinCoverage] = useState(60);

  const sample = useMemo(() => REVIEWS.slice(0, 10), []);

  const results = useMemo(() => {
    const threshold = { minScore, maxCritical, minCoverage };
    return sample.map((rev) => {
      const criticalCount = countCritical(rev.id);
      const { pass, reasons } = evalGate(threshold, {
        score: rev.score,
        criticalCount,
        coverage: rev.coverage,
      });
      return { rev, pass, reasons };
    });
  }, [sample, minScore, maxCritical, minCoverage]);

  const blocked = results.filter((r) => !r.pass);

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm font-semibold text-foreground">门禁模拟器</div>
          <div className="mt-0.5 text-xs text-muted">拖动阈值，实时预览最近 10 次审查的通过 / 阻断结果</div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted">最低质量分</span>
              <span className="font-medium text-foreground">{minScore}</span>
            </div>
            <Slider
              value={minScore}
              onValueChange={(v) => setMinScore(v as number)}
              min={0}
              max={100}
              step={1}
              aria-label="最低质量分阈值"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted">严重问题上限</span>
              <span className="font-medium text-foreground">{maxCritical}</span>
            </div>
            <Slider
              value={maxCritical}
              onValueChange={(v) => setMaxCritical(v as number)}
              min={0}
              max={5}
              step={1}
              aria-label="严重问题上限阈值"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted">最低覆盖率</span>
              <span className="font-medium text-foreground">{minCoverage}%</span>
            </div>
            <Slider
              value={minCoverage}
              onValueChange={(v) => setMinCoverage(v as number)}
              min={0}
              max={100}
              step={1}
              aria-label="最低覆盖率阈值"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-subtle px-4 py-3 text-sm">
          {blocked.length > 0 ? (
            <ShieldX className="size-5 text-danger" />
          ) : (
            <ShieldCheck className="size-5 text-success" />
          )}
          <span className="text-foreground">
            按当前阈值，最近 10 次审查中{" "}
            <strong className={blocked.length > 0 ? "text-danger" : "text-success"}>{blocked.length}</strong> 次会被阻断
          </span>
        </div>

        {blocked.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-medium text-muted">被阻断的审查</div>
            <List
              items={blocked}
              renderItem={(item) => (
                <ListItem
                  key={item.rev.id}
                  actions={item.reasons.map((reason, i) => (
                    <Tag key={i} tone="danger" size="sm">
                      {reason}
                    </Tag>
                  ))}
                >
                  <ListItem.Meta
                    avatar={<ShieldX className="size-4 text-danger" />}
                    title={item.rev.title}
                    description={`${item.rev.repoId} · ${item.rev.branch}`}
                  />
                </ListItem>
              )}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function GatesPage() {
  const [open, setOpen] = useState(false);
  const form = useForm<NewGateForm>({ initialValues: EMPTY_GATE });

  const reg = {
    repoId: form.register("repoId"),
    branch: form.register("branch", { rules: [{ required: true, message: "请输入门禁分支" }] }),
    minScore: form.register("minScore"),
    maxCritical: form.register("maxCritical"),
    minCoverage: form.register("minCoverage"),
    rulesets: form.register("rulesets"),
  };

  const openCreate = () => {
    form.resetFields();
    setOpen(true);
  };

  const handleFinish = (values: NewGateForm) => {
    const repo = REPOS.find((r) => r.id === values.repoId);
    toast({
      title: "门禁已创建",
      description: `${repo?.name ?? values.repoId} · ${values.branch} · 最低分 ${values.minScore ?? 0}`,
      tone: "success",
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">质量门禁</h1>
          <p className="mt-0.5 text-sm text-muted">为每个仓库分支设定准入阈值，不达标的 PR 自动阻断合入</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> 新建门禁
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GATE_RULES.map((rule) => (
          <GateRuleCard key={rule.id} rule={rule} />
        ))}
      </div>

      <GateSimulator />

      <ModalForm
        title="新建门禁"
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => handleFinish(v as NewGateForm)}
        submitText="创建门禁"
        className="w-[560px]"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Field label="目标仓库">
            <ChoiceboxGroup
              value={reg.repoId.value as string}
              onValueChange={(v) => reg.repoId.onChange(v as string)}
              columns={2}
              aria-label="目标仓库"
            >
              {REPOS.map((r) => (
                <Choicebox key={r.id} value={r.id} title={r.name} description={`默认分支 ${r.defaultBranch}`} />
              ))}
            </ChoiceboxGroup>
          </Field>
          <Field label="门禁分支" className="col-span-2" error={reg.branch.error}>
            <Input
              value={reg.branch.value as string}
              onChange={reg.branch.onChange}
              onBlur={reg.branch.onBlur}
              placeholder="如：main / release"
            />
          </Field>
          <Field label="最低质量分">
            <NumberField
              value={reg.minScore.value as number | null}
              onValueChange={(v) => reg.minScore.onChange(v)}
              min={0}
              max={100}
              step={1}
            />
          </Field>
          <Field label="严重问题上限">
            <NumberField
              value={reg.maxCritical.value as number | null}
              onValueChange={(v) => reg.maxCritical.onChange(v)}
              min={0}
              max={5}
              step={1}
            />
          </Field>
          <Field label="最低覆盖率（%）" className="col-span-2">
            <NumberField
              value={reg.minCoverage.value as number | null}
              onValueChange={(v) => reg.minCoverage.onChange(v)}
              min={0}
              max={100}
              step={1}
            />
          </Field>
          <Field label="必过规则集" className="col-span-2">
            <ChoiceboxGroup
              multiple
              value={reg.rulesets.value as string[]}
              onValueChange={(v) => reg.rulesets.onChange(v as string[])}
              columns={2}
              aria-label="必过规则集"
            >
              {(Object.keys(RULESET_META) as FindingType[]).map((key) => (
                <Choicebox key={key} value={key} title={RULESET_META[key].name} description={RULESET_META[key].desc} />
              ))}
            </ChoiceboxGroup>
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
