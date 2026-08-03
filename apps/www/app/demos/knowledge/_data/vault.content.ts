import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    frontEndArchitectureOverviewTheHankuFrontEndIsBased:
      "# 前端架构总览\n\n瀚库前端基于 **Next.js App Router** + `@hulianui/ui` 组件库，强约束「100% dogfood」。\n\n## 分层\n\n- **L1 设计 Token**：单一真源，所有颜色/圆角/间距走 CSS 变量。\n- **L2 组件库**：零依赖自研为主，复杂交互薄包 Base UI。\n- **L3 业务**：demo / 内部后台，只消费 L2，不手搓等价物。\n\n## 约定\n\n1. 撞缺口 → 回库修组件，不在业务层打 CSS 补丁。\n2. 每个增删改动作都要有 `toast` 反馈。\n3. 危险操作走 Popconfirm / AlertDialog 二次确认。\n\n> 详见 [组件库规范](#) 与 [接口约定](#)。",
    designTokenSpecificationTheDesignTokenIsTheSingleSource:
      "# 设计 Token 规范\n\n设计 Token 是瀚库视觉的**单一真源**。禁止在业务层硬编码颜色。\n\n## 语义色\n\n| Token | 用途 |\n| --- | --- |\n| `--primary` | 主色 / 强调 |\n| `--surface` | 卡片 / 面板背景 |\n| `--danger` | 危险 / 删除 |\n\n## 圆角\n\n统一 `--radius`，小方控件用 `min(var(--radius), ...)` 防变成正圆。",
    prdTeamKnowledgeBaseVBackgroundTheResearchAndDevelopment:
      "# PRD · 团队知识库 v2\n\n## 背景\n\n研发资料散落在 IM、网盘、本地，检索成本高。需要一个**带搜索 / 版本 / 协作**的统一知识库。\n\n## 核心功能\n\n- [x] 目录树导航 + 树内搜索\n- [x] 文档在线编辑（Markdown）\n- [x] 文件上传 + 图片全屏预览\n- [ ] 全文检索（二期）\n\n## 非目标\n\n- 不做实时多人协同编辑（二期评估）。",
    rDCenterTheRDCenterSArchitectureDocuments:
      "# 研发中心\n\n研发中心的架构文档、组件规范与接口约定都在这里。新人请先读 **前端架构总览**。",
    rDCenter: "研发中心",
    forestIsland: "林屿",
    chenMo: "陈墨",
    sunHao: "孙昊",
    designSpecifications: "设计规范",
    yangShu: "杨舒",
    productDocumentation: "产品文档",
    zhouQi: "周琦",
    materialLibrary: "素材库",
    archive: "归档",
    frontendArchitectureOverviewMd: "前端架构总览.md",
    architecture: "架构",
    requiredReading: "必读",
    componentLibrarySpecificationMd: "组件库规范.md",
    componentLibrarySpecificationsZeroDependencyOnAllComponentsIsPreferred:
      "# 组件库规范\n\n所有组件零依赖优先，复杂交互薄包 Base UI。命名 kebab-case，导出走 barrel。",
    specification: "规范",
    interfaceConventions: "接口约定",
    restDesignMd: "REST 设计.md",
    restDesignResourcesUsePluralNounsAndActOnHTTP:
      "# REST 设计\n\n资源用复数名词，动作用 HTTP 方法。错误体统一 `{ code, message }`。",
    errorCodeTableMd: "错误码表.md",
    qianWen: "钱文",
    errorCodeTableCodeMeaningMissingParameterNotLoggedIn:
      "# 错误码表\n\n| code | 含义 |\n| --- | --- |\n| 40001 | 参数缺失 |\n| 40101 | 未登录 |",
    designTokenMd: "设计 Token.md",
    moJin: "墨瑾",
    brandSwatchesPng: "品牌色板.png",
    brandSwatches: "品牌色板",
    componentVisualSpecificationMd: "组件视觉规范.md",
    componentVisionSpecificationLeaveTheCardBlankFor16pxAnd:
      "# 组件视觉规范\n\n卡片留白 16px，阴影分三档。图标线宽 1.5。",
    prdKnowledgeBaseVMd: "PRD-知识库 v2.md",
    competitorAnalysisMd: "竞品分析.md",
    wangYa: "王雅",
    competitorAnalysisNotionSparrowConfluenceComparisonEditingExperiencePermissionGranularity:
      "# 竞品分析\n\nNotion / 语雀 / Confluence 对比：编辑体验、权限粒度、检索能力。",
    homePosterPng: "首页海报.png",
    productLaunchPoster: "产品发布海报",
    bannerDesignDraftPng: "Banner 设计稿.png",
    eventBanner: "活动 Banner",
    prototypeScreenshotPng: "原型截图.png",
    editorPrototype: "编辑器原型",
    emptyStateIllustrationPng: "空状态插画.png",
    emptyStateIllustration: "空状态插画",
    interactionSpecificationsPdf: "交互规格.pdf",
    supplementalLEnginePriorityPrinciple: "补充 L2 引擎优先原则",
    addInterfaceConventionLink: "新增接口约定链接",
    rewriteLayeredChapters: "重写分层章节",
    firstDraft: "初稿",
    roundingCornerAntiRoundingConvention: "补圆角防正圆约定",
    semanticColorChart: "语义色表",
    system: "系统",
    updates: "更新内容",
    create: "创建",
    untitledDocumentMd: "未命名文档.md",
    justNow: "刚刚",
    newDocumentTemplate: "# {0}\n\n开始编写……",
    newDocumentCreated: "已新建文档",
    newFolder: "新建文件夹",
    newFolderCreated: "已新建文件夹",
    renamed: "已重命名",
    nodeDoesNotExist: "节点不存在",
    deleted: "已删除",
    rootDirectory: "根目录",
    movedItemCount: "已移动 {0} 项",
    to: "至「{0}」",
    uploadedFileCount: "已上传 {0} 个文件",
  },
  en: {
    frontEndArchitectureOverviewTheHankuFrontEndIsBased:
      "# Front-end Architecture Overview\n\nHanVault uses the **Next.js App Router** and the `@hulianui/ui` component library. Product surfaces dogfood HulianUI end to end.\n\n## Layers\n\n- **L1 · Design tokens**: CSS variables are the single source for color, radius, and spacing.\n- **L2 · Component library**: HulianUI owns reusable behavior and styling; complex interactions build on Base UI.\n- **L3 · Product**: demos and internal tools consume L2 components instead of recreating them locally.\n\n## Conventions\n\n1. When a component is missing a capability, fix it in the library instead of adding product-only CSS patches.\n2. Every create, update, and delete action provides toast feedback.\n3. Destructive actions require confirmation through Popconfirm or AlertDialog.\n\n> See [Component Library Specification](#) and [API Conventions](#) for details.",
    designTokenSpecificationTheDesignTokenIsTheSingleSource:
      "# Design Token Specification\n\nDesign tokens are the **single source of truth** for HanVault's visual system. Do not hard-code product colors.\n\n## Semantic colors\n\n| Token | Purpose |\n| --- | --- |\n| `--primary` | Brand and emphasis |\n| `--surface` | Cards and panel backgrounds |\n| `--danger` | Destructive actions and errors |\n\n## Radius\n\nUse `--radius` consistently. For small square controls, cap the radius with `min(var(--radius), ...)` so they do not become circles.",
    prdTeamKnowledgeBaseVBackgroundTheResearchAndDevelopment:
      "# PRD · Team Knowledge Base v2\n\n## Background\n\nEngineering material is scattered across chat, shared drives, and local folders. The team needs one **searchable, versioned, collaborative knowledge base**.\n\n## Core features\n\n- [x] Directory navigation and tree search\n- [x] Online Markdown editing\n- [x] File upload and full-screen image preview\n- [ ] Full-text retrieval (Phase 2)\n\n## Out of scope\n\n- Real-time multiplayer editing remains a Phase 2 evaluation item.",
    rDCenterTheRDCenterSArchitectureDocuments:
      "# R&D Center\n\nArchitecture notes, component specifications, and API conventions live here. New team members should start with **Front-end Architecture Overview**.",
    rDCenter: "R&D Center",
    forestIsland: "Lin Yu",
    chenMo: "Chen Mo",
    sunHao: "Sun Hao",
    designSpecifications: "Design Specifications",
    yangShu: "Yang Shu",
    productDocumentation: "Product documentation",
    zhouQi: "Zhou Qi",
    materialLibrary: "Material Library",
    archive: "Archive",
    frontendArchitectureOverviewMd: "Frontend Architecture Overview.md",
    architecture: "Architecture",
    requiredReading: "Required reading",
    componentLibrarySpecificationMd: "Component Library Specification.md",
    componentLibrarySpecificationsZeroDependencyOnAllComponentsIsPreferred:
      "# Component Library Specification\n\nPrefer dependency-free components. For complex interaction primitives, use a thin Base UI adapter. Name files in kebab-case and export public components through the package barrel.",
    specification: "Specification",
    interfaceConventions: "Interface conventions",
    restDesignMd: "REST API Design.md",
    restDesignResourcesUsePluralNounsAndActOnHTTP:
      "# REST API Design\n\nUse plural resource nouns and standard HTTP methods. Return errors with the shared `{ code, message }` shape.",
    errorCodeTableMd: "Error code table.md",
    qianWen: "Qian Wen",
    errorCodeTableCodeMeaningMissingParameterNotLoggedIn:
      "# Error code table\n\n| code | Meaning |\n| --- | --- |\n| 40001 | Missing parameter |\n| 40101 | Not logged in |",
    designTokenMd: "Design Token.md",
    moJin: "Mo Jin",
    brandSwatchesPng: "Brand Swatches.png",
    brandSwatches: "Brand swatches",
    componentVisualSpecificationMd: "Component Visual Specification.md",
    componentVisionSpecificationLeaveTheCardBlankFor16pxAnd:
      "# Component Visual Specification\n\nUse 16px of internal card spacing, three elevation levels, and a 1.5px icon stroke.",
    prdKnowledgeBaseVMd: "PRD-Knowledge Base v2.md",
    competitorAnalysisMd: "Competitor Analysis.md",
    wangYa: "Wang Ya",
    competitorAnalysisNotionSparrowConfluenceComparisonEditingExperiencePermissionGranularity:
      "# Competitor Analysis\n\nCompare Notion, Lark, and Confluence across editing experience, permission granularity, and search quality.",
    homePosterPng: "Home Poster.png",
    productLaunchPoster: "Product launch poster",
    bannerDesignDraftPng: "Banner Design Draft.png",
    eventBanner: "Event banner",
    prototypeScreenshotPng: "Prototype screenshot.png",
    editorPrototype: "Editor prototype",
    emptyStateIllustrationPng: "Empty state illustration.png",
    emptyStateIllustration: "Empty state illustration",
    interactionSpecificationsPdf: "Interaction Specifications.pdf",
    supplementalLEnginePriorityPrinciple: "Add L2 component-first guidance",
    addInterfaceConventionLink: "Add interface convention link",
    rewriteLayeredChapters: "Rewrite layered chapters",
    firstDraft: "First draft",
    roundingCornerAntiRoundingConvention: "Document radius caps for square controls",
    semanticColorChart: "Add semantic color table",
    system: "System",
    updates: "Updates",
    create: "Create",
    untitledDocumentMd: "Untitled Document.md",
    justNow: "Just now",
    newDocumentTemplate: "# {0}\n\nStart writing...",
    newDocumentCreated: "Document created",
    newFolder: "New folder",
    newFolderCreated: "Folder created",
    renamed: "Renamed",
    nodeDoesNotExist: "Node does not exist",
    deleted: "Deleted",
    rootDirectory: "Root directory",
    movedItemCount: "Moved {0} items",
    to: 'to "{0}"',
    uploadedFileCount: "Uploaded {0} files",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-knowledge-data-vault",
  content: t(content),
};

export default dictionary;
