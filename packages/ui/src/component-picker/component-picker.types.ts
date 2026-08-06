import type { ReactNode } from "react";

/**
 * 一条属性说明。字段全为可选（文档表格里缺列是常态），
 * 只有 `name` 必给——它是渲染 key 也是 `defaultPropsOf` 的键。
 */
export interface ComponentPickerProp {
  name: string;
  /** 类型串，原样保留文档写法（`"sm" ｜ "md"`）——组件不解析类型。 */
  type?: string;
  /** 默认值原文（`true` / `"md"` / `—`）。想要可用的值走 `defaultPropsOf`。 */
  default?: string;
  description?: string;
  /** 文档里名字后带 `*` 的项。 */
  required?: boolean;
}

/** 一段示例代码。 */
export interface ComponentPickerExample {
  /** 场景名（来自文档的 `## 示例` / `## 用法` 小节标题）。 */
  title?: string;
  /** 围栏语言标记（tsx / ts / bash…），透传给 CodeBlock。 */
  lang?: string;
  code: string;
}

/**
 * 目录条目。
 *
 * **组件不自己取数**：不 fetch、不解析、不假设运行环境有 `llms-full.txt`。
 * 数据由消费方喂进来；要从 `llms-full.txt` 生成，在你自己那层调
 * `parseComponentCatalog(text)`（纯函数，Node / 构建期 / 浏览器都能跑）。
 */
export interface ComponentPickerItem {
  /** 唯一键，也是 `onSelect` 的第一个入参。 */
  slug: string;
  /** 展示名（PascalCase 导出名）。 */
  name: string;
  /** 一句话说明。 */
  description: string;
  /** 一级分类（layout / forms / data-display…）。 */
  category: string;
  /** 二级分组（container / advanced / collection…）；无分组给空串。 */
  group: string;
  tags?: string[];
  props?: ComponentPickerProp[];
  examples?: ComponentPickerExample[];
}

/**
 * 分类树节点（**纯数据**：label 是字符串不是 ReactNode）。
 * 渲染成 `<Tree>` 由组件负责，所以 `buildCategoryTree` 不依赖 React。
 */
export interface ComponentPickerCategoryNode {
  /** `"*"` = 全部；`"cat:forms"`；`"cat:forms/group:advanced"`。 */
  key: string;
  label: string;
  /** 该节点覆盖的条目数。 */
  count: number;
  children?: ComponentPickerCategoryNode[];
}

/** 浏览器的筛选态。 */
export interface ComponentPickerFilter {
  /** 分类树选中的 key（`buildCategoryTree` 产出的 key，或裸 category 名）。 */
  category?: string;
  /** 搜索词。空串 = 不过滤，按 `items` 原序展示。 */
  search?: string;
}

/** 全部界面文案。库内默认 zh-CN，按需整体或逐条覆盖。 */
export interface ComponentPickerLabels {
  searchPlaceholder: string;
  /** 分类树的无障碍名。 */
  categoryTree: string;
  /** 分类树根节点文案。 */
  allCategories: string;
  /** 结果区 listbox 的无障碍名。 */
  results: string;
  /** 结果条数（渲染在搜索框右侧）。 */
  resultCount: (count: number, total: number) => string;
  /** 无匹配结果时的空态。 */
  noResultTitle: string;
  noResultDescription: string;
  /** `items` 本身为空时的空态。 */
  emptyCatalogTitle: string;
  emptyCatalogDescription: string;
  /** 详情面板的无障碍名。 */
  detail: string;
  previewTitle: string;
  /** 未传 `renderPreview` 时的占位文案。 */
  previewPlaceholder: string;
  propsTitle: string;
  noProps: string;
  propName: string;
  propType: string;
  propDefault: string;
  propDescription: string;
  examplesTitle: string;
  noExamples: string;
  /** 详情面板底部的确认按钮。 */
  select: string;
}

export interface ComponentPickerProps {
  /** 组件目录。空数组渲染空态。 */
  items: ComponentPickerItem[];
  /**
   * 受控筛选态。传了就必须接 `onFilterChange`，否则搜索框和分类树点了不动
   * （家风同 Tree 的 selectedKeys）。只想给个初值用 `defaultFilter`。
   */
  filter?: ComponentPickerFilter;
  /** 非受控初始筛选态。 */
  defaultFilter?: ComponentPickerFilter;
  onFilterChange?: (filter: ComponentPickerFilter) => void;
  /** 是否显示左侧分类树。@default true */
  showTree?: boolean;
  /** 详情面板是否显示预览区。@default false */
  showPreview?: boolean;
  /** 详情面板是否显示 Props 表。@default true */
  showProps?: boolean;
  /** 详情面板是否显示示例代码。@default true */
  showExamples?: boolean;
  /**
   * 注入 live 预览。**组件库自己渲染不了任意 slug 的实例**——它没有 slug→组件的映射，
   * 也不会 eval 字符串或塞 iframe。真要活预览，由消费方在自己那层建映射后从这里注入；
   * 不传则预览区显示占位。
   */
  renderPreview?: (item: ComponentPickerItem) => ReactNode;
  /** 确认选用某个组件（点详情面板按钮 / 结果项上按 Enter / 双击结果项）。 */
  onSelect?: (slug: string, props: Record<string, unknown>) => void;
  /** 受控高亮项（详情面板展示的那个）。 */
  activeSlug?: string | null;
  /** 非受控初始高亮项。 */
  defaultActiveSlug?: string | null;
  onActiveChange?: (slug: string | null) => void;
  /** 结果区最多渲染多少条（防 376 条一次性铺满）。@default 60 */
  maxResults?: number;
  labels?: Partial<ComponentPickerLabels>;
  /** 外层类名。**须给确定高度**（如 `h-[560px]`），组件内部按 flex 填满并各区独立滚动。 */
  className?: string;
}

export interface ComponentPickerCommandProps {
  items: ComponentPickerItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 选中一项（Enter / 点击）。第二参同 ComponentPicker：由 `defaultPropsOf` 派生。 */
  onSelect?: (slug: string, props: Record<string, unknown>) => void;
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** 最多列出多少条。@default 30 */
  maxResults?: number;
  /** 按 category 分组（每组一个 heading）。@default true */
  groupByCategory?: boolean;
  /** 内置 ⌘K / Ctrl+K 开合。@default false */
  shortcut?: boolean;
  className?: string;
  "aria-label"?: string;
}
