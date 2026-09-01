// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import {
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  createSourceFile,
  forEachChild,
  isJsxText,
  isCallExpression,
  isIdentifier,
  isStringLiteralLike,
  type Node,
} from "typescript-api";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const DEMOS_ROOT = new URL("..", import.meta.url).pathname;
const HAN_OR_CJK_PUNCTUATION = /[\p{Script=Han}，。！？；：、“”‘’（）【】《》〈〉「」『』…]/u;
type ProtocolExemption = {
  literals: readonly string[];
  reason: string;
  /** Tokens proving the canonical values are mapped before Task 11 presentation. */
  mappingEvidence: readonly string[];
};

const INTERNAL_PROTOCOL_EXEMPTIONS = new Map<string, ProtocolExemption>([
  [
    "crm/_data/metrics.ts",
    {
      literals: ["已成交", "跟进中", "赢单", "输单", "已退款", "月"],
      reason: "CRM aggregate comparisons and the Chinese month suffix are stable fixture protocol values",
      mappingEvidence: ["oppStageLabel", "DOCS_LOCALE"],
    },
  ],
  [
    "crm/_data/orders.ts",
    {
      literals: ["已完成", "已发货", "已付款", "待付款", "已退款"],
      reason: "CRM order status seeds are typed protocol values localized by consumers",
      mappingEvidence: [],
    },
  ],
  [
    "crm/_data/protocol.ts",
    {
      literals: [
        "制造", "互联网", "餐饮", "医疗", "教育", "物流", "传媒", "地产", "农业",
        "贸易", "金融", "零售", "出行", "建材", "咨询", "食品", "能源", "林晚晴",
        "周明远", "高敏", "陈策", "苏晓",
      ],
      reason: "CRM canonical owner and industry identifiers are stable protocol values",
      mappingEvidence: [],
    },
  ],
  [
    "ai-chat/conversations.ts",
    {
      literals: ["今天", "昨天", "7 天内"],
      reason: "Conversation group IDs remain canonical",
      mappingEvidence: ["CONVERSATION_GROUP_LABELS", "copy(\"today\")"],
    },
  ],
  [
    "ai-chat/page.tsx",
    {
      literals: ["今天"],
      reason: "New conversations use the canonical group ID",
      mappingEvidence: ["CONVERSATION_GROUP_LABELS"],
    },
  ],
  [
    "ai-workflow/_data/templates.ts",
    {
      literals: ["文生图", "图生图", "文生视频", "图生视频"],
      reason: "Workflow template category discriminators remain canonical",
      mappingEvidence: ["TEMPLATE_CATEGORY_LABELS", "copy(\"textToImage\")"],
    },
  ],
  [
    "knowledge/_data/images.ts",
    {
      literals: ["设计稿", "海报", "截图", "插画", "原型"],
      reason: "Knowledge image categories remain canonical SVG inputs",
      mappingEvidence: ["CATEGORY_LABEL", "CATEGORY_LABEL[category]"],
    },
  ],
  [
    "knowledge/_data/vault.ts",
    {
      literals: ["设计稿", "海报", "原型", "插画", "截图"],
      reason: "Vault image seeds pass canonical categories to the locale-aware SVG builder",
      mappingEvidence: ["vaultImage("],
    },
  ],
  [
    "learn/_data/courses.ts",
    {
      literals: ["进阶", "高级", "入门"],
      reason: "Course level discriminators remain canonical",
      mappingEvidence: ["COURSE_LEVEL_NAME", "copy(\"beginner\")"],
    },
  ],
  [
    "learn/_components/discussion-tab.tsx",
    {
      literals: ["助教-小研", "夏小满", "陈起"],
      reason: "Mention insertion values remain canonical while option labels are localized",
      mappingEvidence: ["label: copy(\"assistantTeacherXiaoyan\")", "label: copy(\"xiaXiaoman\")", "label: copy(\"chenQi\")"],
    },
  ],
  [
    "scheduler/_data/clinic.ts",
    {
      literals: ["初诊", "复诊", "检查", "处置", "停诊"],
      reason: "Appointment type discriminators remain canonical",
      mappingEvidence: ["TYPE_LABELS", "TYPE_LABELS[type]"],
    },
  ],
  [
    "scheduler/_components/appointment-form.tsx",
    {
      literals: ["初诊", "复诊", "检查", "处置"],
      reason: "Appointment form option values remain canonical",
      mappingEvidence: ["TYPE_LABELS[t]"],
    },
  ],
  [
    "scheduler/_components/scheduler-shell.tsx",
    {
      literals: ["停诊"],
      reason: "Leave comparisons remain canonical while every rendered type uses TYPE_LABELS",
      mappingEvidence: ["TYPE_LABELS[v.type as ApptType]", "TYPE_LABELS[appt.type]"],
    },
  ],
  [
    "dashboard/_data/snapshot.ts",
    {
      literals: ["亚太", "北美", "欧洲", "中东", "南美", "非洲", "正常", "繁忙", "告警", "严重", "警告", "提示", "信息"],
      reason: "Dashboard region, node status, and event level discriminators remain canonical",
      mappingEvidence: ["REGION_LABELS", "NODE_STATUS_LABELS", "EVENT_LEVEL_LABELS"],
    },
  ],
  [
    "dashboard/_components/header-bar.tsx",
    {
      literals: ["正常", "异常"],
      reason: "Dashboard data-source Select values remain canonical",
      mappingEvidence: ["DATA_SOURCE_LABELS", "copy(\"dataSourceNormal\")"],
    },
  ],
  [
    "dashboard/_components/dashboard-shell.tsx",
    {
      literals: ["正常", "异常"],
      reason: "Dashboard state and comparisons use canonical data-source values",
      mappingEvidence: ["DATA_SOURCE_LABELS[s]"],
    },
  ],
  [
    "mobile/_data/services.ts",
    {
      literals: ["家政保洁", "家电维修", "上门美甲", "管道疏通", "搬家搬运", "开锁换锁"],
      reason: "Mobile service categories remain canonical filter identifiers",
      mappingEvidence: ["SERVICE_CATEGORY_LABELS", 'copy("homeCleaning")'],
    },
  ],
  [
    "mobile/_data/orders.ts",
    {
      literals: ["家政保洁", "待评价", "家电维修", "服务中", "上门美甲", "待确认", "已完成", "管道疏通", "已取消"],
      reason: "Mobile order categories and statuses remain canonical fixture identifiers",
      mappingEvidence: ["ORDER_STATUS_LABELS", 'copy("pendingConfirmation")'],
    },
  ],
  [
    "mobile/(app)/categories/page.tsx",
    {
      literals: ["家政保洁"],
      reason: "The initial category state uses the canonical filter identifier",
      mappingEvidence: ["SERVICE_CATEGORY_LABELS[cat]", "SERVICE_CATEGORY_LABELS[selected]"],
    },
  ],
  [
    "mobile/(app)/orders/page.tsx",
    {
      literals: ["待评价", "已完成", "已取消"],
      reason: "Order actions compare canonical status identifiers",
      mappingEvidence: ["ORDER_STATUS_LABELS[order.status]"],
    },
  ],
  [
    "personal/_data/works.ts",
    {
      literals: ["在线", "开源", "已下架"],
      reason: "Portfolio availability values remain canonical work identifiers",
      mappingEvidence: ["WORK_STATUS_LABELS", 'copy("online")'],
    },
  ],
  [
    "personal/_components/sections/work.tsx",
    {
      literals: ["在线"],
      reason: "Pulse behavior compares the canonical online status",
      mappingEvidence: ["WORK_STATUS_LABELS[work.status]"],
    },
  ],
  [
    "personal/_components/work-detail.tsx",
    {
      literals: ["在线"],
      reason: "Detail pulse behavior compares the canonical online status",
      mappingEvidence: ["WORK_STATUS_LABELS[work.status]"],
    },
  ],
]);
const TASK_11_DEMOS = new Set([
  "ai-chat",
  "ai-workflow",
  "knowledge",
  "learn",
  "scheduler",
  "dashboard",
]);
const TASK_12_DEMOS = new Set(["live", "mobile", "personal", "shop", "website"]);
const STRICT_DEMOS = new Set([...TASK_11_DEMOS, ...TASK_12_DEMOS]);

