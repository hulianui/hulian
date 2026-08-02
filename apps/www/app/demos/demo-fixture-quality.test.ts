import { spawnSync } from "node:child_process";
import ts from "typescript-api";
import { describe, expect, it } from "vitest";
import { content as analytics } from "./customer-service/(app)/analytics/page.content";
import { content as csMetrics } from "./customer-service/_data/metrics.content";
import { content as workbench } from "./customer-service/_components/workbench/workbench.content";
import { content as knowledge } from "./customer-service/_data/knowledge.content";
import { content as tickets } from "./customer-service/_data/tickets.content";
import { content as reviewLogin } from "./hanreview/login/page.content";
import { content as reviewNav } from "./hanreview/_components/nav-config.content";
import { content as reviews } from "./hanreview/_data/reviews.content";
import { content as reviewRules } from "./hanreview/_data/rules.content";
import { content as reviewRouting } from "./hanreview/_lib/routing.content";
import { content as helmPage } from "./hanhelm/(app)/page.content";
import { content as helmAlertsPage } from "./hanhelm/(app)/alerts/page.content";
import { content as helmQueuePage } from "./hanhelm/(app)/queue/page.content";
import { content as helmRoutingPage } from "./hanhelm/(app)/routing/page.content";
import { content as helmOverviewFlow } from "./hanhelm/_components/overview-task-flow.content";
import { content as helmQueueShared } from "./hanhelm/_components/queue-shared.content";
import { content as helmAlerts } from "./hanhelm/_data/alerts.content";
import { content as helmTasks } from "./hanhelm/_data/tasks.content";

const dictionaries = [
  analytics, csMetrics, workbench, knowledge, tickets,
  reviewLogin, reviewNav, reviews, reviewRules, reviewRouting,
  helmPage, helmAlertsPage, helmQueuePage, helmRoutingPage,
  helmOverviewFlow, helmQueueShared, helmAlerts, helmTasks,
];

const englishFixtureText = dictionaries.flatMap((dictionary) => Object.values(dictionary.en)).join("\n");

describe("English demo fixture quality", () => {
  it.each([
    "Today is over",
    "average first ring",
    "There is a peak incoming calls",
    "review review console",
    "The core of the problem",
    "Weak Control",
    "failure safety net",
    "Hardcode production keys",
    "equalization model",
    "economic model",
    "as a backup",
    "shorting value",
    "virtually rolled",
    "rolling shaking",
    "The appointed time approached",
    "The six pillars hold great weight",
    "SLA default",
    "Task SLA is near",
    "Agent acceptance",
  ])("does not contain the known machine-translated phrase: %s", (phrase) => {
    expect(englishFixtureText).not.toContain(phrase);
  });

  it("keeps displayed TypeScript and JavaScript examples syntactically valid", () => {
    const keys = [
      "exportAsyncFunctionHandlerefundcallbackReqRequestConst",
      "constSecretSkLiveF3c2a9d4e1bTodoWas",
      "constSecretSkLiveF3c2a9d4e1bTodoWas2",
      "constSecretProcessEnvPaySecretIf",
      "exportFunctionBuildlistItemsItemTagsTag",
      "constResultEnrichedForConstItOf",
      "exportFunctionRefreshcacheRowsEnrichedForgotAwait",
      "exportFunctionRefreshcacheRowsEnrichedForgotAwait2",
      "exportFunctionBadgecountItemsCartitemItShould",
      "renderAllProductsAtOnceOldImplementation",
      "introducesVirtualScrollingRenderingOnlyTheViewpoint",
    ] as const;
    for (const key of keys) {
      const result = ts.transpileModule(reviews.en[key], {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
        reportDiagnostics: true,
      });
      const errors = result.diagnostics
        ?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      expect(errors, key).toEqual([]);
    }
  });

  it("keeps displayed Python examples syntactically valid", () => {
    const keys = ["defDeriveKeyPasswordStrSaltBytes", "defGetSecretUserSecretIdSecret"] as const;
    for (const key of keys) {
      const result = spawnSync("python3", ["-c", "import ast,sys,textwrap; ast.parse(textwrap.dedent(sys.stdin.read()))"], {
        input: reviews.en[key],
        encoding: "utf8",
      });
      expect(result.status, `${key}: ${result.stderr}`).toBe(0);
    }
  });
});
