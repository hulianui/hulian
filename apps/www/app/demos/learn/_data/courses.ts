import { copy } from "./courses.content";
import type { Chapter, Course, CourseCategory, CourseLevel, Discussion, Lesson } from "./types";

// 复用库里唯一可用的本地 mp4（约 10s）——离线无法程序化生成真 mp4，章节标记在单条视频内分段演示。
const MP4 = "/demo/sample-video.mp4";

export const CATEGORIES: CourseCategory[] = [
  { key: "frontend", name: copy("frontEndDevelopment"), hue: 212 },
  { key: "design", name: copy("design"), hue: 286 },
  { key: "ai", name: copy("artificialIntelligence"), hue: 168 },
  { key: "career", name: copy("careerGrowth"), hue: 28 },
];

export const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.name]),
);

export const COURSE_LEVEL_NAME: Record<CourseLevel, string> = {
  入门: copy("beginner"),
  进阶: copy("intermediate"),
  高级: copy("advanced"),
};

// 单节视频统一约 10s，节内放 4 个知识点 cue（演示 Video 章节标记）。
function lesson(id: string, title: string, opts?: { preview?: boolean; cues?: string[] }): Lesson {
  const cues = opts?.cues ?? [
    copy("overview"),
    copy("keyPointsDisassembly"),
    copy("handsOnDemonstration"),
    copy("summary"),
  ];
  const markers = cues.map((title, i) => ({ time: i * 2.5, title }));
  return {
    id,
    title,
    duration: 600 + Math.round((id.length % 7) * 73),
    videoSrc: MP4,
    markers,
    preview: opts?.preview,
  };
}