function chineseLiteralNodes(file: string, source: string): string[] {
  // setParentNodes=false：本文件只向下遍历（forEachChild），getText 也显式传了 sourceFile，
  // 全程不读 node.parent。建 parent 指针要为 633 个文件多花 3 倍时间（458ms → 140ms）。
  const sourceFile = createSourceFile(
    file,
    source,
    ScriptTarget.Latest,
    false,
    file.endsWith("x") ? ScriptKind.TSX : ScriptKind.TS,
  );
  const values: string[] = [];
  const visit = (node: Node) => {
    if (
      isStringLiteralLike(node) ||
      isJsxText(node) ||
      node.kind === SyntaxKind.TemplateHead ||
      node.kind === SyntaxKind.TemplateMiddle ||
      node.kind === SyntaxKind.TemplateTail
    ) {
      const value = "text" in node ? String(node.text) : node.getText(sourceFile);
      if (HAN_OR_CJK_PUNCTUATION.test(value)) values.push(value.trim());
    }
    forEachChild(node, visit);
  };
  visit(sourceFile);
  return values.filter(Boolean);
}

function consumedContentKeys(file: string, source: string): Set<string> {
  // setParentNodes=false：本文件只向下遍历（forEachChild），getText 也显式传了 sourceFile，
  // 全程不读 node.parent。建 parent 指针要为 633 个文件多花 3 倍时间（458ms → 140ms）。
  const sourceFile = createSourceFile(
    file,
    source,
    ScriptTarget.Latest,
    false,
    file.endsWith("x") ? ScriptKind.TSX : ScriptKind.TS,
  );
  const keys = new Set<string>();
  const visit = (node: Node) => {
    if (
      isCallExpression(node) &&
      isIdentifier(node.expression) &&
      node.expression.text === "copy" &&
      node.arguments[0] &&
      isStringLiteralLike(node.arguments[0])
    )
      keys.add(node.arguments[0].text);
    else if (
      isCallExpression(node) &&
      isIdentifier(node.expression) &&
      node.expression.text === "copy" &&
      node.arguments[0]
    ) {
      const collectKey = (candidate: Node) => {
        if (isStringLiteralLike(candidate)) keys.add(candidate.text);
        else forEachChild(candidate, collectKey);
      };
      collectKey(node.arguments[0]);
    }
    forEachChild(node, visit);
  };
  visit(sourceFile);
  return keys;
}

