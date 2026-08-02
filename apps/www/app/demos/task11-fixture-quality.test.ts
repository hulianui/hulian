// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  ScriptTarget,
  createSourceFile,
  isIdentifier,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isStringLiteralLike,
  isVariableDeclaration,
  type Node,
} from "typescript-api";
import { describe, expect, it } from "vitest";
import { content as chatPage } from "./ai-chat/page.content";
import { content as chatStream } from "./ai-chat/use-chat-stream.content";
import { content as workflowModels } from "./ai-workflow/_data/models.content";
import { content as workflowNodes } from "./ai-workflow/_data/node-kinds.content";
import { content as workflowTemplates } from "./ai-workflow/_data/templates.content";
import { content as vault } from "./knowledge/_data/vault.content";
import { content as courses } from "./learn/_data/courses.content";
import { content as clinic } from "./scheduler/_data/clinic.content";
import { content as dashboardCharts } from "./dashboard/_components/chart-stack.content";
import { content as dashboardHeader } from "./dashboard/_components/header-bar.content";
import { content as dashboardSnapshot } from "./dashboard/_data/snapshot.content";

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function englishValues(file: string): string[] {
  const source = readFileSync(file, "utf8");
  const sourceFile = createSourceFile(file, source, ScriptTarget.Latest, true);
  const values: string[] = [];

  const visit = (node: Node) => {
    if (
      isVariableDeclaration(node) &&
      isIdentifier(node.name) &&
      node.name.text === "content" &&
      node.initializer &&
      isObjectLiteralExpression(node.initializer)
    ) {
      const english = node.initializer.properties.find(
        (property) =>
          isPropertyAssignment(property) &&
          ((isIdentifier(property.name) && property.name.text === "en") ||
            (isStringLiteralLike(property.name) && property.name.text === "en")),
      );
      if (
        english &&
        isPropertyAssignment(english) &&
        isObjectLiteralExpression(english.initializer)
      ) {
        for (const property of english.initializer.properties) {
          if (isPropertyAssignment(property) && isStringLiteralLike(property.initializer)) {
            values.push(property.initializer.text);
          }
        }
      }
    }
    node.forEachChild(visit);
  };
  visit(sourceFile);
  return values;
}

const englishFixtureText = [
  "ai-chat",
  "ai-workflow",
  "knowledge",
  "learn",
  "scheduler",
  "dashboard",
]
  .flatMap((demo) => walk(new URL(`./${demo}`, import.meta.url).pathname))
  .filter((file) => file.endsWith(".content.ts"))
  .flatMap(englishValues)
  .join("\n");