export const courses: Course[] = [
  {
    id: "react-foundations",
    title: copy("reactModernFrontEndEngineeringBattle"),
    subtitle: copy("systemsLessonsFromComponentThinkingToHooksStateManagementAnd"),
    category: "frontend",
    tags: ["React", "Hooks", "TypeScript"],
    level: "进阶",
    instructor: {
      name: copy("hayashiMikawa"),
      title: copy("frontEndArchitectFormerManufacturerTechLead"),
    },
    rating: 4.8,
    ratingCount: 1263,
    students: 18420,
    price: 0,
    summary: copy("startingFromComponentizedThinkingThisCourseTakesYouThroughReact"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterComponentThinking"),
        lessons: [
          lesson("l1", copy("courseGuidanceAndEnvironmentConstruction"), { preview: true }),
          lesson("l2", copy("componentsPropsAndCombinationsOutperformInheritance")),
          lesson("l3", copy("controlledVsUncontrolledComponents")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterHooksModelOfMind"),
        lessons: [
          lesson("l4", copy("usestateAndRenderingTiming"), {
            cues: [
              copy("closureTrap"),
              copy("batchProcessing"),
              copy("functionalUpdates"),
              copy("summary"),
            ],
          }),
          lesson("l5", copy("useeffectDependenciesAndCleanup")),
          lesson("l6", copy("usememoUseCallbackWhenToUse")),
        ],
      },
      {
        id: "c3",
        title: copy("chapterStateManagementAndPerformance"),
        lessons: [
          lesson("l7", copy("contextCorrectPosture")),
          lesson("l8", copy("listVirtualizationAndRenderingPerformance")),
          lesson("l9", copy("projectsInActionDashboardRefactoring")),
        ],
      },
    ],
    files: [
      {
        name: copy("courseMaterials"),
        type: "folder",
        children: [
          { name: copy("courseOutlinePdf"), type: "file", size: "240 KB" },
          { name: copy("sampleSourceCodeZip"), type: "file", size: "1.8 MB" },
          { name: copy("exerciseQuestionsAndAnswersMd"), type: "file", size: "36 KB" },
        ],
      },
      { name: copy("cheatSheetHooksPdf"), type: "file", size: "120 KB" },
    ],
    seedEnrolled: true,
    seedCompletedLessonIds: ["l1", "l2", "l3", "l4"],
  },
  {
    id: "ts-deep-dive",
    title: copy("typescriptTypeGymnasticsAdvanced"),
    subtitle: copy("writeTheTypeSystemAsALanguageAndEradicateAny"),
    category: "frontend",
    tags: ["TypeScript", copy("typeSystem")],
    level: "高级",
    instructor: { name: copy("shenMo"), title: copy("openSourceAuthorTypeToolLibraryMaintainer") },
    rating: 4.9,
    ratingCount: 642,
    students: 7310,
    price: 199,
    summary: copy("genericsConditionTypesMappingTypesTemplateLiteralsThisLessonTakes"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterGenericsAndConstraints"),
        lessons: [
          lesson("t1", copy("natureOfGenerics"), { preview: true }),
          lesson("t2", copy("constraintsAndDefaultTypes")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterTypeOperations"),
        lessons: [
          lesson("t3", copy("conditionTypesAndInfers")),
          lesson("t4", copy("mappingTypesAndKeyRemapping")),
          lesson("t5", copy("templateLiteralsType")),
        ],
      },
    ],
    files: [{ name: copy("typeChallengeQuestionsZip"), type: "file", size: "420 KB" }],
  },
  {
    id: "ui-design-systems",
    title: copy("designTheSystemFromTo"),
    subtitle: copy("engineeringForTokenComponentLibraryAndDesignRDCollaboration"),
    category: "design",
    tags: [copy("designSystem"), "Design Token", "Figma"],
    level: "进阶",
    instructor: { name: copy("suWan"), title: copy("seniorProductDesignerHeadOfDesignSystems") },
    rating: 4.7,
    ratingCount: 389,
    students: 5120,
    price: 299,
    summary: copy("theDesignSystemIsNotAUIKitButA"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterTheTokenSystem"),
        lessons: [
          lesson("d1", copy("whatIsADesignToken"), { preview: true }),
          lesson("d2", copy("semanticLayerVsBasicLayer")),
          lesson("d3", copy("darkModeMultiTopics")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterComponentLibraryProject"),
        lessons: [
          lesson("d4", copy("componentAPIDesignPrinciples")),
          lesson("d5", copy("accessibilityAndComposability")),
        ],
      },
    ],
    files: [
      { name: copy("tokenSpecificationTemplatePdf"), type: "file", size: "180 KB" },
      { name: copy("figmaVariableExportExampleJson"), type: "file", size: "64 KB" },
    ],
    seedEnrolled: true,
    seedCompletedLessonIds: ["d1"],
  },
  {
    id: "motion-design",
    title: copy("interfaceDynamicEffectDesignAndImplementation"),
    subtitle: copy("makingInteractionsAlivePrinciplesCurvesAndPerformanceOfDynamics"),
    category: "design",
    tags: [copy("dynamicEffect"), copy("interaction"), "CSS"],
    level: "入门",
    instructor: { name: copy("heWei"), title: copy("dynamicDesigner") },
    rating: 4.6,
    ratingCount: 271,
    students: 3980,
    price: 0,
    summary: copy("fromDisneySTwelvePrinciplesToTheEasingCurveTo"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterPrincipleOfKineticEffect"),
        lessons: [
          lesson("m1", copy("whyDoesKineticEffectExist"), { preview: true }),
          lesson("m2", copy("easingCurvesAndRhythms")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterWebImplementation"),
        lessons: [
          lesson("m3", copy("transformWithSyntheticLayer")),
          lesson("m4", copy("reducedMotionAndAccessibility")),
        ],
      },
    ],
    files: [{ name: copy("easingCurveQuickCheckPdf"), type: "file", size: "96 KB" }],
  },
  {
    id: "llm-app-dev",
    title: copy("practicalApplicationDevelopmentOfLargeModels"),
    subtitle: copy("fromPromptEngineeringToRagAgentToolCalls"),
    category: "ai",
    tags: ["LLM", "RAG", "Agent"],
    level: "进阶",
    instructor: { name: copy("zhouYe"), title: copy("aiApplicationEngineer") },
    rating: 4.8,
    ratingCount: 904,
    students: 12060,
    price: 399,
    summary: copy("thisCourseFocusesOnLandingHowToConnectLargeModels"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterPromptProject"),
        lessons: [
          lesson("a1", copy("promptSStructuredDesign"), { preview: true }),
          lesson("a2", copy("fewShotAndThoughtChain")),
          lesson("a3", copy("outputConstraintsAndStructuralAnalysis")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterRagRetrievalEnhancement"),
        lessons: [
          lesson("a4", copy("vectorRetrievalAndSlicingStrategies")),
          lesson("a5", copy("rearrangementAndRecallEvaluation")),
        ],
      },
      {
        id: "c3",
        title: copy("chapterAgentAndToolCalls"),
        lessons: [
          lesson("a6", copy("toolCallProtocol")),
          lesson("a7", copy("multiStepTaskChoreographyAndGuardrails")),
        ],
      },
    ],
    files: [
      {
        name: copy("projectCode"),
        type: "folder",
        children: [
          { name: "rag-starter.zip", type: "file", size: "2.4 MB" },
          { name: "agent-demo.zip", type: "file", size: "1.1 MB" },
        ],
      },
      { name: copy("promptTemplateSetMd"), type: "file", size: "52 KB" },
    ],
  },
  {
    id: "ml-foundations",
    title: copy("fundamentalsOfMachineLearningMathematics"),
    subtitle: copy("linearAlgebraProbabilityAndOptimizationCompletingTheFoundationOfML"),
    category: "ai",
    tags: [copy("mathematics"), copy("machineLearning")],
    level: "入门",
    instructor: { name: copy("huoQing"), title: copy("doctorOfAppliedMathematics") },
    rating: 4.5,
    ratingCount: 188,
    students: 2640,
    price: 0,
    summary: copy("useGeometricIntuitionToUnderstandLinearAlgebraProbabilityDistributionAnd"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterLinearAlgebraicIntuition"),
        lessons: [
          lesson("g1", copy("vectorAndSpace"), { preview: true }),
          lesson("g2", copy("matricesAreTransformations")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterProbabilityAndOptimization"),
        lessons: [
          lesson("g3", copy("distributionAndExpectations")),
          lesson("g4", copy("gradientDescentGeometry")),
        ],
      },
    ],
    files: [{ name: copy("formulaManualPdf"), type: "file", size: "210 KB" }],
  },
  {
    id: "tech-communication",
    title: copy("engineerExpressionAndInfluence"),
    subtitle: copy("writeTechnicalDocumentationClarifyScenariosAndPromoteCrossTeamCollaboration"),
    category: "career",
    tags: [copy("communication"), copy("document"), copy("collaboration")],
    level: "入门",
    instructor: { name: copy("heYi"), title: copy("technicalDirector") },
    rating: 4.7,
    ratingCount: 333,
    students: 4480,
    price: 99,
    summary: copy("technicalAbilityDeterminesTheLowerLimitExpressionAndInfluenceDetermine"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterStructuredExpression"),
        lessons: [
          lesson("p1", copy("pyramidPrinciple"), { preview: true }),
          lesson("p2", copy("makingComplexitySimple")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterTechnicalWriting"),
        lessons: [
          lesson("p3", copy("readerAwarenessOfDocuments")),
          lesson("p4", copy("reviewAndPersuasion")),
        ],
      },
    ],
    files: [{ name: copy("documentTemplatesZip"), type: "file", size: "88 KB" }],
  },
  {
    id: "career-growth",
    title: copy("programmerCareerAdvancementMap"),
    subtitle: copy("planYourTechnicalAndCareerPathFromJuniorToSenior"),
    category: "career",
    tags: [copy("careerPlanning"), copy("promotion")],
    level: "进阶",
    instructor: { name: copy("lori"), title: copy("headOfTechnicalRecruitmentCareerCoach") },
    rating: 4.4,
    ratingCount: 142,
    students: 1980,
    price: 149,
    summary: copy("useAMapToSeeWhatAbilitiesShouldBeAccumulated"),
    chapters: [
      {
        id: "c1",
        title: copy("chapterAbilityCoordinates"),
        lessons: [
          lesson("r1", copy("technicalDepthAndBreadth"), { preview: true }),
          lesson("r2", copy("sourcesOfInfluence")),
        ],
      },
      {
        id: "c2",
        title: copy("chapterPromotionAndJobHopping"),
        lessons: [
          lesson("r3", copy("preparingForPromotionReview")),
          lesson("r4", copy("interviewsAndSalaryTalks")),
        ],
      },
    ],
    files: [{ name: copy("competencySelfAssessmentFormPdf"), type: "file", size: "72 KB" }],
  },
];

// ── 派生查询 ────────────────────────────────────────────────
export const courseById: Record<string, Course> = Object.fromEntries(courses.map((c) => [c.id, c]));

export function allLessons(course: Course): Lesson[] {
  return course.chapters.flatMap((ch) => ch.lessons);
}

export function lessonCount(course: Course): number {
  return allLessons(course).length;
}

/** 课程总时长（分钟，向上取整）。 */
export function totalMinutes(course: Course): number {
  return Math.round(allLessons(course).reduce((s, l) => s + l.duration, 0) / 60);
}

export function firstLessonId(course: Course): string {
  return allLessons(course)[0]?.id ?? "";
}

/** 在课程内定位某节，并给出上一节/下一节 id（用于结束屏「下一节」）。 */
export function locateLesson(
  course: Course,
  lessonId: string,
): { chapter: Chapter; lesson: Lesson; prevId?: string; nextId?: string } | null {
  const flat = allLessons(course);
  const idx = flat.findIndex((l) => l.id === lessonId);
  if (idx === -1) return null;
  const lesson = flat[idx];
  const chapter = course.chapters.find((ch) => ch.lessons.some((l) => l.id === lessonId))!;
  return {
    chapter,
    lesson,
    prevId: flat[idx - 1]?.id,
    nextId: flat[idx + 1]?.id,
  };
}

export function priceLabel(price: number): string {
  return price === 0 ? copy("free") : `¥${price}`;
}

// 讨论区 mock（按课程粗分，演示嵌套 Comment）。
export const discussionsByCourse: Record<string, Discussion[]> = {
  "react-foundations": [
    {
      id: "q1",
      author: copy("xiaXiaoman"),
      role: copy("learners"),
      datetime: copy("daysAgo"),
      content: copy("theClosureTrapMentionedInSectionIsTooInPlace"),
      likes: 18,
      replies: [
        {
          id: "q1r1",
          author: copy("hayashiMikawa"),
          role: copy("instructor"),
          datetime: copy("dayAgo"),
          content: copy("rememberThatEachRenderHasItsOwnSnapshotOfThe"),
          likes: 9,
        },
      ],
    },
    {
      id: "q2",
      author: copy("chenQi"),
      role: copy("learners"),
      datetime: copy("daysAgoAlternate"),
      content: copy("inTheVirtualizationSchemeInSectionWhatShouldBeDone"),
      likes: 6,
    },
  ],
};

export function discussionsOf(courseId: string): Discussion[] {
  return discussionsByCourse[courseId] ?? [];
}
