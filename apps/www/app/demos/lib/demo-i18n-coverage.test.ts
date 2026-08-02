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
  isStringLiteralLike,
  type Node,
} from "typescript-api";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const DEMOS_ROOT = new URL("..", import.meta.url).pathname;
const HAN_OR_CJK_PUNCTUATION = /[\p{Script=Han}，。！？；：、“”‘’（）【】《》〈〉「」『』…]/u;
const INTERNAL_PROTOCOL_EXEMPTIONS = new Map([
  ["crm/_data/metrics.ts", "CRM mock discriminators and chart data keys stay aligned with the typed fixture protocol"],
  ["crm/_data/orders.ts", "CRM order status seeds are typed protocol values and are localized by the status label map at render time"],
  ["crm/_data/protocol.ts", "CRM canonical owner and industry values are stable protocol values; only their render labels are localized"],
]);

function chineseLiteralNodes(file: string, source: string): string[] {
  const sourceFile = createSourceFile(file, source, ScriptTarget.Latest, true, file.endsWith("x") ? ScriptKind.TSX : ScriptKind.TS);
  const values: string[] = [];
  const visit = (node: Node) => {
    if (
      isStringLiteralLike(node)
      || isJsxText(node)
      || node.kind === SyntaxKind.TemplateHead
      || node.kind === SyntaxKind.TemplateMiddle
      || node.kind === SyntaxKind.TemplateTail
    ) {
      const value = "text" in node ? String(node.text) : node.getText(sourceFile);
      if (HAN_OR_CJK_PUNCTUATION.test(value)) values.push(value.trim());
    }
    forEachChild(node, visit);
  };
  visit(sourceFile);
  return values.filter(Boolean);
}

const inventory = {
  billing: {
    routes: ["(app)/invoices/page.tsx", "(app)/page.tsx", "(app)/payment/page.tsx", "(app)/plans/page.tsx", "(app)/settings/page.tsx", "login/page.tsx"],
    fixtures: ["_data/account.ts", "_data/invoices.ts", "_data/plans.ts"],
  },
  crm: {
    routes: ["(app)/customers/[id]/page.tsx", "(app)/customers/page.tsx", "(app)/opportunities/page.tsx", "(app)/orders/page.tsx", "(app)/page.tsx", "(app)/settings/page.tsx", "login/page.tsx"],
    fixtures: ["_data/customers.ts", "_data/follows.ts", "_data/metrics.ts", "_data/opportunities.ts", "_data/orders.ts", "_data/protocol.ts", "_data/status.ts"],
  },
  "customer-service": {
    routes: ["(app)/analytics/page.tsx", "(app)/knowledge/page.tsx", "(app)/page.tsx", "(app)/settings/page.tsx", "(app)/tickets/[id]/page.tsx", "(app)/tickets/page.tsx", "login/page.tsx"],
    fixtures: ["_data/conversations.ts", "_data/customers.ts", "_data/knowledge.ts", "_data/labels.ts", "_data/metrics.ts", "_data/tickets.ts"],
  },
  projects: {
    routes: ["(app)/checkout/[id]/page.tsx", "(app)/checkout/page.tsx", "(app)/invoices/page.tsx", "(app)/page.tsx", "(app)/photos/page.tsx", "(app)/quotes/[id]/page.tsx", "(app)/quotes/page.tsx", "(app)/tracking/[id]/page.tsx", "(app)/tracking/page.tsx"],
    fixtures: ["_data/checkouts.ts", "_data/invoices.ts", "_data/metrics.ts", "_data/photos.ts", "_data/projects.ts", "_data/quotes.ts", "_data/status.ts"],
  },
  hanhub: {
    routes: ["(app)/billing/page.tsx", "(app)/health/page.tsx", "(app)/keys/page.tsx", "(app)/logs/page.tsx", "(app)/models/page.tsx", "(app)/page.tsx", "(app)/playground/page.tsx", "(app)/settings/page.tsx", "login/page.tsx"],
    fixtures: ["_data/channels.ts", "_data/keys.ts", "_data/logs.ts", "_data/providers.ts", "_data/usage.ts"],
  },
  hanship: {
    routes: ["(app)/deployments/[id]/page.tsx", "(app)/deployments/page.tsx", "(app)/domains/page.tsx", "(app)/env/page.tsx", "(app)/page.tsx", "(app)/projects/[id]/page.tsx", "(app)/settings/page.tsx", "login/page.tsx"],
    fixtures: ["_data/store.ts"],
  },
  hanreview: {
    routes: ["(app)/findings/page.tsx", "(app)/gates/page.tsx", "(app)/page.tsx", "(app)/reviews/[id]/page.tsx", "(app)/reviews/page.tsx", "(app)/routing/page.tsx", "(app)/settings/page.tsx", "login/page.tsx"],
    fixtures: ["_data/findings.ts", "_data/members.ts", "_data/metrics.ts", "_data/models.ts", "_data/repos.ts", "_data/reviews.ts", "_data/rules.ts"],
  },
  hanhelm: {
    routes: ["(app)/agents/page.tsx", "(app)/alerts/page.tsx", "(app)/page.tsx", "(app)/queue/[id]/page.tsx", "(app)/queue/page.tsx", "(app)/routing/page.tsx", "(app)/settings/page.tsx", "login/page.tsx"],
    fixtures: ["_data/alerts.ts", "_data/executors.ts", "_data/members.ts", "_data/metrics.ts", "_data/routing-rules.ts", "_data/tasks.ts"],
  },
} as const;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

