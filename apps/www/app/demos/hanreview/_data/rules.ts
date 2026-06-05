import type { RoutingRule, GateRule } from "./types";

// 路由规则，对应 _lib/routing.ts 的分支逻辑（顺序即优先级）。
export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "rr-test-config",
    when: "文件为测试 / 配置（isTestOrConfig）",
    modelId: "haiku",
    note: "测试与配置文件审查价值密度低，派经济模型 Haiku，单价最低。",
  },
  {
    id: "rr-security",
    when: "安全敏感路径（securitySensitive，如鉴权 / 支付 / 密钥）",
    modelId: "opus",
    note: "安全问题代价高，强制升级到最强模型 Opus 做深度审计。",
  },
  {
    id: "rr-large-file",
    when: "大文件（lines > 300）",
    modelId: "sonnet",
    note: "长 diff 需要稳健的逻辑推理，派均衡模型 Sonnet。",
  },
  {
    id: "rr-default",
    when: "默认（普通业务代码）",
    modelId: "sonnet",
    note: "绝大多数 PR 走 Sonnet，质量与成本平衡。",
  },
  {
    id: "rr-cost-cap",
    when: "预估成本超出 costCap 且非经济模型",
    modelId: "haiku",
    note: "成本封顶兜底，超限自动降级到 Haiku 控制单次审查开销。",
  },
];

// 每仓库一条门禁规则；rulesets 覆盖全部 FindingType。
export const GATE_RULES: GateRule[] = [
  {
    id: "gate-hancloud-web",
    repoId: "hancloud-web",
    branch: "main",
    minScore: 70,
    maxCritical: 0,
    minCoverage: 60,
    rulesets: [
      { key: "bug", enabled: true },
      { key: "security", enabled: true },
      { key: "perf", enabled: true },
      { key: "style", enabled: false },
      { key: "complexity", enabled: true },
      { key: "test", enabled: true },
    ],
  },
  {
    id: "gate-hanpay-api",
    repoId: "hanpay-api",
    branch: "release",
    minScore: 80,
    maxCritical: 0,
    minCoverage: 75,
    rulesets: [
      { key: "bug", enabled: true },
      { key: "security", enabled: true },
      { key: "perf", enabled: true },
      { key: "style", enabled: true },
      { key: "complexity", enabled: true },
      { key: "test", enabled: true },
    ],
  },
  {
    id: "gate-hanvault-core",
    repoId: "hanvault-core",
    branch: "main",
    minScore: 85,
    maxCritical: 0,
    minCoverage: 80,
    rulesets: [
      { key: "bug", enabled: true },
      { key: "security", enabled: true },
      { key: "perf", enabled: true },
      { key: "style", enabled: false },
      { key: "complexity", enabled: true },
      { key: "test", enabled: true },
    ],
  },
  {
    id: "gate-hanshop-mobile",
    repoId: "hanshop-mobile",
    branch: "develop",
    minScore: 65,
    maxCritical: 1,
    minCoverage: 50,
    rulesets: [
      { key: "bug", enabled: true },
      { key: "security", enabled: true },
      { key: "perf", enabled: true },
      { key: "style", enabled: true },
      { key: "complexity", enabled: false },
      { key: "test", enabled: false },
    ],
  },
];
