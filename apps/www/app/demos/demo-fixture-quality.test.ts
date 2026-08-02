import { spawnSync } from "node:child_process";
import ts from "typescript-api";
import { describe, expect, it } from "vitest";
import { content as analytics } from "./customer-service/(app)/analytics/page.content";
import { content as csMetrics } from "./customer-service/_data/metrics.content";
import { content as workbench } from "./customer-service/_components/workbench/workbench.content";
import { content as customers } from "./customer-service/_data/customers.content";
import { content as knowledge } from "./customer-service/_data/knowledge.content";
import { content as tickets } from "./customer-service/_data/tickets.content";
import { content as reviewLogin } from "./hanreview/login/page.content";
import { content as reviewOverview } from "./hanreview/(app)/page.content";
import { content as reviewList } from "./hanreview/(app)/reviews/page.content";
import { content as reviewFindingList } from "./hanreview/(app)/findings/page.content";
import { content as reviewGates } from "./hanreview/(app)/gates/page.content";
import { content as reviewDetail } from "./hanreview/_components/review-detail.content";
import { content as reviewShell } from "./hanreview/_components/review-shell.content";
import { content as reviewFindings } from "./hanreview/_data/findings.content";
import { content as reviewModels } from "./hanreview/_data/models.content";
import { content as reviewNav } from "./hanreview/_components/nav-config.content";
import { content as reviews } from "./hanreview/_data/reviews.content";
import { content as reviewRules } from "./hanreview/_data/rules.content";
import { content as reviewRouting } from "./hanreview/_lib/routing.content";
import { content as helmPage } from "./hanhelm/(app)/page.content";
import { content as helmSettings } from "./hanhelm/(app)/settings/page.content";
import { content as helmAlertsPage } from "./hanhelm/(app)/alerts/page.content";
import { content as helmQueuePage } from "./hanhelm/(app)/queue/page.content";
import { content as helmRoutingPage } from "./hanhelm/(app)/routing/page.content";
import { content as helmOverviewFlow } from "./hanhelm/_components/overview-task-flow.content";
import { content as helmAgents } from "./hanhelm/_components/agents-executor-card.content";
import { content as helmQueueBoard } from "./hanhelm/_components/queue-board.content";
import { content as helmWeights } from "./hanhelm/_components/routing-weights-panel.content";
import { content as helmTaskDetail } from "./hanhelm/_components/task-detail.content";
import { content as helmQueueShared } from "./hanhelm/_components/queue-shared.content";
import { content as helmAlerts } from "./hanhelm/_data/alerts.content";
import { content as helmRoutingRules } from "./hanhelm/_data/routing-rules.content";
import { content as helmTasks } from "./hanhelm/_data/tasks.content";
import { content as helmLogin } from "./hanhelm/login/page.content";

const dictionaries = [
  analytics, csMetrics, workbench, customers, knowledge, tickets,
  reviewLogin, reviewOverview, reviewList, reviewFindingList, reviewGates, reviewDetail,
  reviewShell, reviewFindings, reviewModels, reviewNav, reviews, reviewRules, reviewRouting,
  helmPage, helmSettings, helmAlertsPage, helmQueuePage, helmRoutingPage,
  helmOverviewFlow, helmAgents, helmQueueBoard, helmQueueShared, helmWeights, helmTaskDetail,
  helmAlerts, helmRoutingRules, helmTasks, helmLogin,
];

const englishFixtureText = dictionaries.flatMap((dictionary) => Object.values(dictionary.en)).join("\n");