const inventory = {
  "ai-chat": {
    routes: ["page.tsx"],
    fixtures: ["conversations.ts"],
  },
  "ai-workflow": {
    routes: [
      "(app)/gallery/page.tsx",
      "(app)/page.tsx",
      "(app)/profile/page.tsx",
      "(app)/templates/page.tsx",
      "login/page.tsx",
    ],
    fixtures: ["_data/artifacts.ts", "_data/models.ts", "_data/templates.ts"],
  },
  billing: {
    routes: [
      "(app)/invoices/page.tsx",
      "(app)/page.tsx",
      "(app)/payment/page.tsx",
      "(app)/plans/page.tsx",
      "(app)/settings/page.tsx",
      "login/page.tsx",
    ],
    fixtures: ["_data/account.ts", "_data/invoices.ts", "_data/plans.ts"],
  },
  crm: {
    routes: [
      "(app)/customers/[id]/page.tsx",
      "(app)/customers/page.tsx",
      "(app)/opportunities/page.tsx",
      "(app)/orders/page.tsx",
      "(app)/page.tsx",
      "(app)/settings/page.tsx",
      "login/page.tsx",
    ],
    fixtures: [
      "_data/customers.ts",
      "_data/follows.ts",
      "_data/metrics.ts",
      "_data/opportunities.ts",
      "_data/orders.ts",
      "_data/protocol.ts",
      "_data/status.ts",
    ],
  },
  dashboard: {
    routes: ["(app)/page.tsx"],
    fixtures: ["_data/snapshot.ts"],
  },
  "customer-service": {
    routes: [
      "(app)/analytics/page.tsx",
      "(app)/knowledge/page.tsx",
      "(app)/page.tsx",
      "(app)/settings/page.tsx",
      "(app)/tickets/[id]/page.tsx",
      "(app)/tickets/page.tsx",
      "login/page.tsx",
    ],
    fixtures: [
      "_data/conversations.ts",
      "_data/customers.ts",
      "_data/knowledge.ts",
      "_data/labels.ts",
      "_data/metrics.ts",
      "_data/tickets.ts",
    ],
  },
  projects: {
    routes: [
      "(app)/checkout/[id]/page.tsx",
      "(app)/checkout/page.tsx",
      "(app)/invoices/page.tsx",
      "(app)/page.tsx",
      "(app)/photos/page.tsx",
      "(app)/quotes/[id]/page.tsx",
      "(app)/quotes/page.tsx",
      "(app)/tracking/[id]/page.tsx",
      "(app)/tracking/page.tsx",
    ],
    fixtures: [
      "_data/checkouts.ts",
      "_data/invoices.ts",
      "_data/metrics.ts",
      "_data/photos.ts",
      "_data/projects.ts",
      "_data/quotes.ts",
      "_data/status.ts",
    ],
  },
  hanhub: {
    routes: [
      "(app)/billing/page.tsx",
      "(app)/health/page.tsx",
      "(app)/keys/page.tsx",
      "(app)/logs/page.tsx",
      "(app)/models/page.tsx",
      "(app)/page.tsx",
      "(app)/playground/page.tsx",
      "(app)/settings/page.tsx",
      "login/page.tsx",
    ],
    fixtures: [
      "_data/channels.ts",
      "_data/keys.ts",
      "_data/logs.ts",
      "_data/providers.ts",
      "_data/usage.ts",
    ],
  },
  hanship: {
    routes: [
      "(app)/deployments/[id]/page.tsx",
      "(app)/deployments/page.tsx",
      "(app)/domains/page.tsx",
      "(app)/env/page.tsx",
      "(app)/page.tsx",
      "(app)/projects/[id]/page.tsx",
      "(app)/settings/page.tsx",
      "login/page.tsx",
    ],
    fixtures: ["_data/store.ts"],
  },
  hanreview: {
    routes: [
      "(app)/findings/page.tsx",
      "(app)/gates/page.tsx",
      "(app)/page.tsx",
      "(app)/reviews/[id]/page.tsx",
      "(app)/reviews/page.tsx",
      "(app)/routing/page.tsx",
      "(app)/settings/page.tsx",
      "login/page.tsx",
    ],
    fixtures: [
      "_data/findings.ts",
      "_data/members.ts",
      "_data/metrics.ts",
      "_data/models.ts",
      "_data/repos.ts",
      "_data/reviews.ts",
      "_data/rules.ts",
    ],
  },
  hanhelm: {
    routes: [
      "(app)/agents/page.tsx",
      "(app)/alerts/page.tsx",
      "(app)/page.tsx",
      "(app)/queue/[id]/page.tsx",
      "(app)/queue/page.tsx",
      "(app)/routing/page.tsx",
      "(app)/settings/page.tsx",
      "login/page.tsx",
    ],
    fixtures: [
      "_data/alerts.ts",
      "_data/executors.ts",
      "_data/members.ts",
      "_data/metrics.ts",
      "_data/routing-rules.ts",
      "_data/tasks.ts",
    ],
  },
  knowledge: {
    routes: ["page.tsx"],
    fixtures: ["_data/images.ts", "_data/org.ts", "_data/vault.ts"],
  },
  learn: {
    routes: ["(app)/courses/[id]/page.tsx", "(app)/page.tsx", "(app)/practice/page.tsx", "(app)/questions/page.tsx"],
    fixtures: ["_data/courses.ts", "_data/poster.ts", "_data/questions.ts"],
  },
  scheduler: {
    routes: ["page.tsx"],
    fixtures: ["_data/clinic.ts"],
  },
  live: {
    routes: [
      "(studio)/page.tsx",
      "(studio)/products/page.tsx",
      "(studio)/review/page.tsx",
      "login/page.tsx",
      "room/page.tsx",
    ],
    fixtures: ["_data/content.ts"],
  },
  mobile: {
    routes: [
      "(app)/categories/page.tsx",
      "(app)/orders/page.tsx",
      "(app)/page.tsx",
      "(app)/profile/page.tsx",
      "(app)/services/[id]/page.tsx",
    ],
    fixtures: ["_data/orders.ts", "_data/services.ts"],
  },
  personal: {
    routes: ["(site)/guestbook/page.tsx", "(site)/page.tsx", "(site)/work/[slug]/page.tsx"],
    fixtures: ["_data/guestbook.ts", "_data/profile.ts", "_data/works.ts"],
  },
  shop: {
    routes: [
      "(shop)/account/page.tsx",
      "(shop)/cart/page.tsx",
      "(shop)/checkout/page.tsx",
      "(shop)/compare/page.tsx",
      "(shop)/favorites/page.tsx",
      "(shop)/mobile/page.tsx",
      "(shop)/orders/page.tsx",
      "(shop)/page.tsx",
      "(shop)/product/[id]/page.tsx",
      "(shop)/products/page.tsx",
      "login/page.tsx",
    ],
    fixtures: [
      "_data/art.ts",
      "_data/categories.ts",
      "_data/coupons.ts",
      "_data/orders.ts",
      "_data/products.ts",
      "_data/reviews.ts",
    ],
  },
  website: {
    routes: ["(site)/contact/page.tsx", "(site)/page.tsx", "(site)/pricing/page.tsx"],
    fixtures: ["_data/site.ts"],
  },
} as const;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