describe("admin and developer demo localization inventory", () => {
  it("provides English component defaults and localized shared demo chrome", async () => {
    const layout = readFileSync(join(DEMOS_ROOT, "layout.tsx"), "utf8");
    const provider = readFileSync(join(DEMOS_ROOT, "_components/demos-locale-provider.tsx"), "utf8");
    const chrome = readFileSync(join(DEMOS_ROOT, "_components/demos-chrome.tsx"), "utf8");
    const shared = await import(pathToFileURL(join(DEMOS_ROOT, "_components/demos-chrome.content.ts")).href);

    expect(layout).toContain("<DemosLocaleProvider>");
    expect(provider).toContain('DOCS_LOCALE === "en" ? enUS : zhCN');
    expect(chrome).toContain('copy("backToGallery")');
    expect(shared.copy("backToGallery")).toBe(shared.content[DOCS_LOCALE].backToGallery);
    expect(HAN_OR_CJK_PUNCTUATION.test(shared.content.en.backToGallery)).toBe(false);
    expect(Object.keys(inventory)).toHaveLength(8);
  });

  for (const [demo, expected] of Object.entries(inventory)) {
    it(`${demo} registers every route and visible fixture in an explicit content source`, () => {
      const root = join(DEMOS_ROOT, demo);
      const routes = walk(root)
        .filter((path) => path.endsWith("/page.tsx"))
        .map((path) => relative(root, path))
        .sort();
      const fixtures = walk(join(root, "_data"))
        .filter((path) => path.endsWith(".ts") && !path.endsWith("types.ts") && !path.endsWith(".content.ts") && !path.endsWith(".test.ts"))
        .map((path) => relative(root, path))
        .sort();

      expect(routes).toEqual([...expected.routes].sort());
      expect(fixtures).toEqual([...expected.fixtures].sort());
      for (const source of [...routes, ...fixtures]) {
        const absolute = join(root, source);
        const sourceText = readFileSync(absolute, "utf8");
        const companion = absolute.replace(/\.(ts|tsx)$/, ".content.ts");
        if (sourceText.includes("copy(")) expect(existsSync(companion), `${source} companion`).toBe(true);
      }
    });
  }

  it("keeps adjacent dictionaries key-compatible and English consumers CJK-free", async () => {
    for (const demo of Object.keys(inventory)) {
      const root = join(DEMOS_ROOT, demo);
      const contentFiles = walk(root).filter((path) => path.endsWith(".content.ts"));
      expect(contentFiles.length, `${demo} dictionary count`).toBeGreaterThan(0);

      for (const contentFile of contentFiles) {
        const module = await import(pathToFileURL(contentFile).href);
        const zhKeys = Object.keys(module.content["zh-CN"]);
        const enKeys = Object.keys(module.content.en);
        expect(enKeys, `${relative(DEMOS_ROOT, contentFile)} key parity`).toEqual(zhKeys);

        for (const key of enKeys) {
          const english = module.content.en[key];
          expect(english.trim(), `${relative(DEMOS_ROOT, contentFile)}:${key}`).not.toBe("");
          expect(HAN_OR_CJK_PUNCTUATION.test(english), `${relative(DEMOS_ROOT, contentFile)}:${key}`).toBe(false);
          expect(module.copy(key), `${relative(DEMOS_ROOT, contentFile)}:${key} consumer`).toBe(
            module.content[DOCS_LOCALE][key],
          );
          expect(key).not.toMatch(/^copy\d+$/);
        }

        const sourceFile = [contentFile.replace(/\.content\.ts$/, ".tsx"), contentFile.replace(/\.content\.ts$/, ".ts")]
          .find((candidate) => existsSync(candidate));
        expect(sourceFile, `${relative(DEMOS_ROOT, contentFile)} consumer`).toBeTruthy();
        const source = readFileSync(sourceFile!, "utf8");
        const consumedKeys = new Set([...source.matchAll(/copy\("([^"]+)"/g)].map((match) => match[1]));
        for (const line of source.split("\n").filter((row) => row.includes("copy("))) {
          for (const match of line.matchAll(/"([^"]+)"/g)) if (zhKeys.includes(match[1])) consumedKeys.add(match[1]);
        }
        for (const key of consumedKeys) {
          expect(zhKeys, `${relative(DEMOS_ROOT, sourceFile!)}:${key}`).toContain(key);
        }
        expect([...consumedKeys].sort(), `${relative(DEMOS_ROOT, contentFile)} keys are consumed`).toEqual([...zhKeys].sort());
      }
    }
  }, 15_000);

  it("catalogs every source file that still carries Chinese domain discriminators", () => {
    for (const demo of Object.keys(inventory)) {
      const root = join(DEMOS_ROOT, demo);
      for (const sourceFile of walk(root).filter((path) => /\.(ts|tsx)$/.test(path) && !path.endsWith(".content.ts") && !path.endsWith(".test.ts") && !path.endsWith("types.ts"))) {
        const source = readFileSync(sourceFile, "utf8");
        const chineseNodes = chineseLiteralNodes(sourceFile, source);
        if (chineseNodes.length === 0) continue;
        const relativeSource = relative(DEMOS_ROOT, sourceFile);
        if (INTERNAL_PROTOCOL_EXEMPTIONS.has(relativeSource)) {
          expect(INTERNAL_PROTOCOL_EXEMPTIONS.get(relativeSource), `${relativeSource} exemption reason`).toBeTruthy();
          continue;
        }
        const companion = sourceFile.replace(/\.(ts|tsx)$/, ".content.ts");
        expect(existsSync(companion), `${relativeSource} domain-value catalog; found: ${chineseNodes.slice(0, 3).join(" | ")}`).toBe(true);
        expect(source, `${relativeSource} consumes its catalog`).toContain("copy(");
      }
    }
  });

  it("keeps CRM owner filter values stable while localizing their visible labels", () => {
    const source = readFileSync(join(DEMOS_ROOT, "crm/(app)/opportunities/page.tsx"), "utf8");

    expect(source).toContain("customerOwnerLabel");
    expect(source).toContain("value: o, label: customerOwnerLabel[o]");
    expect(source).toContain("{customerOwnerLabel[o]}");
  });
});
