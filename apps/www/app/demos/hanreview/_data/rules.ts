import { copy } from "./rules.content";
import type { RoutingRule, GateRule } from "./types";

// 路由规则，对应 _lib/routing.ts 的分支逻辑（顺序即优先级）。
export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "rr-test-config",
    when: copy("fileForTestConfigurationIstestorconfig"),
    modelId: "haiku",
    note: copy("testingAndProfileReviewHaveLowValue"),
  },
  {
    id: "rr-security",
    when: copy("securitySensitivePathsSuchAsAuthenticationPayment"),
    modelId: "opus",
    note: copy("securityIssuesAreCostlyForcingADeep"),
  },
  {
    id: "rr-large-file",
    when: copy("largeFilesLines"),
    modelId: "sonnet",
    note: copy("longDiffsRequireRobustLogicalReasoningSo"),
  },
  {
    id: "rr-default",
    when: copy("defaultStandardBusinessCode"),
    modelId: "sonnet",
    note: copy("theVastMajorityOfPrGoesThrough"),
  },
  {
    id: "rr-cost-cap",
    when: copy("estimatedCostsExceedCostcapAndAreNot"),
    modelId: "haiku",
    note: copy("costCapGuaranteesTheBottomAndOver"),
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