describe("admin and developer demo localization inventory", () => {
  it("uses exact literal protocol exemptions with locale-mapping evidence", () => {
    for (const [file, exemption] of INTERNAL_PROTOCOL_EXEMPTIONS) {
      expect(exemption, `${file} exemption shape`).toEqual(
        expect.objectContaining({
          literals: expect.any(Array),
          reason: expect.any(String),
          mappingEvidence: expect.any(Array),
        }),
      );
    }
  });

  it("provides English component defaults and localized shared demo chrome", async () => {
    const layout = readFileSync(join(DEMOS_ROOT, "layout.tsx"), "utf8");
    const provider = readFileSync(
      join(DEMOS_ROOT, "_components/demos-locale-provider.tsx"),
      "utf8",
    );
    const chrome = readFileSync(join(DEMOS_ROOT, "_components/demos-chrome.tsx"), "utf8");
    const shared = await import(
      pathToFileURL(join(DEMOS_ROOT, "_components/demos-chrome.content.ts")).href
    );

    expect(layout).toContain("<DemosLocaleProvider>");
    expect(provider).toContain('DOCS_LOCALE === "en" ? enUS : zhCN');
    expect(chrome).toContain('copy("backToGallery")');
    expect(shared.copy("backToGallery")).toBe(shared.content[DOCS_LOCALE].backToGallery);
    expect(HAN_OR_CJK_PUNCTUATION.test(shared.content.en.backToGallery)).toBe(false);
    expect(Object.keys(inventory)).toHaveLength(19);
  });

  for (const [demo, expected] of Object.entries(inventory)) {
    it(`${demo} registers every route and visible fixture in an explicit content source`, () => {
      const root = join(DEMOS_ROOT, demo);
      const routes = walk(root)
        .filter((path) => path.endsWith("/page.tsx"))
        .map((path) => relative(root, path))
        .sort();
      const fixtures =
        demo === "ai-chat"
          ? ["conversations.ts"]
          : existsSync(join(root, "_data"))
          ? walk(join(root, "_data"))
              .filter(
                (path) =>
                  path.endsWith(".ts") &&
                  !path.endsWith("types.ts") &&
                  !path.endsWith(".content.ts") &&
                  !path.endsWith(".test.ts") &&
                  !path.endsWith("node-kinds.tsx"),
              )
              .map((path) => relative(root, path))
              .sort()
          : [];

      expect(routes).toEqual([...expected.routes].sort());
      expect(fixtures).toEqual([...expected.fixtures].sort());
      for (const source of [...routes, ...fixtures]) {
        const absolute = join(root, source);
        const sourceText = readFileSync(absolute, "utf8");
        const companion = absolute.replace(/\.(ts|tsx)$/, ".content.ts");
        if (sourceText.includes("copy("))
          expect(existsSync(companion), `${source} companion`).toBe(true);
      }
    });
  }

  it("keeps adjacent dictionaries key-compatible and English consumers CJK-free", async () => {
    const perDemo = Object.keys(inventory).map((demo) => ({
      demo,
      contentFiles: walk(join(DEMOS_ROOT, demo)).filter((path) => path.endsWith(".content.ts")),
    }));
    // 在循环里逐个 await 会把 276 份字典的 TS 转换排成一条队；先并发把模块图拉起来，
    // 后面的断言全是内存比较。实测 1299ms → 529ms，CI 慢机器上正是这段把测试推过 timeout。
    const dictionaries = new Map(
      await Promise.all(
        perDemo
          .flatMap(({ contentFiles }) => contentFiles)
          .map(async (file) => [file, await import(pathToFileURL(file).href)] as const),
      ),
    );

    for (const { demo, contentFiles } of perDemo) {
      expect(contentFiles.length, `${demo} dictionary count`).toBeGreaterThan(0);

      for (const contentFile of contentFiles) {
        const module = dictionaries.get(contentFile)!;
        const zhKeys = Object.keys(module.content["zh-CN"]);
        const enKeys = Object.keys(module.content.en);
        expect(enKeys, `${relative(DEMOS_ROOT, contentFile)} key parity`).toEqual(zhKeys);

        for (const key of enKeys) {
          const english = module.content.en[key];
          expect(english.trim(), `${relative(DEMOS_ROOT, contentFile)}:${key}`).not.toBe("");
          expect(
            HAN_OR_CJK_PUNCTUATION.test(english),
            `${relative(DEMOS_ROOT, contentFile)}:${key}`,
          ).toBe(false);
          expect(module.copy(key), `${relative(DEMOS_ROOT, contentFile)}:${key} consumer`).toBe(
            module.content[DOCS_LOCALE][key],
          );
          expect(key).not.toMatch(/^copy\d+$/);
          if (STRICT_DEMOS.has(demo)) {
            expect(key, `${relative(DEMOS_ROOT, contentFile)} semantic key`).not.toMatch(
              /^localized|^(?:alternate|secondary|tertiary|quaternary)$/i,
            );
          }
        }

        const sourceFile = [
          contentFile.replace(/\.content\.ts$/, ".tsx"),
          contentFile.replace(/\.content\.ts$/, ".ts"),
        ].find((candidate) => existsSync(candidate));
        expect(sourceFile, `${relative(DEMOS_ROOT, contentFile)} consumer`).toBeTruthy();
        const source = readFileSync(sourceFile!, "utf8");
        const directLiteralKeys = [...source.matchAll(/\bcopy\s*\(\s*["']([^"']+)["']/gu)].map(
          (match) => match[1],
        );
        const consumedKeys = STRICT_DEMOS.has(demo)
          ? new Set([...consumedContentKeys(sourceFile!, source), ...directLiteralKeys])
          : new Set(directLiteralKeys);
        if (!STRICT_DEMOS.has(demo)) {
          for (const line of source.split("\n").filter((row) => row.includes("copy("))) {
            for (const match of line.matchAll(/"([^"]+)"/g))
              if (zhKeys.includes(match[1])) consumedKeys.add(match[1]);
          }
        }
        for (const key of consumedKeys) {
          expect(zhKeys, `${relative(DEMOS_ROOT, sourceFile!)}:${key}`).toContain(key);
        }
        expect(
          [...consumedKeys].sort(),
          `${relative(DEMOS_ROOT, contentFile)} keys are consumed`,
        ).toEqual([...zhKeys].sort());
      }
    }
    // 全仓扫描型断言：耗时随 demo 数线性增长（本次双语化后字典从 ~130 涨到 276 份）。
    // 给足余量，别再让「新增一批 demo」变成 CI 随机红。
  }, 60_000);

  it("catalogs every source file that still carries Chinese domain discriminators", () => {
    for (const demo of Object.keys(inventory)) {
      const root = join(DEMOS_ROOT, demo);
      for (const sourceFile of walk(root).filter(
        (path) =>
          /\.(ts|tsx)$/.test(path) &&
          !path.endsWith(".content.ts") &&
          !path.endsWith(".test.ts") &&
          !path.endsWith("types.ts"),
      )) {
        const source = readFileSync(sourceFile, "utf8");
        const chineseNodes = chineseLiteralNodes(sourceFile, source);
        if (chineseNodes.length === 0) continue;
        const relativeSource = relative(DEMOS_ROOT, sourceFile);
        const exemption = INTERNAL_PROTOCOL_EXEMPTIONS.get(relativeSource);
        if (exemption) {
          expect(exemption.reason.trim(), `${relativeSource} exemption reason`).not.toBe("");
          expect(
            [...new Set(chineseNodes)].sort(),
            `${relativeSource} exact protocol literals`,
          ).toEqual([...exemption.literals].sort());
          for (const evidence of exemption.mappingEvidence) {
            expect(source, `${relativeSource} mapping evidence: ${evidence}`).toContain(evidence);
          }
          continue;
        }
        if (STRICT_DEMOS.has(demo)) {
          expect.fail(
            `${relativeSource} must declare exact protocol literals and locale mapping evidence; found: ${chineseNodes.join(" | ")}`,
          );
        }
        const companion = sourceFile.replace(/\.(ts|tsx)$/, ".content.ts");
        expect(
          existsSync(companion),
          `${relativeSource} domain-value catalog; found: ${chineseNodes.slice(0, 3).join(" | ")}`,
        ).toBe(true);
        expect(source, `${relativeSource} consumes its catalog`).toContain("copy(");
      }
    }
    // 同上：633 个源文件的 AST 扫描，默认 5s 在 CI 上会擦线。
  }, 30_000);

  it("keeps CRM owner filter values stable while localizing their visible labels", () => {
    const source = readFileSync(join(DEMOS_ROOT, "crm/(app)/opportunities/page.tsx"), "utf8");

    expect(source).toContain("customerOwnerLabel");
    expect(source).toContain("value: o, label: customerOwnerLabel[o]");
    expect(source).toContain("{customerOwnerLabel[o]}");
  });

  it("maps Task 11 canonical protocol values before rendering or notifying", () => {
    const scheduler = readFileSync(
      join(DEMOS_ROOT, "scheduler/_components/scheduler-shell.tsx"),
      "utf8",
    );
    const workflow = readFileSync(
      join(DEMOS_ROOT, "ai-workflow/_components/studio-shell.tsx"),
      "utf8",
    );
    const dashboard = readFileSync(
      join(DEMOS_ROOT, "dashboard/_components/dashboard-shell.tsx"),
      "utf8",
    );
    const dashboardLayout = readFileSync(
      join(DEMOS_ROOT, "dashboard/(app)/layout.tsx"),
      "utf8",
    );

    expect(scheduler).toContain("TYPE_LABELS[v.type as ApptType]");
    expect(scheduler).toContain("TYPE_LABELS[appt.type]");
    expect(scheduler).not.toContain("[copy(\"type\"), appt.type]");
    expect(workflow).toContain('time: copy("twoMinutesAgo")');
    expect(workflow).toContain('time: copy("oneHourAgo")');
    expect(workflow).toContain('time: copy("yesterday")');
    expect(dashboard).toContain('copy("dataSourceSwitched", DATA_SOURCE_LABELS[s])');
    expect(dashboardLayout).toContain("<ToastProvider />");
  });
});