describe("English demo fixture quality", () => {
  it("keeps severity protocol labels and related review terms consistent", () => {
    expect({
      overview: [
        reviewOverview.en.serious,
        reviewOverview.en.important,
        reviewOverview.en.secondary,
        reviewOverview.en.tip,
      ],
      reviewList: [
        reviewList.en.serious,
        reviewList.en.important,
        reviewList.en.secondary,
        reviewList.en.tip,
      ],
      findingList: [
        reviewFindingList.en.serious,
        reviewFindingList.en.important,
        reviewFindingList.en.secondary,
        reviewFindingList.en.tips,
      ],
      reviewDetail: [
        reviewDetail.en.serious,
        reviewDetail.en.important,
        reviewDetail.en.secondary,
        reviewDetail.en.tip,
      ],
      qualityScore: reviewOverview.en.qualityPoints,
      maximumCriticalFindings: reviewGates.en.seriousProblemsAtTheUpperLimit3,
      hoverState: reviews.en.unifiedButtonRoundedCornersAndFloatingState,
    }).toEqual({
      overview: ["Critical", "Major", "Minor", "Info"],
      reviewList: ["Critical", "Major", "Minor", "Info"],
      findingList: ["Critical", "Major", "Minor", "Info"],
      reviewDetail: ["Critical", "Major", "Minor", "Info"],
      qualityScore: "Quality score",
      maximumCriticalFindings: "Maximum critical findings",
      hoverState: "Unify button corner radii and hover states",
    });
  });

  it("keeps the reviewed code-review, scheduling, and support terminology", () => {
    expect({
      reviewBrand: reviewLogin.en.hanreviewHanreview,
      reviewTaglineLead: reviewLogin.en.seniorReviewers,
      reviewTaglineTail: reviewLogin.en.eyeScaling,
      reviewWorkflow: reviewLogin.en.eachPrIsReviewedAndAiReviewers,
      reviewShellBrand: reviewShell.en.hanreviewHanreview,
      reviewModelRule: reviewRules.en.longDiffsRequireRobustLogicalReasoningSo,
      reviewFindingRole: reviews.en.aiCensor,
      reviewFallback: reviewModels.en.largeScaleLightReviewOfTestingProfile,
      reviewUndefinedValueFinding: reviewFindings.en.summingValuesThatMayBeUndefinedRequires,
      helmFallback: helmLogin.en.complexTasksAreBrokenDownIntoSubtask,
      helmFleet: helmLogin.en.heterogeneousAiTasksFloodTheTaskBus,
      helmExecutorState: helmQueueShared.en.inExecution,
      helmPriorityP1: helmQueueBoard.en.p1IsHigh,
      helmQueueState: helmQueueBoard.en.onTheRoad,
      helmCapabilityWeight: helmWeights.en.abilityMatching,
      helmWeightSummary: helmWeights.en.andAuthorityWasWeightyAndHarmonious,
      helmBid: helmAgents.en.bidBid,
      helmToggle: helmAgents.en.startAndStopValue,
      helmMissingTask: helmTaskDetail.en.tasksWithIdValueNotFoundMay,
      helmSourceSection: helmSettings.en.taskSourceAccessIsProvided,
      helmDailySummary: helmSettings.en.dailySummarySummary,
      helmBalancedRoute: helmRoutingRules.en.sixDimensionalEqualWeightScoreUsuallyAt,
      helmContractTask: helmTasks.en.intelligentReviewOfCrossBorderProcurementContracts,
      helmClauseRetrieval: helmTasks.en.callRetrievalEnhancementAgentRecallSimilarClauses,
      helmClauseFinding: helmTasks.en.liquidatedDamagesIsADirectTranslationOf,
      helmFinancialValidation: helmTasks.en.verifyAndVerifyTheRelationshipsBetweenThe,
      helmImageStep: helmTasks.en.textToTextImageMainVisual,
      helmSentimentTask: helmTasks.en.aMassiveNumberOfCommentsAndEmotional,
      supportPeakAlert: workbench.en.thereIsAPeakIncomingCallsPlease,
      supportReturnPolicy: customers.en.manyReturnsAndExchanges,
      supportTicketSummary: tickets.en.theCustomerReportedThatYesterdaySOrder,
    }).toEqual({
      reviewBrand: "HanReview",
      reviewTaglineLead: "Scale senior review",
      reviewTaglineTail: "across every pull request",
      reviewWorkflow: "HanReview examines every changed file, leaves inline findings, scores review quality, and applies merge gates automatically.",
      reviewShellBrand: "HanReview",
      reviewModelRule: "Long diffs need sustained reasoning, so route them to the balanced Sonnet model.",
      reviewFindingRole: "AI reviewer",
      reviewFallback: "Fast, low-cost reviews for tests, configuration files, and style-only changes.",
      reviewUndefinedValueFinding: "Guard against undefined values before summing",
      helmFallback: "Complex jobs become subtask DAGs; failed executors automatically move to the configured fallback chain.",
      helmFleet: "HanHelm routes mixed AI workloads across agent and model pools, orchestrates multi-agent jobs, applies fallbacks, and exposes end-to-end telemetry.",
      helmExecutorState: "Running",
      helmPriorityP1: "P1 High",
      helmQueueState: "In progress",
      helmCapabilityWeight: "Capability match",
      helmWeightSummary: "Weights total {0}",
      helmBid: "Input / output",
      helmToggle: "{0} executor",
      helmMissingTask: "Task \"{0}\" was not found. It may have been removed, or the link may be stale.",
      helmSourceSection: "Task sources",
      helmDailySummary: "Daily summary",
      helmBalancedRoute: "Equal weighting usually selects Sonnet 4.6 as the balanced option.",
      helmContractTask: "Review a cross-border procurement contract",
      helmClauseRetrieval: "Retrieval Agent · Found 24 similar clauses and reranked the top 8.",
      helmClauseFinding: "The draft translates \"liquidated damages\" too broadly as \"breach penalty.\" Use the contract-specific term \"agreed damages\" and flag it for legal review.",
      helmFinancialValidation: "Validate cross-statement relationships",
      helmImageStep: "Generate main visual · 1024×1024",
      helmSentimentTask: "Classify sentiment across a large comment set",
      supportPeakAlert: "Inbound volume is expected to peak from 14:00 to 16:00; keep two agents available for overflow.",
      supportReturnPolicy: "Returns and exchanges",
      supportTicketSummary: "Order NO20260603887 was placed yesterday but has not shipped. The customer asked for expedited delivery; confirm inventory and the warehouse dispatch status.",
    });
  });

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
    "HanReview HanReview",
    "Eye scaling",
    "annotate within the industry",
    "equilibrium model Sonnet",
    "Cost cap guarantees the bottom",
    "Censorship interrupted",
    "avoiding misalignment and correct direction",
    "Verify and verify",
    "task enters the bus",
    "Haiku healthy with extract and switching",
    "optimal overall optimization",
    "preemptively review the Agent concurrently",
    "Logistics track exception handling process",
    "Mother and baby bottle material and suitable age consultation",
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
