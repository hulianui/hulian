import type { Chapter, Course, CourseCategory, Discussion, Lesson } from "./types";

// 复用库里唯一可用的本地 mp4（约 10s）——离线无法程序化生成真 mp4，章节标记在单条视频内分段演示。
const MP4 = "/demo/sample-video.mp4";

export const CATEGORIES: CourseCategory[] = [
  { key: "frontend", name: "前端开发", hue: 212 },
  { key: "design", name: "设计", hue: 286 },
  { key: "ai", name: "人工智能", hue: 168 },
  { key: "career", name: "职业成长", hue: 28 },
];

export const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.name]),
);

// 单节视频统一约 10s，节内放 4 个知识点 cue（演示 Video 章节标记）。
function lesson(id: string, title: string, opts?: { preview?: boolean; cues?: string[] }): Lesson {
  const cues = opts?.cues ?? ["概览", "要点拆解", "实操演示", "小结"];
  const markers = cues.map((title, i) => ({ time: i * 2.5, title }));
  return { id, title, duration: 600 + Math.round((id.length % 7) * 73), videoSrc: MP4, markers, preview: opts?.preview };
}

export const courses: Course[] = [
  {
    id: "react-foundations",
    title: "React 现代前端工程实战",
    subtitle: "从组件化思维到 Hooks、状态管理与性能优化的系统课",
    category: "frontend",
    tags: ["React", "Hooks", "TypeScript"],
    level: "进阶",
    instructor: { name: "林见川", title: "前端架构师 · 前大厂 Tech Lead" },
    rating: 4.8,
    ratingCount: 1263,
    students: 18420,
    price: 0,
    summary:
      "本课程从**组件化思维**出发，带你吃透 React 的渲染模型、Hooks 心智模型与状态管理范式，并落到真实项目的性能优化。\n\n- 不堆 API，讲清「为什么这样设计」\n- 每章配可运行示例与练习\n- 覆盖 TypeScript 类型体操在组件中的实战",
    chapters: [
      {
        id: "c1",
        title: "第一章 · 组件化思维",
        lessons: [
          lesson("l1", "01 课程导学与环境搭建", { preview: true }),
          lesson("l2", "02 组件、Props 与组合优于继承"),
          lesson("l3", "03 受控与非受控组件"),
        ],
      },
      {
        id: "c2",
        title: "第二章 · Hooks 心智模型",
        lessons: [
          lesson("l4", "04 useState 与渲染时机", { cues: ["闭包陷阱", "批处理", "函数式更新", "小结"] }),
          lesson("l5", "05 useEffect 依赖与清理"),
          lesson("l6", "06 useMemo / useCallback 何时该用"),
        ],
      },
      {
        id: "c3",
        title: "第三章 · 状态管理与性能",
        lessons: [
          lesson("l7", "07 Context 的正确姿势"),
          lesson("l8", "08 列表虚拟化与渲染性能"),
          lesson("l9", "09 项目实战：仪表盘重构"),
        ],
      },
    ],
    files: [
      {
        name: "课程资料",
        type: "folder",
        children: [
          { name: "课程大纲.pdf", type: "file", size: "240 KB" },
          { name: "示例源码.zip", type: "file", size: "1.8 MB" },
          { name: "练习题与答案.md", type: "file", size: "36 KB" },
        ],
      },
      { name: "速查表-Hooks.pdf", type: "file", size: "120 KB" },
    ],
    seedEnrolled: true,
    seedCompletedLessonIds: ["l1", "l2", "l3", "l4"],
  },
  {
    id: "ts-deep-dive",
    title: "TypeScript 类型体操进阶",
    subtitle: "把类型系统当成一门语言来写，根治「any 漫天飞」",
    category: "frontend",
    tags: ["TypeScript", "类型系统"],
    level: "高级",
    instructor: { name: "沈墨", title: "开源作者 · 类型工具库维护者" },
    rating: 4.9,
    ratingCount: 642,
    students: 7310,
    price: 199,
    summary:
      "泛型、条件类型、映射类型、模板字面量类型——本课带你把 TypeScript 类型系统玩成一门**图灵完备的语言**，并落到真实的库类型设计。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · 泛型与约束",
        lessons: [lesson("t1", "01 泛型的本质", { preview: true }), lesson("t2", "02 约束与默认类型")],
      },
      {
        id: "c2",
        title: "第二章 · 类型运算",
        lessons: [
          lesson("t3", "03 条件类型与 infer"),
          lesson("t4", "04 映射类型与 key remapping"),
          lesson("t5", "05 模板字面量类型"),
        ],
      },
    ],
    files: [{ name: "类型挑战 100 题.zip", type: "file", size: "420 KB" }],
  },
  {
    id: "ui-design-systems",
    title: "设计系统从 0 到 1",
    subtitle: "Token、组件库与设计-研发协作的工程化落地",
    category: "design",
    tags: ["设计系统", "Design Token", "Figma"],
    level: "进阶",
    instructor: { name: "苏晚", title: "资深产品设计师 · 设计系统负责人" },
    rating: 4.7,
    ratingCount: 389,
    students: 5120,
    price: 299,
    summary:
      "设计系统不是一套 UI Kit，而是**一致性的工程化基础设施**。本课从 Design Token 体系讲到组件库 API 设计与设计-研发的协作流程。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · Token 体系",
        lessons: [
          lesson("d1", "01 什么是设计 Token", { preview: true }),
          lesson("d2", "02 语义层 vs 基础层"),
          lesson("d3", "03 暗色模式与多主题"),
        ],
      },
      {
        id: "c2",
        title: "第二章 · 组件库工程",
        lessons: [lesson("d4", "04 组件 API 设计原则"), lesson("d5", "05 无障碍与可组合性")],
      },
    ],
    files: [
      { name: "Token 规范模板.pdf", type: "file", size: "180 KB" },
      { name: "Figma 变量导出示例.json", type: "file", size: "64 KB" },
    ],
    seedEnrolled: true,
    seedCompletedLessonIds: ["d1"],
  },
  {
    id: "motion-design",
    title: "界面动效设计与实现",
    subtitle: "让交互「有生命」——动效的原则、曲线与性能",
    category: "design",
    tags: ["动效", "交互", "CSS"],
    level: "入门",
    instructor: { name: "何缦", title: "动效设计师" },
    rating: 4.6,
    ratingCount: 271,
    students: 3980,
    price: 0,
    summary: "从迪士尼十二原则到缓动曲线，再到 Web 动效的性能边界，建立你的动效审美与工程直觉。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · 动效原则",
        lessons: [lesson("m1", "01 动效为何存在", { preview: true }), lesson("m2", "02 缓动曲线与节奏")],
      },
      {
        id: "c2",
        title: "第二章 · Web 实现",
        lessons: [lesson("m3", "03 transform 与合成层"), lesson("m4", "04 reduced-motion 与可达性")],
      },
    ],
    files: [{ name: "缓动曲线速查.pdf", type: "file", size: "96 KB" }],
  },
  {
    id: "llm-app-dev",
    title: "大模型应用开发实战",
    subtitle: "从 Prompt 工程到 RAG、Agent 与工具调用",
    category: "ai",
    tags: ["LLM", "RAG", "Agent"],
    level: "进阶",
    instructor: { name: "周野", title: "AI 应用工程师" },
    rating: 4.8,
    ratingCount: 904,
    students: 12060,
    price: 399,
    summary:
      "本课程聚焦**落地**：如何把大模型接进真实产品。从 Prompt 工程的工程化，到 RAG 检索增强、Agent 编排与工具调用，每章都有可跑的项目。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · Prompt 工程",
        lessons: [
          lesson("a1", "01 Prompt 的结构化设计", { preview: true }),
          lesson("a2", "02 Few-shot 与思维链"),
          lesson("a3", "03 输出约束与结构化解析"),
        ],
      },
      {
        id: "c2",
        title: "第二章 · RAG 检索增强",
        lessons: [lesson("a4", "04 向量检索与切片策略"), lesson("a5", "05 重排与召回评估")],
      },
      {
        id: "c3",
        title: "第三章 · Agent 与工具调用",
        lessons: [lesson("a6", "06 工具调用协议"), lesson("a7", "07 多步任务编排与护栏")],
      },
    ],
    files: [
      {
        name: "项目代码",
        type: "folder",
        children: [
          { name: "rag-starter.zip", type: "file", size: "2.4 MB" },
          { name: "agent-demo.zip", type: "file", size: "1.1 MB" },
        ],
      },
      { name: "Prompt 模板集.md", type: "file", size: "52 KB" },
    ],
  },
  {
    id: "ml-foundations",
    title: "机器学习数学基础",
    subtitle: "线性代数、概率与最优化——补齐 ML 的地基",
    category: "ai",
    tags: ["数学", "机器学习"],
    level: "入门",
    instructor: { name: "霍青", title: "应用数学博士" },
    rating: 4.5,
    ratingCount: 188,
    students: 2640,
    price: 0,
    summary: "不靠死记公式，用几何直觉理解线性代数、概率分布与梯度下降，为深入机器学习打牢地基。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · 线性代数直觉",
        lessons: [lesson("g1", "01 向量与空间", { preview: true }), lesson("g2", "02 矩阵即变换")],
      },
      {
        id: "c2",
        title: "第二章 · 概率与最优化",
        lessons: [lesson("g3", "03 分布与期望"), lesson("g4", "04 梯度下降几何")],
      },
    ],
    files: [{ name: "公式手册.pdf", type: "file", size: "210 KB" }],
  },
  {
    id: "tech-communication",
    title: "工程师的表达与影响力",
    subtitle: "写好技术文档、讲清方案、推动跨团队协作",
    category: "career",
    tags: ["沟通", "文档", "协作"],
    level: "入门",
    instructor: { name: "贺一", title: "技术总监" },
    rating: 4.7,
    ratingCount: 333,
    students: 4480,
    price: 99,
    summary: "技术能力决定下限，表达与影响力决定上限。本课教你结构化表达、写让人读得下去的文档、把方案讲到位。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · 结构化表达",
        lessons: [lesson("p1", "01 金字塔原理", { preview: true }), lesson("p2", "02 把复杂讲简单")],
      },
      {
        id: "c2",
        title: "第二章 · 技术写作",
        lessons: [lesson("p3", "03 文档的读者意识"), lesson("p4", "04 评审与说服")],
      },
    ],
    files: [{ name: "文档模板.zip", type: "file", size: "88 KB" }],
  },
  {
    id: "career-growth",
    title: "程序员职业进阶地图",
    subtitle: "从初级到资深，规划你的技术与职业路径",
    category: "career",
    tags: ["职业规划", "晋升"],
    level: "进阶",
    instructor: { name: "罗芮", title: "技术招聘负责人 · 职业教练" },
    rating: 4.4,
    ratingCount: 142,
    students: 1980,
    price: 149,
    summary: "用一张地图看清不同阶段该攒什么能力、避什么坑，把「努力」用在能复利的地方。",
    chapters: [
      {
        id: "c1",
        title: "第一章 · 能力坐标",
        lessons: [lesson("r1", "01 技术深度与广度", { preview: true }), lesson("r2", "02 影响力的来源")],
      },
      {
        id: "c2",
        title: "第二章 · 晋升与跳槽",
        lessons: [lesson("r3", "03 晋升评审准备"), lesson("r4", "04 面试与谈薪")],
      },
    ],
    files: [{ name: "能力自评表.pdf", type: "file", size: "72 KB" }],
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
  return price === 0 ? "免费" : `¥${price}`;
}

// 讨论区 mock（按课程粗分，演示嵌套 Comment）。
export const discussionsByCourse: Record<string, Discussion[]> = {
  "react-foundations": [
    {
      id: "q1",
      author: "夏小满",
      role: "学员",
      datetime: "2 天前",
      content: "第 4 节讲的闭包陷阱太到位了，之前一直没理解为什么 setState 拿到的是旧值。",
      likes: 18,
      replies: [
        {
          id: "q1r1",
          author: "林见川",
          role: "讲师",
          datetime: "1 天前",
          content: "👍 记住「每次渲染都有自己的一份 state 快照」就通了，函数式更新能绕开它。",
          likes: 9,
        },
      ],
    },
    {
      id: "q2",
      author: "陈起",
      role: "学员",
      datetime: "5 天前",
      content: "请问第 8 节的虚拟化方案，列表项高度不固定时怎么处理？",
      likes: 6,
    },
  ],
};

export function discussionsOf(courseId: string): Discussion[] {
  return discussionsByCourse[courseId] ?? [];
}