describe("Task 11 English fixture quality", () => {
  it("locks reviewed product, AI, education, scheduling, and dashboard terminology", () => {
    expect({
      assistant: chatPage.en.coralAssistants,
      assistantDisclaimer: chatPage.en.hualianAssistantMayMakeErrorsThisDemoIsAPure,
      closureDefinition: chatStream.en.closureAnswer.split("\n")[0],
      workflowBrand: workflowModels.en.coralReefDrawingXL,
      imageModel: workflowNodes.en.rawDiagramModel,
      upscale: workflowNodes.en.highDefinitionMagnification,
      textToImage: workflowTemplates.en.textToImage,
      imageToVideo: workflowTemplates.en.imageToVideo,
      reactCourse: courses.en.reactModernFrontEndEngineeringBattle,
      typeCourse: courses.en.typescriptTypeGymnasticsAdvanced,
      designSystemCourse: courses.en.designTheSystemFromTo,
      motionCourse: courses.en.interfaceDynamicEffectDesignAndImplementation,
      llmCourse: courses.en.practicalApplicationDevelopmentOfLargeModels,
      ragChapter: courses.en.chapterRagRetrievalEnhancement,
      rerankingLesson: courses.en.rearrangementAndRecallEvaluation,
      agentLesson: courses.en.multiStepTaskChoreographyAndGuardrails,
      initialVisit: clinic.en.initialConsultation,
      followUp: clinic.en.revisit,
      exam: clinic.en.check,
      procedure: clinic.en.disposal,
      clinicRoom1: clinic.en.clinic,
      clinicRoom2: clinic.en.clinicAlternate,
      blocked: clinic.en.stop,
      dashboardBrand: dashboardHeader.en.hanyunGlobalDispatchCommandCenter,
      globalQps: dashboardCharts.en.networkWideQPS24hTimesSecond,
      healthy: dashboardSnapshot.en.normal,
      alert: dashboardSnapshot.en.warning,
    }).toEqual({
      assistant: "Hulian Assistant",
      assistantDisclaimer:
        "Hulian Assistant can make mistakes · This front-end demo is not connected to a live model",
      closureDefinition:
        "A **closure** combines a function with the lexical scope where it was defined. The function can still access those variables even when it runs outside that scope.",
      workflowBrand: "Hulian Canvas XL",
      imageModel: "Image model",
      upscale: "HD upscale",
      textToImage: "Text to image",
      imageToVideo: "Image to video",
      reactCourse: "Modern React Engineering in Practice",
      typeCourse: "Advanced TypeScript Type Programming",
      designSystemCourse: "Build a Design System from 0 to 1",
      motionCourse: "Designing and Implementing UI Motion",
      llmCourse: "Building Production LLM Applications",
      ragChapter: "Chapter 2 · Retrieval-augmented generation (RAG)",
      rerankingLesson: "05 Reranking and recall evaluation",
      agentLesson: "07 Multi-step orchestration and guardrails",
      initialVisit: "Initial visit",
      followUp: "Follow-up",
      exam: "Exam",
      procedure: "Procedure",
      clinicRoom1: "Clinic Room 1",
      clinicRoom2: "Clinic Room 2",
      blocked: "Blocked",
      dashboardBrand: "Hulian Global Traffic Command Center",
      globalQps: "Global QPS · Last 24 hours (10k requests/s)",
      healthy: "Healthy",
      alert: "Alert",
    });
  });

  it.each([
    "any sky flying",
    "Starting from * *",
    "Turing-complete language * *",
    "# #",
    "@ hulianui/ui",
    "High Definition Upscale factor",
    "H reef drawing XL",
    "Dynamic effect",
    "Principle of kinetic effect",
    "rag Retrieval Enhancement",
    "Rearrangement and Recall Evaluation",
    "task choreography",
    "Closing Certificate",
    "Learning Form",
    "1 Clinic",
    "2 Clinic",
    "Initial consultation",
    "Revisit",
    "Disposal",
    "Enrollment Stoppage",
    "person (s)",
    "Mmm D day",
    "Heart Rate Delay",
    "thousand times/second",
    "Hanyun",
    "Hanxue",
  ])("rejects the known machine-translated phrase: %s", (phrase) => {
    expect(englishFixtureText).not.toContain(phrase);
  });

  it("keeps the reviewed Markdown structurally valid", () => {
    const markdown = [
      vault.en.frontEndArchitectureOverviewTheHankuFrontEndIsBased,
      vault.en.designTokenSpecificationTheDesignTokenIsTheSingleSource,
      vault.en.prdTeamKnowledgeBaseVBackgroundTheResearchAndDevelopment,
      courses.en.startingFromComponentizedThinkingThisCourseTakesYouThroughReact,
      courses.en.genericsConditionTypesMappingTypesTemplateLiteralsThisLessonTakes,
      courses.en.theDesignSystemIsNotAUIKitButA,
      courses.en.thisCourseFocusesOnLandingHowToConnectLargeModels,
    ];

    for (const value of markdown) {
      expect(value).not.toMatch(/\* \*|# #|@ hulian/u);
      expect((value.match(/```/g) ?? []).length % 2).toBe(0);
    }
    expect(markdown.join("\n")).toContain("**component thinking**");
    expect(markdown.join("\n")).toContain("**Turing-complete language**");
    expect(vault.en.frontEndArchitectureOverviewTheHankuFrontEndIsBased).toContain(
      "## Conventions",
    );
  });

  it("keeps locale-neutral chart fields and Chinese protocol discriminators internal", () => {
    const dashboard = readFileSync(
      new URL("./dashboard/_data/snapshot.ts", import.meta.url),
      "utf8",
    );
    const nodeDrawer = readFileSync(
      new URL("./dashboard/_components/node-drawer.tsx", import.meta.url),
      "utf8",
    );
    const scheduler = readFileSync(new URL("./scheduler/_data/clinic.ts", import.meta.url), "utf8");
    const workflow = readFileSync(
      new URL("./ai-workflow/_data/templates.ts", import.meta.url),
      "utf8",
    );
    const learn = readFileSync(new URL("./learn/_data/courses.ts", import.meta.url), "utf8");

    expect(dashboard).toContain("qpsSeries: { hour: string; requests: number; hits: number }[]");
    expect(dashboard).toContain("asiaPacific:");
    expect(dashboard).toContain('export type NodeStatus = "正常" | "繁忙" | "告警"');
    expect(nodeDrawer).toContain("NODE_STATUS_LABELS[node.status]");
    expect(scheduler).toContain(
      'export type ApptType = "初诊" | "复诊" | "检查" | "处置" | "停诊"',
    );
    expect(scheduler).toContain("TYPE_LABELS");
    expect(workflow).toContain("TEMPLATE_CATEGORY_LABELS");
    expect(learn).toContain("COURSE_LEVEL_NAME");
  });
});
